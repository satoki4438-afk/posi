'use client'

import { useState, useRef } from 'react'

const EMOJIS = ['👍', '🎉', '🔥', '💗', '🌸', '👏', '💪', '✨', '🥹', '🎊', '🌈']
const EMOJIS_FREE = EMOJIS.slice(0, 5)

const MOCK_POSTS = [
  { id: '1', author: 'たろう', initials: 'た', text: '今日マラソン完走した！初めての10km！', posiCount: 847, target: 1000, time: '2分前' },
  { id: '2', author: 'はなこ', initials: 'は', text: 'TOEIC 900点超えた。3年間の勉強がついに実った！', posiCount: 234, target: 1000, time: '15分前' },
  { id: '3', author: 'けんじ', initials: 'け', text: '念願のカフェ、今日オープンしました！店主になったよ', posiCount: 992, target: 1000, time: '1時間前' },
  { id: '4', author: 'みさき', initials: 'み', text: '子供が初めて自転車に乗れた！1週間の練習の成果', posiCount: 156, target: 1000, time: '2時間前' },
  { id: '5', author: 'ゆうき', initials: 'ゆ', text: '独学3ヶ月でWebアプリ完成させた。ついにリリースできた！', posiCount: 421, target: 1000, time: '3時間前' },
]

const USER_TIER = 'free'

