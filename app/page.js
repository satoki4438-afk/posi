'use client'

import { useState, useRef } from 'react'

const EMOJIS = ['👍', '🎉', '🔥', '💗', '🌸', '👏', '💪', '✨', '🥹', '🎊', '🌈']
const EMOJIS_FREE = EMOJIS.slice(0, 5)

const MOCK_POSTS = [
  { id: '1',  author: 'たろう',   initials: 'た', text: '今日マラソン完走した！初めての10km！',                         posiCount: 847, target: 1000, time: '2分前' },
  { id: '2',  author: 'はなこ',   initials: 'は', text: 'TOEIC 900点超えた。3年間の勉強がついに実った！',               posiCount: 234, target: 1000, time: '15分前' },
  { id: '3',  author: 'けんじ',   initials: 'け', text: '念願のカフェ、今日オープンしました！店主になったよ',           posiCount: 992, target: 1000, time: '1時間前' },
  { id: '4',  author: 'みさき',   initials: 'み', text: '子供が初めて自転車に乗れた！1週間の練習の成果',               posiCount: 156, target: 1000, time: '2時間前' },
  { id: '5',  author: 'ゆうき',   initials: 'ゆ', text: '独学3ヶ月でWebアプリ完成させた。ついにリリースできた！',       posiCount: 421, target: 1000, time: '3時間前' },
  { id: '6',  author: 'りょうた', initials: 'り', text: 'ベンチプレス100kg達成！1年半かかったけどやっと三桁！',         posiCount: 763, target: 1000, time: '5分前' },
  { id: '7',  author: 'あやか',   initials: 'あ', text: '簿記2級、一発合格した！毎朝5時起きで勉強した甲斐があった',     posiCount: 88,  target: 1000, time: '32分前' },
  { id: '8',  author: 'だいき',   initials: 'だ', text: '初めての営業で契約取れた！断られ続けて2ヶ月、ようやく',       posiCount: 519, target: 1000, time: '45分前' },
  { id: '9',  author: 'なつみ',   initials: 'な', text: '毎日続けてた日記、今日でちょうど1年になった📖',               posiCount: 302, target: 1000, time: '1時間前' },
  { id: '10', author: 'しょうた', initials: 'し', text: 'スクワット自重100回、ノンストップでできた！半年前は30回だった', posiCount: 671, target: 1000, time: '2時間前' },
  { id: '11', author: 'まい',     initials: 'ま', text: '転職活動、内定もらえた！希望の会社に行けます',                 posiCount: 950, target: 1000, time: '2時間前' },
  { id: '12', author: 'こうへい', initials: 'こ', text: '子供と一緒に作った工作、学校で金賞取れた！',                   posiCount: 137, target: 1000, time: '3時間前' },
  { id: '13', author: 'えり',     initials: 'え', text: 'ランニング累計500km達成。毎朝コツコツ積み上げた結果',           posiCount: 408, target: 1000, time: '4時間前' },
  { id: '14', author: 'とも',     initials: 'と', text: '苦手だった英語の発表、今日は震えなかった。小さな一歩',         posiCount: 54,  target: 1000, time: '5時間前' },
  { id: '15', author: 'かずや',   initials: 'か', text: 'フリーランス1年目の確定申告、自力で乗り越えた！',             posiCount: 829, target: 1000, time: '6時間前' },
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
  const [activeTab, setActiveTab] = useState('home')

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

  const progress = post ? (post.posiCount / post.target) * 100 : 0
  const remaining = post ? post.target - post.posiCount : 0
  const hasSent = post ? !!sent[post.id] : false
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
    <div style={S.root}>
      <header style={S.header}>
        <span style={S.logo}>Posi</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <button style={S.iconBtn}>🔔</button>
          <button style={S.iconBtn}>👤</button>
        </div>
      </header>

      <main
        style={S.main}
        onMouseMove={e => dragMove(e.clientX)}
        onMouseUp={dragEnd}
        onMouseLeave={dragEnd}
        onTouchMove={e => { e.preventDefault(); dragMove(e.touches[0].clientX) }}
        onTouchEnd={dragEnd}
      >
        {!post ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 48 }}>🎉</span>
            <p style={{ fontSize: 15, color: 'var(--text-sub)' }}>全部見たよ！また後でチェックしよう</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>

      <nav style={S.nav}>
        <button style={{ ...S.navBtn, ...(activeTab === 'home' ? S.navBtnActive : {}) }} onClick={() => setActiveTab('home')}>
          <span style={S.navIcon}>🏠</span>
          <span style={S.navLabel}>ホーム</span>
        </button>
        <div style={{ flex: 1 }} />
        <button style={S.postBtn}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>＋</span>
        </button>
        <div style={{ flex: 1 }} />
        <button style={{ ...S.navBtn, ...(activeTab === 'notif' ? S.navBtnActive : {}) }} onClick={() => setActiveTab('notif')}>
          <span style={S.navIcon}>🔔</span>
          <span style={S.navLabel}>通知</span>
        </button>
        <button style={{ ...S.navBtn, ...(activeTab === 'profile' ? S.navBtnActive : {}) }} onClick={() => setActiveTab('profile')}>
          <span style={S.navIcon}>👤</span>
          <span style={S.navLabel}>プロフィール</span>
        </button>
      </nav>
    </div>
  )
}

