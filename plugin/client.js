// Miku-chan Balance Mascot — Client half (v8: cute + TTS)
// DeepSeek Harness (DSH) 动态 Cordis 插件 Client 端源码。
// 功能：初音绿主题覆盖 + 右下角更可爱的 Q 版初音未来（渐变/呆毛/眨眼/呼吸/说话嘴型/TTS 语音）。
// 使用方式：把本文件内容作为 cordis_define 的 code.client 提交。

return {
  inject: ['timer'],
  apply(ctx) {
    // ---- 初音绿主题覆盖 ----
    const theme = ctx.get('theme')
    if (theme) {
      ctx.effect(() => theme.overrideTokens('miku-green', {
        '--dsw-alias-brand-primary': { light: '#39C5BB', dark: '#4ED4C8' },
        '--dsw-alias-bg-base': { light: '#F4FBF9', dark: '#0D1615' },
        '--dsw-alias-bg-layer-1': { light: '#FFFFFF', dark: '#14201E' },
        '--dsw-alias-bg-layer-2': { light: '#E8F6F3', dark: '#1A2A27' },
        '--dsw-alias-bg-overlay': { light: '#FFFFFF', dark: '#14201E' },
        '--dsw-alias-border-l1': { light: '#D4EDE9', dark: '#23403C' },
        '--dsw-alias-border-l2': { light: '#AEDCD6', dark: '#2D524D' },
        '--dsw-alias-label-primary': { light: '#123B38', dark: '#E1F4F1' },
        '--dsw-alias-label-secondary': { light: '#4D7975', dark: '#9CC8C3' },
        '--dsw-alias-state-success-primary': { light: '#1FAF8F', dark: '#34D3AE' },
        '--dsw-alias-state-warn-primary': { light: '#E8A33D', dark: '#F0B95A' },
        '--dsw-specific-sidebar-fill': { light: '#E9F7F4', dark: '#101B19' },
      }))
    }

    // ---- 插件样式 ----
    styles.insert(`
.miku-widget { position: fixed; right: 18px; bottom: 16px; z-index: 9999; pointer-events: auto; user-select: none; font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.miku-bubble { position: absolute; right: 2px; bottom: 148px; width: 216px; background: linear-gradient(135deg, #ffffff 0%, #f2fcf9 100%); border: 2px solid #39C5BB; border-radius: 16px; padding: 10px 13px; font-size: 12.5px; line-height: 1.55; color: #123B38; box-shadow: 0 8px 28px rgba(57,197,187,.4); }
.miku-bubble::after { content: ''; position: absolute; right: 38px; bottom: -10px; border: 9px solid transparent; border-top-color: #39C5BB; }
.miku-bubble-title { font-weight: 700; color: #1FAF8F; margin-bottom: 3px; letter-spacing: .5px; }
.miku-bubble-sub { color: #4D7975; font-size: 11px; }
.miku-bubble-warn { border-color: #F0A93E; background: linear-gradient(135deg, #fffdf6 0%, #fff7e6 100%); }
.miku-bubble-warn::after { border-top-color: #F0A93E; }
.miku-bubble-warn .miku-bubble-title { color: #D97B1F; }
.miku-stage { position: relative; width: 150px; height: 158px; cursor: pointer; filter: drop-shadow(0 6px 14px rgba(57,197,187,.42)); transition: transform .15s; animation: miku-idle 3.2s ease-in-out infinite; transform-origin: 50% 100%; }
.miku-stage:hover { transform: translateY(-3px); }
.miku-stage:active { transform: scale(.95); }
@keyframes miku-idle { 0%,100%{transform:translateY(0) rotate(0deg)} 25%{transform:translateY(-4px) rotate(-1deg)} 75%{transform:translateY(-2px) rotate(1deg)} }
.miku-bounce { animation: miku-bounce .55s ease, miku-idle 3.2s ease-in-out infinite; }
@keyframes miku-bounce { 0%{transform:translateY(0) scale(1)} 30%{transform:translateY(-14px) scale(1.05)} 60%{transform:translateY(3px) scale(.98)} 100%{transform:translateY(0) scale(1)} }
.miku-hearts { position: absolute; right: 8px; bottom: 124px; pointer-events: none; font-size: 20px; animation: miku-heart 1s ease-out forwards; }
@keyframes miku-heart { 0%{opacity:0; transform:translateY(0) scale(.5)} 30%{opacity:1} 100%{opacity:0; transform:translateY(-52px) scale(1.35)} }
.miku-notes { position: absolute; right: 0; bottom: 108px; pointer-events: none; font-size: 15px; animation: miku-note .85s ease-out forwards; }
@keyframes miku-note { 0%{opacity:0; transform:translateY(0) rotate(0)} 40%{opacity:1} 100%{opacity:0; transform:translateY(-34px) rotate(25deg)} }
.miku-hint { position: absolute; left: -78px; top: 52px; width: 66px; font-size: 10px; color: #4D7975; text-align: center; opacity: .75; }
.miku-sound { position: absolute; right: -2px; top: 10px; font-size: 11px; color: #1FAF8F; background: rgba(255,255,255,.85); border: 1px solid #AEDCD6; border-radius: 10px; padding: 2px 7px; animation: miku-sound-in .25s ease-out; }
@keyframes miku-sound-in { from{opacity:0; transform:scale(.7)} to{opacity:1; transform:scale(1)} }
`)

    const slots = ctx.get('slots')
    if (!slots) return

    // ---- 更可爱的 Q 版初音未来 SVG ----
    const MikuAvatar = ({ mood, blink, talking }) => {
      const worried = mood === 'worried'
      let mouth
      if (talking) {
        mouth = React.createElement('ellipse', { cx: 85, cy: 118, rx: 6.5, ry: 8, fill: '#D96A5B' })
      } else if (worried) {
        mouth = React.createElement('path', { d: 'M76 120 Q85 115 94 120', stroke: '#C96B5B', strokeWidth: 3, fill: 'none', strokeLinecap: 'round' })
      } else {
        mouth = React.createElement('path', { d: 'M76 113 Q85 121 94 113', stroke: '#C96B5B', strokeWidth: 3, fill: 'none', strokeLinecap: 'round' })
      }
      const eye = (cx) => {
        if (blink) {
          return React.createElement('path', { d: 'M' + (cx - 11) + ' 96 Q' + cx + ' 89 ' + (cx + 11) + ' 96', stroke: '#1E837C', strokeWidth: 3.2, fill: 'none', strokeLinecap: 'round' })
        }
        return React.createElement('g', null,
          React.createElement('ellipse', { cx: cx, cy: 97, rx: 11.5, ry: 14, fill: '#1E8E8A' }),
          React.createElement('circle', { cx: cx + 4.2, cy: 90.5, r: 4.2, fill: '#FFFFFF' }),
          React.createElement('circle', { cx: cx - 4, cy: 99, r: 2.2, fill: '#FFFFFF', opacity: .9 }),
          React.createElement('path', { d: 'M' + (cx - 9) + ' 108 Q' + cx + ' 114 ' + (cx + 9) + ' 108', stroke: '#1E837C', strokeWidth: 2, fill: 'none', strokeLinecap: 'round' }),
        )
      }
      return React.createElement('svg', { viewBox: '0 0 170 214', width: 150, height: 188 },
        React.createElement('defs', null,
          React.createElement('linearGradient', { id: 'mikuHairG', x1: 0, y1: 0, x2: 0.4, y2: 1 },
            React.createElement('stop', { offset: '0%', stopColor: '#4FE0D2' }),
            React.createElement('stop', { offset: '100%', stopColor: '#2BA8A0' }),
          ),
          React.createElement('linearGradient', { id: 'mikuHairDarkG', x1: 0, y1: 0, x2: 0.4, y2: 1 },
            React.createElement('stop', { offset: '0%', stopColor: '#2BA8A0' }),
            React.createElement('stop', { offset: '100%', stopColor: '#1E837C' }),
          ),
        ),
        // 双马尾（后）
        React.createElement('path', { d: 'M50 62 C20 48 6 72 13 104 C19 132 36 152 52 158 C57 140 54 112 59 92 C63 75 60 66 50 62 Z', fill: 'url(#mikuHairG)' }),
        React.createElement('path', { d: 'M120 62 C150 48 164 72 157 104 C151 132 134 152 118 158 C113 140 116 112 111 92 C107 75 110 66 120 62 Z', fill: 'url(#mikuHairG)' }),
        React.createElement('ellipse', { cx: 36, cy: 146, rx: 14, ry: 7, fill: 'url(#mikuHairDarkG)' }),
        React.createElement('ellipse', { cx: 134, cy: 146, rx: 14, ry: 7, fill: 'url(#mikuHairDarkG)' }),
        // 后发
        React.createElement('ellipse', { cx: 85, cy: 78, rx: 52, ry: 48, fill: 'url(#mikuHairG)' }),
        // 脸
        React.createElement('ellipse', { cx: 85, cy: 84, rx: 44, ry: 42, fill: '#FFF1E0' }),
        // 刘海
        React.createElement('path', { d: 'M41 76 C41 42 60 30 85 30 C110 30 129 42 129 76 C118 56 104 51 85 51 C66 51 52 56 41 76 Z', fill: 'url(#mikuHairG)' }),
        React.createElement('path', { d: 'M47 72 C55 54 66 48 78 48 C70 58 66 70 64 78 C57 76 51 74 47 72 Z', fill: 'url(#mikuHairG)' }),
        React.createElement('path', { d: 'M123 72 C115 54 104 48 92 48 C100 58 104 70 106 78 C113 76 119 74 123 72 Z', fill: 'url(#mikuHairG)' }),
        // 呆毛
        React.createElement('path', { d: 'M84 32 Q86 18 96 12 Q93 22 98 29 Q90 26 84 32 Z', fill: 'url(#mikuHairG)' }),
        // 蝴蝶结（左）
        React.createElement('path', { d: 'M50 42 L28 30 L38 54 Z', fill: '#3A7BD5' }),
        React.createElement('path', { d: 'M50 42 L72 30 L62 54 Z', fill: '#2B5FA8' }),
        React.createElement('circle', { cx: 50, cy: 42, r: 6, fill: '#FFFFFF' }),
        // 眼睛
        eye(64), eye(106),
        // 腮红
        React.createElement('ellipse', { cx: 52, cy: 108, rx: 7, ry: 4, fill: '#FFB6C1', opacity: .65 }),
        React.createElement('ellipse', { cx: 118, cy: 108, rx: 7, ry: 4, fill: '#FFB6C1', opacity: .65 }),
        // 嘴
        mouth,
        // 身体（chibi 小）
        React.createElement('path', { d: 'M70 124 Q70 120 85 120 Q100 120 100 124 L104 150 L66 150 Z', fill: '#FFFFFF' }),
        React.createElement('path', { d: 'M85 122 L77 132 L85 148 L93 132 Z', fill: '#3A7BD5' }),
        React.createElement('path', { d: 'M66 150 L56 172 Q70 179 85 172 Q100 179 114 172 L104 150 Z', fill: 'url(#mikuHairDarkG)' }),
        React.createElement('path', { d: 'M74 170 Q85 163 96 170 L93 183 L77 183 Z', fill: '#3A7BD5' }),
        // 腿 + 鞋
        React.createElement('rect', { x: 72, y: 180, width: 10, height: 15, rx: 5, fill: '#FFF1E0' }),
        React.createElement('rect', { x: 88, y: 180, width: 10, height: 15, rx: 5, fill: '#FFF1E0' }),
        React.createElement('rect', { x: 68, y: 193, width: 17, height: 9, rx: 4.5, fill: 'url(#mikuHairDarkG)' }),
        React.createElement('rect', { x: 85, y: 193, width: 17, height: 9, rx: 4.5, fill: 'url(#mikuHairDarkG)' }),
      )
    }

    // 台词（含 TTS 友好文本）
    const LINES = [
      { bubble: '你好呀，我是初音未来！', say: '你好呀，我是初音未来！' },
      { bubble: '39！(Thank you!)', say: '39，谢谢！' },
      { bubble: '世界第一的公主殿下！', say: '世界第一的公主殿下！' },
      { bubble: '葱~葱~葱~ 补充能量！', say: '葱葱葱，补充能量！' },
      { bubble: '今天也要元气满满哦~', say: '今天也要元气满满哦！' },
      { bubble: '摸摸头，蹭蹭~', say: '摸摸头，蹭蹭！' },
      { bubble: '你的 token 正在燃烧~', say: '你的 token 正在燃烧哦！' },
      { bubble: '多吃点葱，一起加油吧！', say: '多吃点葱，一起加油吧！' },
      { bubble: '咪咕~ 要继续加油哦！', say: '咪咕，要继续加油哦！' },
      { bubble: '我最喜欢唱歌啦！', say: '我最喜欢唱歌啦！' },
    ]

    const MikuWidget = () => {
      const [balance, setBalance] = React.useState(null)
      const [usage, setUsage] = React.useState(null)
      const [bubble, setBubble] = React.useState('')
      const [bubbleWarn, setBubbleWarn] = React.useState(false)
      const [mood, setMood] = React.useState('normal')
      const [anim, setAnim] = React.useState(0)
      const [hearts, setHearts] = React.useState(0)
      const [blink, setBlink] = React.useState(false)
      const [talking, setTalking] = React.useState(false)
      const [speakUrl, setSpeakUrl] = React.useState(null)
      const [speaking, setSpeaking] = React.useState(false)

      const speak = (text, warn) => {
        setBubble(text)
        setBubbleWarn(!!warn)
        ctx.timeout(() => setBubble((cur) => cur === text ? '' : cur), 3600)
      }

      // 眨眼
      React.useEffect(() => {
        const h = ctx.interval(() => {
          setBlink(true)
          ctx.timeout(() => setBlink(false), 180)
        }, 3400)
        return () => h()
      }, [])

      const refresh = async () => {
        try {
          const b = await host.call('miku/balance')
          setBalance(b)
          if (b && b.ok && b.infos && b.infos.length > 0) {
            const total = b.infos[0].total
            if (total < 10) {
              setMood('worried')
              if (!bubble) speak('余额快不够啦，记得给 DeepSeek 充值哦~', true)
            } else {
              setMood('normal')
            }
          }
        } catch (e) {
          setBalance({ ok: false, reason: 'rpc' })
        }
        try {
          const u = await host.call('miku/usage')
          setUsage(u)
        } catch (e) { /* ignore */ }
      }

      React.useEffect(() => {
        refresh()
        const h = ctx.interval(() => refresh(), 60000)
        return () => h()
      }, [])

      const onClick = async () => {
        setAnim((n) => n + 1)
        setHearts((n) => n + 1)
        setMood('happy')
        const line = LINES[Math.floor(Math.random() * LINES.length)]
        speak(line.bubble, false)
        ctx.timeout(() => setMood((m) => m === 'happy' ? 'normal' : m), 1500)
        // 语音
        try {
          const r = await host.call('miku/speak', { text: line.say })
          if (r && r.ok && r.url) {
            setSpeakUrl(r.url)
            setTalking(true)
            setSpeaking(true)
          }
        } catch (e) { /* TTS 不可用时静默 */ }
      }

      const onAudioEnded = () => {
        setTalking(false)
        setSpeaking(false)
        setSpeakUrl(null)
      }

      const renderBalance = () => {
        if (balance && balance.ok && balance.infos && balance.infos.length > 0) {
          const info = balance.infos[0]
          return React.createElement('div', { className: 'miku-bubble' },
            React.createElement('div', { className: 'miku-bubble-title' }, '♪ DeepSeek 余额'),
            React.createElement('div', null, info.currency + ' ' + info.total.toFixed(2)),
            React.createElement('div', { className: 'miku-bubble-sub' }, '赠送 ' + info.granted.toFixed(2) + ' · 充值 ' + info.toppedUp.toFixed(2)),
          )
        }
        if (balance && balance.ok) {
          return React.createElement('div', { className: 'miku-bubble' },
            React.createElement('div', { className: 'miku-bubble-title' }, '♪ DeepSeek 余额'),
            React.createElement('div', null, '账户暂无余额信息'),
          )
        }
        const reason = balance && balance.reason === 'no-key' ? '未配置 DEEPSEEK_API_KEY' : '余额获取失败'
        return React.createElement('div', { className: 'miku-bubble ' + (bubbleWarn ? 'miku-bubble-warn' : '') },
          React.createElement('div', { className: 'miku-bubble-title' }, '♪ DeepSeek 余额'),
          React.createElement('div', null, reason),
        )
      }

      const usageText = usage && usage.total > 0
        ? '本会话消耗 ' + usage.total + ' 根葱 (~' + Math.round(usage.total / 1000) + 'k tokens)'
        : '本会话还没有消耗葱~'

      const bubbleEl = bubble
        ? React.createElement('div', { className: 'miku-bubble ' + (bubbleWarn ? 'miku-bubble-warn' : '') }, bubble)
        : renderBalance()

      const notes = anim > 0
        ? React.createElement('span', { key: anim, className: 'miku-notes' }, '♪')
        : null

      const audioEl = speakUrl
        ? React.createElement('audio', {
            key: speakUrl,
            src: speakUrl,
            autoPlay: true,
            preload: 'auto',
            style: { display: 'none' },
            onEnded: onAudioEnded,
          })
        : null

      return React.createElement('div', { className: 'miku-widget' },
        React.createElement('div', { className: 'miku-hint' }, '点我摸头·会说话哦~'),
        bubbleEl,
        speaking
          ? React.createElement('div', { className: 'miku-sound' }, '♪ 说话中…')
          : null,
        hearts > 0
          ? React.createElement('span', { key: 'h' + hearts, className: 'miku-hearts' }, '♥')
          : null,
        notes,
        React.createElement('div', {
          className: 'miku-stage' + (anim > 0 ? ' miku-bounce' : ''),
          key: 'stage' + anim,
          onClick: onClick,
          title: '点我摸头~',
        }, React.createElement(MikuAvatar, { mood: mood, blink: blink, talking: talking })),
        React.createElement('div', { className: 'miku-bubble-sub', style: { textAlign: 'center', marginTop: 2, fontSize: 10, color: '#4D7975' } }, usageText),
        audioEl,
      )
    }

    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'miku-chan' },
      () => React.createElement(MikuWidget),
    ))
  },
}