export default function FeedPage() {
  const [posts, setPosts] = useState(MOCK_POSTS)
  const [idx, setIdx] = useState(0)
  const [sent, setSent] = useState({})
  const [emoji, setEmoji] = useState('👍')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [drag, setDrag] = useState({ on: false, x0: 0, dx: 0 })
  const [leaving, setLeaving] = useState(null)

  const longRef = useRef(null)
  const didDragRef = useRef(false)

  const post = posts[idx] ?? null

  const advance = () => {
    setIdx(i => i + 1)
    setLeaving(null)
    setDrag({ on: false, x0: 0, dx: 0 })
    didDragRef.current = false
  }

  const swipe = (dir) => {
    setLeaving(dir)
    setTimeout(advance, 280)
  }

  const dragStart = (x) => {
    didDragRef.current = false
    setDrag({ on: true, x0: x, dx: 0 })
  }

  const dragMove = (x) => {
    setDrag(d => {
      if (!d.on) return d
      const dx = x - d.x0
      if (Math.abs(dx) > 6) didDragRef.current = true
      return { ...d, dx }
    })
  }

  const dragEnd = () => {
    setDrag(d => {
      if (!d.on) return d
      if (Math.abs(d.dx) > 80) {
        swipe(d.dx > 0 ? 'right' : 'left')
      }
      return { on: false, x0: 0, dx: 0 }
    })
  }

  const sendPosi = () => {
    if (!post || sent[post.id]) return
    setSent(s => ({ ...s, [post.id]: true }))
    setPosts(ps => ps.map(p =>
      p.id === post.id ? { ...p, posiCount: Math.min(p.posiCount + 1, p.target) } : p
    ))
  }

  const posiDown = (e) => {
    e.stopPropagation()
    if (USER_TIER === 'premium') {
      longRef.current = setTimeout(() => {
        setPickerOpen(true)
        longRef.current = null
      }, 400)
    }
  }

  const posiUp = (e) => {
    e.stopPropagation()
    if (didDragRef.current) {
      dragEnd()
      return
    }
    if (longRef.current) {
      clearTimeout(longRef.current)
      longRef.current = null
      sendPosi()
    } else if (!pickerOpen) {
      sendPosi()
    }
  }

  const pickEmoji = (e) => {
    setEmoji(e)
    setPickerOpen(false)
    sendPosi()
  }

  if (!post) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: 12 }}>
        <span style={{ fontSize: 48 }}>🎉</span>
        <p style={{ fontSize: 15, color: 'var(--text-sub)' }}>全部見たよ！また後でチェックしよう</p>
      </div>
    )
  }

  const progress = (post.posiCount / post.target) * 100
  const remaining = post.target - post.posiCount
  const hasSent = !!sent[post.id]
  const emojis = USER_TIER === 'premium' ? EMOJIS : USER_TIER === 'free' ? EMOJIS_FREE : ['👍']

  let cardTransform = 'translateX(0) rotate(0deg)'
  let cardTransition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)'

  if (leaving === 'left') {
    cardTransform = 'translateX(-120vw) rotate(-20deg)'
    cardTransition = 'transform 0.28s ease-in'
  } else if (leaving === 'right') {
    cardTransform = 'translateX(120vw) rotate(20deg)'
    cardTransition = 'transform 0.28s ease-in'
  } else if (drag.on && Math.abs(drag.dx) > 6) {
    cardTransform = `translateX(${drag.dx}px) rotate(${drag.dx * 0.04}deg)`
    cardTransition = 'none'
  }

  return (
    <div
      style={S.root}
      onMouseMove={e => dragMove(e.clientX)}
      onMouseUp={dragEnd}
      onMouseLeave={dragEnd}
      onTouchMove={e => { e.preventDefault(); dragMove(e.touches[0].clientX) }}
      onTouchEnd={dragEnd}
    >
      <header style={S.header}>
        <span style={S.logo}>Posi</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <button style={S.iconBtn}>🔔</button>
          <button style={S.iconBtn}>👤</button>
        </div>
      </header>

      <main style={S.main}>
        {idx + 1 < posts.length && (
          <div style={{ ...S.card, position: 'absolute', width: 'calc(100% - 48px)', maxWidth: 400, transform: 'scale(0.96) translateY(10px)', opacity: 0.5, zIndex: 0 }} />
        )}

        <div
          style={{ ...S.card, transform: cardTransform, transition: cardTransition, zIndex: 1, cursor: drag.on ? 'grabbing' : 'grab', willChange: 'transform' }}
          onMouseDown={e => dragStart(e.clientX)}
          onTouchStart={e => dragStart(e.touches[0].clientX)}
        >
          <div style={S.authorRow}>
            <div style={S.avatar}>{post.initials}</div>
            <div>
              <div style={S.authorName}>{post.author}</div>
              <div style={S.authorTime}>{post.time}</div>
            </div>
          </div>

          <p style={S.postText}>{post.text}</p>

          <div style={S.indicator}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={S.indicatorLabel}>🎆 花火まであと{remaining.toLocaleString()}</span>
              <span style={S.indicatorCount}>{post.posiCount.toLocaleString()} / {post.target.toLocaleString()}</span>
            </div>
            <div style={S.bar}>
              <div style={{ ...S.barFill, width: `${progress}%` }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <button
              style={{ ...S.posiBtn, ...(hasSent ? S.posiBtnSent : {}) }}
              onMouseDown={posiDown}
              onMouseUp={posiUp}
              onTouchStart={posiDown}
              onTouchEnd={posiUp}
            >
              <span style={{ fontSize: 16 }}>{emoji}</span>
              <span>Posi</span>
              <span style={{ fontSize: 11, opacity: 0.65 }}>{post.posiCount.toLocaleString()}</span>
            </button>

            {pickerOpen && (
              <div style={S.picker}>
                {emojis.map(e => (
                  <button key={e} style={S.pickerEmoji} onClick={() => pickEmoji(e)}>{e}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

const S = {
  root: { display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)', maxWidth: 480, margin: '0 auto' },
  header: { padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--card-border)', background: 'var(--card-bg)', flexShrink: 0 },
  logo: { fontSize: 20, fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.5px' },
  iconBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 4 },
  main: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative', overflow: 'hidden' },
  card: { width: '100%', maxWidth: 400, background: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: 16, padding: 16, boxShadow: '0 2px 16px rgba(90,79,194,0.06)' },
  authorRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: 'var(--primary)', fontWeight: 700, flexShrink: 0 },
  authorName: { fontSize: 13, fontWeight: 600, color: 'var(--text)' },
  authorTime: { fontSize: 11, color: 'var(--text-sub)' },
  postText: { fontSize: 15, fontWeight: 500, lineHeight: 1.65, color: 'var(--text)', marginBottom: 16 },
  indicator: { background: 'var(--bg-posi)', borderRadius: 8, padding: '8px 12px', marginBottom: 14 },
  indicatorLabel: { fontSize: 11, color: 'var(--primary)', fontWeight: 600 },
  indicatorCount: { fontSize: 11, color: 'var(--text-sub)' },
  bar: { height: 3, background: 'rgba(90,79,194,0.15)', borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', background: 'var(--primary-light)', borderRadius: 99, transition: 'width 0.3s ease' },
  posiBtn: { background: 'var(--primary-tint)', border: '0.5px solid #b8a0e0', borderRadius: 9999, padding: '8px 20px', fontSize: 13, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  posiBtnSent: { background: 'var(--primary)', borderColor: 'transparent', color: '#fff', cursor: 'default' },
  picker: { position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: 16, padding: 12, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, zIndex: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', userSelect: 'none' },
  pickerEmoji: { fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8 },
}
