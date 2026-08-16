// Miku-chan Balance Mascot — Host half
// DeepSeek Harness (DSH) 动态 Cordis 插件 Host 端源码。
// 功能：余额查询、会话 token 统计、动态工具 miku_status。
// 使用方式：把本文件内容作为 cordis_define 的 code.host 提交。

return {
  apply(ctx) {
    // ---- 会话 token 消耗统计（llm/stream waterfall）----
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

    // ---- 余额查询：凭证解析 + curl 调 DeepSeek balance API ----
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

    // ---- 动态工具：miku_status（模型也能回答余额问题）----
    // 必须先经 harness.defineTool 包装，才能注册为动态工具
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
