// Miku-chan Balance Mascot — Client half
// DeepSeek Harness (DSH) 动态 Cordis 插件 Client 端源码。
// 功能：初音绿主题覆盖 + 右下角 Q 版初音未来吉祥物（余额气泡 / 摸头互动 / token 消耗）。
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
.miku-bubble { position: absolute; right: 4px; bottom: 132px; width: 210px; background: rgba(255,255,255,.97); border: 2px solid #39C5BB; border-radius: 14px; padding: 10px 12px; font-size: 12.5px; line-height: 1.5; color: #123B38; box-shadow: 0 6px 24px rgba(57,197,187,.35); }
.miku-bubble::after { content: ''; position: absolute; right: 34px; bottom: -9px; border: 8px solid transparent; border-top-color: #39C5BB; }
.miku-bubble-title { font-weight: 600; color: #1FAF8F; margin-bottom: 2px; }
.miku-bubble-sub { color: #4D7975; font-size: 11px; }
.miku-bubble-warn { border-color: #E8A33D; }
.miku-bubble-warn::after { border-top-color: #E8A33D; }
.miku-stage { position: relative; width: 130px; height: 132px; cursor: pointer; filter: drop-shadow(0 4px 10px rgba(57,197,187,.35)); transition: transform .15s; }
.miku-stage:hover { transform: translateY(-3px); }
.miku-stage:active { transform: scale(.96); }
.miku-bounce { animation: miku-bounce .5s ease; }
@keyframes miku-bounce { 0%{transform:translateY(0)} 30%{transform:translateY(-10px)} 60%{transform:translateY(4px)} 100%{transform:translateY(0)} }
.miku-hearts { position: absolute; right: 6px; bottom: 110px; pointer-events: none; font-size: 18px; animation: miku-heart .9s ease-out forwards; }
@keyframes miku-heart { 0%{opacity:0; transform:translateY(0) scale(.6)} 30%{opacity:1} 100%{opacity:0; transform:translateY(-46px) scale(1.25)} }
.miku-notes { position: absolute; right: 0; bottom: 96px; pointer-events: none; font-size: 14px; animation: miku-note .8s ease-out forwards; }
@keyframes miku-note { 0%{opacity:0; transform:translateY(0)} 40%{opacity:1} 100%{opacity:0; transform:translateY(-30px) rotate(20deg)} }
.miku-drag-hint { position: absolute; left: -70px; top: 50px; width: 64px; font-size: 10px; color: #4D7975; text-align: center; opacity: .7; }
`)

    const slots = ctx.get('slots')
    if (!slots) return

    // ---- Q 版初音未来 SVG ----
    const MikuAvatar = ({ mood }) => {
      const worried = mood === 'worried'
      const smile = worried
        ? React.createElement('path', { d: 'M64 90 Q70 86 76 90', stroke: '#C96B5B', strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round' })
        : React.createElement('path', { d: 'M64 84 Q70 89 76 84', stroke: '#C96B5B', strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round' })
      const eye = (cx) => React.createElement('g', null,
        React.createElement('ellipse', { cx: cx, cy: 70, rx: 7.5, ry: worried ? 8.5 : 9, fill: '#1E8E8A' }),
        React.createElement('circle', { cx: cx + 2.2, cy: 66.5, r: 2.6, fill: '#FFFFFF' }),
        React.createElement('circle', { cx: cx - 1.5, cy: 71.5, r: 1.2, fill: '#FFFFFF', opacity: .85 }),
      )
      return React.createElement('svg', { viewBox: '0 0 140 180', width: 130, height: 166 },
        // 双马尾（后）
        React.createElement('path', { d: 'M38 52 C16 46 4 62 7 86 C10 108 24 122 36 126 C40 112 42 90 48 74 C54 60 50 55 38 52 Z', fill: '#39C5BB' }),
        React.createElement('path', { d: 'M102 52 C124 46 136 62 133 86 C130 108 116 122 104 126 C100 112 98 90 92 74 C86 60 90 55 102 52 Z', fill: '#39C5BB' }),
        React.createElement('ellipse', { cx: 26, cy: 118, rx: 12, ry: 6, fill: '#2FB5AA' }),
        React.createElement('ellipse', { cx: 114, cy: 118, rx: 12, ry: 6, fill: '#2FB5AA' }),
        // 后发
        React.createElement('ellipse', { cx: 70, cy: 66, rx: 36, ry: 33, fill: '#39C5BB' }),
        // 脸
        React.createElement('ellipse', { cx: 70, cy: 68, rx: 30, ry: 29, fill: '#FFF1E0' }),
        // 刘海
        React.createElement('path', { d: 'M40 62 C40 36 54 26 70 26 C86 26 100 36 100 62 C92 46 82 42 70 42 C58 42 48 46 40 62 Z', fill: '#39C5BB' }),
        React.createElement('path', { d: 'M44 58 C50 44 58 40 66 40 C60 48 56 56 54 62 C50 60 46 59 44 58 Z', fill: '#39C5BB' }),
        React.createElement('path', { d: 'M96 58 C90 44 82 40 74 40 C80 48 84 56 86 62 C90 60 94 59 96 58 Z', fill: '#39C5BB' }),
        // 蝴蝶结（左）
        React.createElement('path', { d: 'M40 30 L22 20 L30 40 Z', fill: '#3A7BD5' }),
        React.createElement('path', { d: 'M40 30 L58 20 L50 40 Z', fill: '#2B5FA8' }),
        React.createElement('circle', { cx: 40, cy: 30, r: 5, fill: '#FFFFFF' }),
        // 眼睛
        eye(56), eye(84),
        // 腮红
        React.createElement('ellipse', { cx: 46, cy: 80, rx: 5, ry: 3, fill: '#FFB6C1', opacity: .6 }),
        React.createElement('ellipse', { cx: 94, cy: 80, rx: 5, ry: 3, fill: '#FFB6C1', opacity: .6 }),
        // 嘴
        smile,
        // 身体
        React.createElement('path', { d: 'M54 96 Q54 92 70 92 Q86 92 86 96 L89 116 L51 116 Z', fill: '#FFFFFF' }),
        React.createElement('path', { d: 'M70 94 L64 102 L70 118 L76 102 Z', fill: '#3A7BD5' }),
        React.createElement('path', { d: 'M51 116 L42 134 Q50 140 58 132 L62 126 L78 126 L82 132 Q90 140 98 134 L89 116 Z', fill: '#2B5FA8' }),
        React.createElement('path', { d: 'M58 132 Q62 126 70 126 Q78 126 82 132 L78 138 L62 138 Z', fill: '#3A7BD5' }),
        // 腿 + 鞋
        React.createElement('rect', { x: 58, y: 138, width: 9, height: 14, rx: 4, fill: '#FFF1E0' }),
        React.createElement('rect', { x: 73, y: 138, width: 9, height: 14, rx: 4, fill: '#FFF1E0' }),
        React.createElement('rect', { x: 54, y: 150, width: 15, height: 8, rx: 4, fill: '#2B5FA8' }),
        React.createElement('rect', { x: 71, y: 150, width: 15, height: 8, rx: 4, fill: '#2B5FA8' }),
      )
    }

    const LINES = [
      '39！(Thank you!)',
      '世界第一的公主殿下！',
      '葱~葱~葱~',
      'ミクさん、いきますよ！',
      '今天也要元气满满哦~',
      '摸摸头，蹭蹭~',
      '你的 token 正在燃烧~',
      'konnichiwa~ 我是初音未来！',
      '吃点葱补充能量吧！',
      '咪咕~ 要继续加油哦！',
    ]

    const MikuWidget = () => {
      const [balance, setBalance] = React.useState(null)
      const [usage, setUsage] = React.useState(null)
      const [bubble, setBubble] = React.useState('')
      const [bubbleWarn, setBubbleWarn] = React.useState(false)
      const [mood, setMood] = React.useState('normal')
      const [anim, setAnim] = React.useState(0)
      const [hearts, setHearts] = React.useState(0)

      const speak = (text, warn) => {
        setBubble(text)
        setBubbleWarn(!!warn)
        ctx.timeout(() => setBubble((cur) => cur === text ? '' : cur), 3200)
      }

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

      const onClick = () => {
        setAnim((n) => n + 1)
        setHearts((n) => n + 1)
        setMood('happy')
        const line = LINES[Math.floor(Math.random() * LINES.length)]
        speak(line, false)
        ctx.timeout(() => setMood((m) => m === 'happy' ? 'normal' : m), 1400)
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

      return React.createElement('div', { className: 'miku-widget' },
        React.createElement('div', { className: 'miku-drag-hint' }, '点我摸头~'),
        bubbleEl,
        hearts > 0
          ? React.createElement('span', { key: 'h' + hearts, className: 'miku-hearts' }, '♥')
          : null,
        notes,
        React.createElement('div', {
          className: 'miku-stage' + (anim > 0 ? ' miku-bounce' : ''),
          key: 'stage' + anim,
          onClick: onClick,
          title: '点我摸头~',
        }, React.createElement(MikuAvatar, { mood: mood })),
        React.createElement('div', { className: 'miku-bubble-sub', style: { textAlign: 'center', marginTop: 2, fontSize: 10, color: '#4D7975' } }, usageText),
      )
    }

    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'miku-chan' },
      () => React.createElement(MikuWidget),
    ))
  },
}
