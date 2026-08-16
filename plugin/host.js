// Miku-chan Balance Mascot — Host half (v8: cute + TTS)
// DeepSeek Harness (DSH) 动态 Cordis 插件 Host 端源码。
// 功能：余额查询、会话 token 统计、系统 TTS 语音（SAPI 生成 WAV 经 webServer 提供）、动态工具 miku_status。
// 使用方式：把本文件内容作为 cordis_define 的 code.host 提交。

return {
  apply(ctx) {
    const usage = { input: 0, output: 0, calls: 0 }
    ctx.on('llm/stream', (options, next) => {
      const upstream = next()
      return (async function* () {
        for await (const chunk of upstream) {
          if (chunk && chunk.type === 'usage' && chunk.usage) {
            usage.input += chunk.usage.inputTokens || 0
            usage.output += chunk.usage.outputTokens || 0
            usage.calls += 1
          }
          yield chunk
        }
      })()
    }, { global: true, prepend: true })

    const fetchBalance = async () => {
      const credentials = ctx.get('credentials')
      if (!credentials) return { ok: false, reason: 'no-credentials' }
      let key
      try {
        const hit = await credentials.resolve('DEEPSEEK_API_KEY')
        key = hit ? hit.value : undefined
      } catch (e) {
        return { ok: false, reason: 'resolve', detail: String(e && e.message || e).slice(0, 200) }
      }
      if (!key) return { ok: false, reason: 'no-key' }
      const subprocess = ctx.get('subprocess')
      if (!subprocess) return { ok: false, reason: 'no-subprocess' }
      const sandboxPolicy = ctx.get('sandboxPolicy')
      const cwd = sandboxPolicy && sandboxPolicy.workspaceRoot ? sandboxPolicy.workspaceRoot : '.'
      try {
        const exe = await subprocess.resolveExecutable('curl')
        const handle = subprocess.spawn({
          argv: [exe, '-s', '-H', 'Authorization: Bearer ' + key, 'https://api.deepseek.com/user/balance'],
          cwd,
          stdio: { stdin: 'ignore', stdout: { maxBytes: 65536 }, stderr: { maxBytes: 4096 } },
          graceMs: 20000,
        })
        const outcome = await handle.done
        const out = handle.collected.stdout.readFrom(0).text
        const err = handle.collected.stderr.readFrom(0).text
        if (outcome.exitCode !== 0) {
          return { ok: false, reason: 'curl', detail: (err || String(outcome.exitCode)).slice(0, 300) }
        }
        const data = JSON.parse(out)
        const infos = (data.balance_infos || []).map((i) => ({
          currency: i.currency,
          total: Number(i.total_balance),
          granted: Number(i.granted_balance),
          toppedUp: Number(i.topped_up_balance),
        }))
        return { ok: true, isAvailable: !!data.is_available, infos }
      } catch (e) {
        return { ok: false, reason: 'error', detail: String(e && e.message || e).slice(0, 300) }
      }
    }

    harness.handle('miku/balance', async () => fetchBalance())
    harness.handle('miku/usage', async () => ({
      input: usage.input,
      output: usage.output,
      calls: usage.calls,
      total: usage.input + usage.output,
    }))

    // ---- 语音：TTS 目录在 apply 时缓存为绝对路径 ----
    const sp = ctx.get('sandboxPolicy')
    const ttsRoot = (sp && sp.workspaceRoot ? sp.workspaceRoot : '.') + '/.miku-tts'

    const toEncodedCommand = (script) => {
      // PowerShell -EncodedCommand 需要 UTF-16LE base64
      const bytes = []
      for (let i = 0; i < script.length; i++) {
        const code = script.charCodeAt(i)
        bytes.push(code & 0xff, (code >> 8) & 0xff)
      }
      return btoa(String.fromCharCode.apply(null, bytes))
    }

    const speakTts = async (text) => {
      const subprocess = ctx.get('subprocess')
      if (!subprocess) return { ok: false, reason: 'no-subprocess' }
      const file = 'sp_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + '.wav'
      const safeText = String(text).replace(/'/g, "''")
      const script = [
        "$ErrorActionPreference = 'Stop'",
        'Add-Type -AssemblyName System.Speech',
        "$dir = '" + ttsRoot + "'",
        'New-Item -ItemType Directory -Force -Path $dir | Out-Null',
        "$out = Join-Path $dir '" + file + "'",
        '$s = New-Object System.Speech.Synthesis.SpeechSynthesizer',
        "try { $s.SelectVoice('Microsoft Huihui Desktop') } catch {}",
        '$s.Rate = 1',
        '$s.Volume = 100',
        '$s.SetOutputToWaveFile($out)',
        "$s.Speak('" + safeText + "')",
        '$s.Dispose()',
        'Write-Output $out',
      ].join('; ')
      try {
        const exe = await subprocess.resolveExecutable('powershell')
        const handle = subprocess.spawn({
          argv: [exe, '-NoProfile', '-NonInteractive', '-EncodedCommand', toEncodedCommand(script)],
          cwd: ttsRoot,
          stdio: { stdin: 'ignore', stdout: { maxBytes: 65536 }, stderr: { maxBytes: 65536 } },
          graceMs: 30000,
        })
        const outcome = await handle.done
        const out = handle.collected.stdout.readFrom(0).text
        const err = handle.collected.stderr.readFrom(0).text
        if (outcome.exitCode !== 0) {
          return { ok: false, reason: 'tts', detail: (err || String(outcome.exitCode)).slice(0, 200) }
        }
        return { ok: true, url: '/miku-tts/' + file }
      } catch (e) {
        return { ok: false, reason: 'error', detail: String(e && e.message || e).slice(0, 200) }
      }
    }

    // 台词缓存：同一句不重复生成
    const ttsCache = new Map()
    harness.handle('miku/speak', async (args) => {
      const text = args && typeof args.text === 'string' ? args.text.slice(0, 60) : ''
      if (!text) return { ok: false, reason: 'empty' }
      if (ttsCache.has(text)) return { ok: true, url: ttsCache.get(text), cached: true }
      const result = await speakTts(text)
      if (result.ok) ttsCache.set(text, result.url)
      return result
    })

    // 提供 WAV 静态路由（路径在 apply 时已固定）
    const webServer = ctx.get('webServer')
    const fsSvc = ctx.get('fs')
    if (webServer && fsSvc) {
      ctx.effect(() => webServer.register({
        kind: 'prefix',
        path: '/miku-tts',
        handler: async (req, res) => {
          try {
            const raw = (req.url || '').split('?')[0].split('/').pop() || ''
            const name = decodeURIComponent(raw)
            if (!/^sp_\d+_\d+\.wav$/.test(name)) {
              res.writeHead(404, { 'Content-Type': 'text/plain' })
              res.end('bad name')
              return
            }
            const target = await fsSvc.resolve(ttsRoot + '/' + name)
            const bytes = await fsSvc.readBytes(target, undefined, 20 * 1024 * 1024)
            res.writeHead(200, {
              'Content-Type': 'audio/wav',
              'Content-Length': bytes.length,
              'Cache-Control': 'max-age=3600',
            })
            res.end(bytes)
          } catch (e) {
            res.writeHead(404, { 'Content-Type': 'text/plain' })
            res.end('err: ' + String(e && e.message || e).slice(0, 120))
          }
        },
      }))
    }

    const tool = harness.defineTool({
      name: 'miku_status',
      description: '查询 DeepSeek API 账户余额与本会话 token 消耗情况。当用户询问余额、话费、额度、token 用量时调用。',
      parameters: { type: 'object', properties: {} },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            summary: { type: 'string', required: true },
            balance: { type: 'object', additionalProperties: true },
            usage: { type: 'object', additionalProperties: true },
          },
        },
        render: (args, value) => [{ type: 'text', text: String(value.summary) }],
      },
      execute: async () => {
        const balance = await fetchBalance()
        const total = usage.input + usage.output
        let summary
        if (balance.ok && balance.infos && balance.infos.length > 0) {
          const info = balance.infos[0]
          summary = 'DeepSeek API 余额：' + info.currency + ' ' + info.total.toFixed(2) +
            '（赠送 ' + info.granted.toFixed(2) + '，充值 ' + info.toppedUp.toFixed(2) + '）'
        } else if (balance.ok) {
          summary = 'DeepSeek API 余额查询成功，但账户没有余额信息。'
        } else if (balance.reason === 'no-key') {
          summary = '尚未配置 DeepSeek API Key（DEEPSEEK_API_KEY），无法查询余额。'
        } else {
          summary = 'DeepSeek API 余额查询失败：' + (balance.reason || '未知错误')
        }
        summary += '。本会话已消耗 token：' + total + '（输入 ' + usage.input + '，输出 ' + usage.output + '）。'
        return {
          summary,
          balance,
          usage: { input: usage.input, output: usage.output, total },
        }
      },
    })
    harness.registerTool(ctx, tool)
  },
}