const S = {
  root: { display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)', maxWidth: 480, margin: '0 auto' },
  header: { padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--card-border)', background: 'var(--card-bg)', flexShrink: 0 },
  logo: { fontSize: 22, fontWeight: 800, color: 'var(--orange)', letterSpacing: '-0.5px' },
  iconBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 4 },
  main: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative', overflow: 'hidden' },
  card: { width: '100%', maxWidth: 400, background: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: 16, padding: 16, boxShadow: '0 2px 20px rgba(255,107,53,0.08)' },
  authorRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: 'var(--orange-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: 'var(--orange)', fontWeight: 700, flexShrink: 0, border: '1.5px solid var(--orange-border)' },
  authorName: { fontSize: 13, fontWeight: 600, color: 'var(--text)' },
  authorTime: { fontSize: 11, color: 'var(--text-sub)' },
  postText: { fontSize: 15, fontWeight: 500, lineHeight: 1.65, color: 'var(--text)', marginBottom: 16 },
  indicator: { background: 'var(--bg-posi)', borderRadius: 8, padding: '8px 12px', marginBottom: 14, border: '0.5px solid var(--orange-border)' },
  indicatorLabel: { fontSize: 11, color: 'var(--orange)', fontWeight: 700 },
  indicatorCount: { fontSize: 11, color: 'var(--text-sub)' },
  bar: { height: 3, background: 'rgba(255,107,53,0.15)', borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', background: 'var(--orange)', borderRadius: 99, transition: 'width 0.3s ease' },
  posiBtn: { background: 'var(--orange-tint)', border: '1.5px solid var(--orange)', borderRadius: 9999, padding: '9px 24px', fontSize: 13, fontWeight: 700, color: 'var(--orange)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  posiBtnSent: { background: 'var(--orange)', borderColor: 'transparent', color: '#fff', cursor: 'default' },
  picker: { position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: 16, padding: 12, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, zIndex: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', userSelect: 'none' },
  pickerEmoji: { fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8 },
  nav: { display: 'flex', alignItems: 'center', borderTop: '0.5px solid var(--card-border)', background: 'var(--card-bg)', padding: '8px 8px 8px', flexShrink: 0 },
  navBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 16px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 12 },
  navBtnActive: { background: 'var(--orange-tint)' },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, color: 'var(--text-sub)', fontWeight: 500 },
  postBtn: { width: 52, height: 52, borderRadius: '50%', background: 'var(--orange)', border: 'none', color: '#fff', fontSize: 22, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(255,107,53,0.4)', flexShrink: 0 },
}
