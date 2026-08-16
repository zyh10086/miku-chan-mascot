// Miku-chan Balance Mascot — Client half (v12: edge-tts voice)
// DeepSeek Harness (DSH) 动态 Cordis 插件 Client 端源码。
// 功能：初音绿主题 + 右下角初音（支持自定义图片头像）+ edge-tts 日语女声音。
// 使用方式：把本文件内容作为 cordis_define 的 code.client 提交。
// 头像：把 PNG/GIF/WebP 图片放入 <workspaceRoot>/.miku-avatar/ 即可自动使用。

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
.miku-bubble { position: absolute; right: 4px; bottom: 200px; width: 240px; background: linear-gradient(135deg, #ffffff 0%, #f0fbf8 100%); border: 2px solid #39C5BB; border-radius: 18px; padding: 11px 14px; font-size: 13px; line-height: 1.6; color: #123B38; box-shadow: 0 10px 32px rgba(57,197,187,.45); }
.miku-bubble::after { content: ''; position: absolute; right: 44px; bottom: -11px; border: 10px solid transparent; border-top-color: #39C5BB; }
.miku-bubble-title { font-weight: 700; color: #1FAF8F; margin-bottom: 3px; letter-spacing: .5px; }
.miku-bubble-sub { color: #4D7975; font-size: 11.5px; }
.miku-bubble-warn { border-color: #F0A93E; background: linear-gradient(135deg, #fffdf6 0%, #fff7e6 100%); }
.miku-bubble-warn::after { border-top-color: #F0A93E; }
.miku-bubble-warn .miku-bubble-title { color: #D97B1F; }
.miku-stage { position: relative; width: 176px; height: 206px; cursor: pointer; filter: drop-shadow(0 8px 18px rgba(57,197,187,.4)); transition: transform .15s; animation: miku-idle 3.6s ease-in-out infinite; transform-origin: 50% 100%; }
.miku-stage:hover { transform: translateY(-3px); }
.miku-stage:active { transform: scale(.96); }
@keyframes miku-idle { 0%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} 70%{transform:translateY(-2px)} }
.miku-bounce { animation: miku-bounce .55s ease, miku-idle 3.6s ease-in-out infinite; }
@keyframes miku-bounce { 0%{transform:translateY(0) scale(1)} 30%{transform:translateY(-16px) scale(1.05)} 60%{transform:translateY(4px) scale(.97)} 100%{transform:translateY(0) scale(1)} }
.miku-img { width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
.miku-img-talk { animation: miku-talk .3s ease-in-out infinite alternate; }
@keyframes miku-talk { from{transform:translateY(0) rotate(0deg)} to{transform:translateY(-3px) rotate(1.2deg)} }
.miku-hearts { position: absolute; right: 10px; bottom: 168px; pointer-events: none; font-size: 22px; animation: miku-heart 1s ease-out forwards; }
@keyframes miku-heart { 0%{opacity:0; transform:translateY(0) scale(.5)} 30%{opacity:1} 100%{opacity:0; transform:translateY(-58px) scale(1.4)} }
.miku-notes { position: absolute; right: 2px; bottom: 150px; pointer-events: none; font-size: 17px; animation: miku-note .9s ease-out forwards; }
@keyframes miku-note { 0%{opacity:0; transform:translateY(0) rotate(0)} 40%{opacity:1} 100%{opacity:0; transform:translateY(-40px) rotate(28deg)} }
.miku-hint { position: absolute; left: -86px; top: 66px; width: 72px; font-size: 10.5px; color: #4D7975; text-align: center; opacity: .8; }
.miku-sound { position: absolute; right: -4px; top: 12px; font-size: 11.5px; color: #1FAF8F; background: rgba(255,255,255,.88); border: 1px solid #AEDCD6; border-radius: 10px; padding: 2px 8px; animation: miku-sound-in .25s ease-out; }
@keyframes miku-sound-in { from{opacity:0; transform:scale(.7)} to{opacity:1; transform:scale(1)} }
.miku-img-loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #1FAF8F; font-size: 12px; }
`)

    const slots = ctx.get('slots')
    if (!slots) return

    const FallbackAvatar = () => React.createElement('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 84 } }, '🎤')

    // 台词：日语 + 中文混搭，配合高音调更像 Miku
    const LINES = [
      { bubble: 'こんにちは！我是初音未来~', say: 'こんにちは！私は初音ミクです！よろしくお願いします！' },
      { bubble: '39！(Thank you!)', say: '39！みんな、ありがとう！' },
      { bubble: '世界第一的公主殿下！', say: '世界一のお姫様、初音ミクです！' },
      { bubble: '葱~葱~葱~', say: 'ネギ！ネギ！ネギ！元気いっぱい！' },
      { bubble: '今天也要元气满满哦~', say: '今日も元気に頑張りましょう！' },
      { bubble: '摸摸头，蹭蹭~', say: 'なでなで～嬉しいです！' },
      { bubble: '你的 token 正在燃烧~', say: 'あなたのトークンが燃えていますよ！' },
      { bubble: '一起加油吧！', say: '一緒に頑張ろうね！' },
      { bubble: '咪咕~ 要继续加油哦！', say: 'もっと頑張ってね！応援しています！' },
      { bubble: '我最喜欢唱歌啦！', say: '歌うのが大好きです！みんな聴いてね！' },
    ]

    const MikuWidget = () => {
      const [balance, setBalance] = React.useState(null)
      const [usage, setUsage] = React.useState(null)
      const [avatar, setAvatar] = React.useState(null)
      const [avatarLoading, setAvatarLoading] = React.useState(true)
      const [bubble, setBubble] = React.useState('')
      const [bubbleWarn, setBubbleWarn] = React.useState(false)
      const [mood, setMood] = React.useState('normal')
      const [anim, setAnim] = React.useState(0)
      const [hearts, setHearts] = React.useState(0)
      const [talking, setTalking] = React.useState(false)
      const [speakUrl, setSpeakUrl] = React.useState(null)
      const [speaking, setSpeaking] = React.useState(false)

      const speak = (text, warn) => {
        setBubble(text)
        setBubbleWarn(!!warn)
        ctx.timeout(() => setBubble((cur) => cur === text ? '' : cur), 3800)
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
        host.call('miku/avatar').then((r) => {
          setAvatar(r && r.ok ? r : null)
          setAvatarLoading(false)
        }).catch(() => setAvatarLoading(false))
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

      let figure
      if (avatarLoading) {
        figure = React.createElement('div', { className: 'miku-img-loading' }, '加载 Miku 图片…')
      } else if (avatar && avatar.url) {
        figure = React.createElement('img', {
          className: 'miku-img' + (talking ? ' miku-img-talk' : ''),
          src: avatar.url,
          alt: '初音未来',
          draggable: false,
        })
      } else {
        figure = React.createElement(FallbackAvatar)
      }

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
        }, figure),
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
