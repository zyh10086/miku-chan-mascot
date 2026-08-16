// Miku-chan Balance Mascot — Client half (v9: anime style + pseudo-Live2D)
// DeepSeek Harness (DSH) 动态 Cordis 插件 Client 端源码。
// 功能：初音绿主题覆盖 + 右下角动漫风初音未来（超长双马尾立绘 / 伪 Live2D 动效 / TTS 语音）。
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
.miku-widget { position: fixed; right: 16px; bottom: 14px; z-index: 9999; pointer-events: auto; user-select: none; font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.miku-bubble { position: absolute; right: 4px; bottom: 190px; width: 230px; background: linear-gradient(135deg, #ffffff 0%, #f0fbf8 100%); border: 2px solid #39C5BB; border-radius: 18px; padding: 11px 14px; font-size: 13px; line-height: 1.6; color: #123B38; box-shadow: 0 10px 32px rgba(57,197,187,.45); }
.miku-bubble::after { content: ''; position: absolute; right: 44px; bottom: -11px; border: 10px solid transparent; border-top-color: #39C5BB; }
.miku-bubble-title { font-weight: 700; color: #1FAF8F; margin-bottom: 3px; letter-spacing: .5px; }
.miku-bubble-sub { color: #4D7975; font-size: 11.5px; }
.miku-bubble-warn { border-color: #F0A93E; background: linear-gradient(135deg, #fffdf6 0%, #fff7e6 100%); }
.miku-bubble-warn::after { border-top-color: #F0A93E; }
.miku-bubble-warn .miku-bubble-title { color: #D97B1F; }
.miku-stage { position: relative; width: 168px; height: 200px; cursor: pointer; filter: drop-shadow(0 8px 18px rgba(57,197,187,.45)); transition: transform .15s; animation: miku-idle 3.6s ease-in-out infinite; transform-origin: 50% 100%; }
.miku-stage:hover { transform: translateY(-3px); }
.miku-stage:active { transform: scale(.96); }
@keyframes miku-idle { 0%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} 70%{transform:translateY(-2px)} }
.miku-bounce { animation: miku-bounce .55s ease, miku-idle 3.6s ease-in-out infinite; }
@keyframes miku-bounce { 0%{transform:translateY(0) scale(1)} 30%{transform:translateY(-16px) scale(1.05)} 60%{transform:translateY(4px) scale(.97)} 100%{transform:translateY(0) scale(1)} }
.miku-hearts { position: absolute; right: 10px; bottom: 158px; pointer-events: none; font-size: 22px; animation: miku-heart 1s ease-out forwards; }
@keyframes miku-heart { 0%{opacity:0; transform:translateY(0) scale(.5)} 30%{opacity:1} 100%{opacity:0; transform:translateY(-58px) scale(1.4)} }
.miku-notes { position: absolute; right: 2px; bottom: 140px; pointer-events: none; font-size: 17px; animation: miku-note .9s ease-out forwards; }
@keyframes miku-note { 0%{opacity:0; transform:translateY(0) rotate(0)} 40%{opacity:1} 100%{opacity:0; transform:translateY(-40px) rotate(28deg)} }
.miku-hint { position: absolute; left: -86px; top: 66px; width: 72px; font-size: 10.5px; color: #4D7975; text-align: center; opacity: .8; }
.miku-sound { position: absolute; right: -4px; top: 12px; font-size: 11.5px; color: #1FAF8F; background: rgba(255,255,255,.88); border: 1px solid #AEDCD6; border-radius: 10px; padding: 2px 8px; animation: miku-sound-in .25s ease-out; }
@keyframes miku-sound-in { from{opacity:0; transform:scale(.7)} to{opacity:1; transform:scale(1)} }
/* 伪 Live2D：马尾摆动、发丝浮动 */
.miku-tail-l { transform-box: fill-box; transform-origin: 88% 12%; animation: miku-tail-l 4.5s ease-in-out infinite; }
.miku-tail-r { transform-box: fill-box; transform-origin: 12% 12%; animation: miku-tail-r 4.5s ease-in-out infinite; }
@keyframes miku-tail-l { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-2.2deg)} 75%{transform:rotate(1.6deg)} }
@keyframes miku-tail-r { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(2.2deg)} 75%{transform:rotate(-1.6deg)} }
.miku-bang { transform-box: fill-box; transform-origin: 50% 100%; animation: miku-bang 5s ease-in-out infinite; }
@keyframes miku-bang { 0%,100%{transform:rotate(0deg)} 30%{transform:rotate(-1deg)} 80%{transform:rotate(.8deg)} }
.miku-shine { animation: miku-shine 4s ease-in-out infinite; }
@keyframes miku-shine { 0%,88%,100%{opacity:1} 92%{opacity:.15} 96%{opacity:1} }
`)

    const slots = ctx.get('slots')
    if (!slots) return

    // ---- 动漫风初音未来（还原超长双马尾立绘）----
    const MikuAvatar = ({ mood, blink, talking }) => {
      const worried = mood === 'worried'
      let mouth
      if (talking) {
        mouth = React.createElement('ellipse', { cx: 100, cy: 138, rx: 8, ry: 10, fill: '#C96A5B' })
      } else if (worried) {
        mouth = React.createElement('path', { d: 'M88 140 Q100 133 112 140', stroke: '#C96B5B', strokeWidth: 3.2, fill: 'none', strokeLinecap: 'round' })
      } else {
        mouth = React.createElement('path', { d: 'M89 132 Q100 142 111 132', stroke: '#C96B5B', strokeWidth: 3.2, fill: 'none', strokeLinecap: 'round' })
      }
      const eye = (cx) => {
        if (blink) {
          return React.createElement('path', { d: 'M' + (cx - 14) + ' 112 Q' + cx + ' 103 ' + (cx + 14) + ' 112', stroke: '#1E837C', strokeWidth: 3.6, fill: 'none', strokeLinecap: 'round' })
        }
        return React.createElement('g', null,
          React.createElement('ellipse', { cx: cx, cy: 113, rx: 14, ry: 17, fill: '#1E8E8A' }),
          React.createElement('circle', { cx: cx + 5, cy: 104, r: 5.2, fill: '#FFFFFF' }),
          React.createElement('circle', { cx: cx - 5, cy: 116, r: 2.6, fill: '#FFFFFF', opacity: .9 }),
          React.createElement('circle', { cx: cx + 1, cy: 121, r: 1.8, fill: '#9FE8E0', opacity: .8 }),
          React.createElement('path', { d: 'M' + (cx - 11) + ' 126 Q' + cx + ' 133 ' + (cx + 11) + ' 126', stroke: '#1E837C', strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' }),
          React.createElement('path', { d: 'M' + (cx - 9) + ' 130 L' + (cx - 12) + ' 136 M' + cx + ' 132 L' + cx + ' 138 M' + (cx + 9) + ' 130 L' + (cx + 12) + ' 136', stroke: '#1E837C', strokeWidth: 1.6, strokeLinecap: 'round' }),
        )
      }
      const shade = (d, cls) => React.createElement('path', { d: d, fill: 'url(#mikuHairG)', className: cls || undefined })
      return React.createElement('svg', { viewBox: '0 0 200 262', width: 168, height: 220 },
        React.createElement('defs', null,
          React.createElement('linearGradient', { id: 'mikuHairG', x1: 0, y1: 0, x2: 0.35, y2: 1 },
            React.createElement('stop', { offset: '0%', stopColor: '#4FE0D2' }),
            React.createElement('stop', { offset: '100%', stopColor: '#28A69E' }),
          ),
          React.createElement('linearGradient', { id: 'mikuHairDarkG', x1: 0, y1: 0, x2: 0.35, y2: 1 },
            React.createElement('stop', { offset: '0%', stopColor: '#28A69E' }),
            React.createElement('stop', { offset: '100%', stopColor: '#17777A' }),
          ),
          React.createElement('linearGradient', { id: 'mikuSkirtG', x1: 0, y1: 0, x2: 0, y2: 1 },
            React.createElement('stop', { offset: '0%', stopColor: '#2B5FA8' }),
            React.createElement('stop', { offset: '100%', stopColor: '#1B3F77' }),
          ),
        ),
        // ===== 超长双马尾（初音标志）=====
        React.createElement('g', { className: 'miku-tail-l' },
          shade('M68 64 C 38 44 14 58 8 94 C 2 132 6 168 15 202 C 19 218 21 234 17 250 C 31 238 35 214 35 190 C 37 150 43 116 55 94 C 62 80 66 72 68 64 Z'),
          React.createElement('path', { d: 'M72 68 C 48 52 26 64 22 98 C 18 132 22 162 28 192 C 31 206 32 220 28 234 C 40 224 42 206 42 184 C 44 148 50 118 60 100 C 65 90 69 80 72 68 Z', fill: 'url(#mikuHairDarkG)' }),
        ),
        React.createElement('g', { className: 'miku-tail-r' },
          shade('M132 64 C 162 44 186 58 192 94 C 198 132 194 168 185 202 C 181 218 179 234 183 250 C 169 238 165 214 165 190 C 163 150 157 116 145 94 C 138 80 134 72 132 64 Z'),
          React.createElement('path', { d: 'M128 68 C 152 52 174 64 178 98 C 182 132 178 162 172 192 C 169 206 168 220 172 234 C 160 224 158 206 158 184 C 156 148 150 118 140 100 C 135 90 131 80 128 68 Z', fill: 'url(#mikuHairDarkG)' }),
        ),
        // ===== 后发 =====
        React.createElement('ellipse', { cx: 100, cy: 96, rx: 58, ry: 52, fill: 'url(#mikuHairG)' }),
        // ===== 身体（白衬衫 + 蓝领带 + 深蓝百褶裙）=====
        React.createElement('path', { d: 'M84 156 L84 152 Q84 148 100 148 Q116 148 116 152 L116 156 L122 196 L78 196 Z', fill: '#FFFFFF' }),
        React.createElement('path', { d: 'M100 150 L88 166 L100 188 L112 166 Z', fill: '#3A5FD0' }),
        React.createElement('circle', { cx: 100, cy: 166, r: 4, fill: '#FFD700' }),
        React.createElement('path', { d: 'M78 196 L62 232 Q78 242 94 230 L100 222 L106 230 Q122 242 138 232 L122 196 Z', fill: 'url(#mikuSkirtG)' }),
        React.createElement('path', { d: 'M84 226 Q100 214 116 226 L112 242 L88 242 Z', fill: '#3A5FD0' }),
        // ===== 腿（白色过膝袜）+ 鞋 =====
        React.createElement('rect', { x: 84, y: 226, width: 13, height: 24, rx: 6, fill: '#FFFFFF', stroke: '#D8E8E4', strokeWidth: 1 }),
        React.createElement('rect', { x: 103, y: 226, width: 13, height: 24, rx: 6, fill: '#FFFFFF', stroke: '#D8E8E4', strokeWidth: 1 }),
        React.createElement('rect', { x: 79, y: 248, width: 22, height: 11, rx: 5.5, fill: 'url(#mikuSkirtG)' }),
        React.createElement('rect', { x: 99, y: 248, width: 22, height: 11, rx: 5.5, fill: 'url(#mikuSkirtG)' }),
        // ===== 脸 =====
        React.createElement('ellipse', { cx: 100, cy: 100, rx: 47, ry: 46, fill: '#FFF2E2' }),
        // ===== 刘海（中分 + 鬓发）=====
        React.createElement('g', { className: 'miku-bang' },
          React.createElement('path', { d: 'M53 88 C 53 50 72 36 100 36 C 128 36 147 50 147 88 C 136 64 120 58 100 58 C 80 58 64 64 53 88 Z', fill: 'url(#mikuHairG)' }),
          React.createElement('path', { d: 'M58 84 C 66 62 80 54 94 54 C 85 66 80 82 78 92 C 70 89 63 87 58 84 Z', fill: 'url(#mikuHairG)' }),
          React.createElement('path', { d: 'M142 84 C 134 62 120 54 106 54 C 115 66 120 82 122 92 C 130 89 137 87 142 84 Z', fill: 'url(#mikuHairG)' }),
          React.createElement('path', { d: 'M54 86 C 48 108 50 130 58 148 C 66 134 68 112 66 94 Z', fill: 'url(#mikuHairDarkG)' }),
          React.createElement('path', { d: 'M146 86 C 152 108 150 130 142 148 C 134 134 132 112 134 94 Z', fill: 'url(#mikuHairDarkG)' }),
        ),
        // ===== 呆毛 =====
        React.createElement('path', { d: 'M96 40 Q 100 22 114 16 Q 110 27 116 34 Q 106 31 96 40 Z', fill: 'url(#mikuHairG)' }),
        // ===== 蝴蝶结（左前发）=====
        React.createElement('path', { d: 'M92 80 L 62 64 L 74 92 Z', fill: '#3A7BD5' }),
        React.createElement('path', { d: 'M92 80 L 118 64 L 106 92 Z', fill: '#2B5FA8' }),
        React.createElement('circle', { cx: 92, cy: 80, r: 8, fill: '#FFFFFF' }),
        React.createElement('circle', { cx: 92, cy: 80, r: 3.5, fill: '#39C5BB' }),
        // ===== 眼睛 =====
        eye(76), eye(124),
        // ===== 腮红 =====
        React.createElement('ellipse', { cx: 60, cy: 126, rx: 8.5, ry: 5, fill: '#FFB6C1', opacity: .6 }),
        React.createElement('ellipse', { cx: 140, cy: 126, rx: 8.5, ry: 5, fill: '#FFB6C1', opacity: .6 }),
        // ===== 嘴 =====
        mouth,
      )
    }

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
        ctx.timeout(() => setBubble((cur) => cur === text ? '' : cur), 3800)
      }

      React.useEffect(() => {
        const h = ctx.interval(() => {
          setBlink(true)
          ctx.timeout(() => setBlink(false), 200)
        }, 3600)
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
        React.createElement('div', { className: 'miku-bubble-sub', style: { textAlign: 'center', marginTop: 2, fontSize: 10.5, color: '#4D7975' } }, usageText),
        audioEl,
      )
    }

    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'miku-chan' },
      () => React.createElement(MikuWidget),
    ))
  },
}
