'use client'

import { useState, useRef } from 'react'

const EMOJIS = ['👍', '🎉', '🔥', '💗', '🌸', '👏', '💪', '✨', '🥹', '🎊', '🌈']
const EMOJIS_FREE = EMOJIS.slice(0, 5)

const MOCK_POSTS = [
  { id: '1',  author: 'たろう',   initials: 'た', text: '今日マラソン完走した！初めての10km！',                          posiCount: 847, target: 1000, time: '2分前',   photo: 'https://picsum.photos/seed/marathon1/400/220' },
  { id: '2',  author: 'はなこ',   initials: 'は', text: 'TOEIC 900点超えた。3年間の勉強がついに実った！',                posiCount: 234, target: 1000, time: '15分前' },
  { id: '3',  author: 'けんじ',   initials: 'け', text: '念願のカフェ、今日オープンしました！店主になったよ',            posiCount: 992, target: 1000, time: '1時間前', photo: 'https://picsum.photos/seed/cafe99/400/220' },
  { id: '4',  author: 'みさき',   initials: 'み', text: '子供が初めて自転車に乗れた！1週間の練習の成果',                posiCount: 156, target: 1000, time: '2時間前' },
  { id: '5',  author: 'ゆうき',   initials: 'ゆ', text: '独学3ヶ月でWebアプリ完成させた。ついにリリースできた！',        posiCount: 421, target: 1000, time: '3時間前' },
  { id: '6',  author: 'りょうた', initials: 'り', text: 'ベンチプレス100kg達成！1年半かかったけどやっと三桁！',          posiCount: 763, target: 1000, time: '5分前',   photo: 'https://picsum.photos/seed/gym42/400/220' },
  { id: '7',  author: 'あやか',   initials: 'あ', text: '簿記2級、一発合格した！毎朝5時起きで勉強した甲斐があった',      posiCount: 88,  target: 1000, time: '32分前' },
  { id: '8',  author: 'だいき',   initials: 'だ', text: '初めての営業で契約取れた！断られ続けて2ヶ月、ようやく',        posiCount: 519, target: 1000, time: '45分前' },
  { id: '9',  author: 'なつみ',   initials: 'な', text: '毎日続けてた日記、今日でちょうど1年になった📖',                posiCount: 302, target: 1000, time: '1時間前', photo: 'https://picsum.photos/seed/notebook7/400/220' },
  { id: '10', author: 'しょうた', initials: 'し', text: 'スクワット自重100回、ノンストップでできた！半年前は30回だった',  posiCount: 671, target: 1000, time: '2時間前' },
  { id: '11', author: 'まい',     initials: 'ま', text: '転職活動、内定もらえた！希望の会社に行けます',                  posiCount: 950, target: 1000, time: '2時間前' },
  { id: '12', author: 'こうへい', initials: 'こ', text: '子供と一緒に作った工作、学校で金賞取れた！',                    posiCount: 137, target: 1000, time: '3時間前', photo: 'https://picsum.photos/seed/craft55/400/220' },
  { id: '13', author: 'えり',     initials: 'え', text: 'ランニング累計500km達成。毎朝コツコツ積み上げた結果',            posiCount: 408, target: 1000, time: '4時間前' },
  { id: '14', author: 'とも',     initials: 'と', text: '苦手だった英語の発表、今日は震えなかった。小さな一歩',          posiCount: 54,  target: 1000, time: '5時間前' },
  { id: '15', author: 'かずや',   initials: 'か', text: 'フリーランス1年目の確定申告、自力で乗り越えた！',              posiCount: 829, target: 1000, time: '6時間前' },
  { id: '16', author: 'のぞみ',   initials: 'の', text: '初めてのハーフマラソン、2時間10分で完走！',                    posiCount: 612, target: 1000, time: '7時間前', photo: 'https://picsum.photos/seed/run88/400/220' },
  { id: '17', author: 'たいち',   initials: 'た', text: '宅建の試験、合格できた！独学8ヶ月の勉強が実を結んだ',            posiCount: 278, target: 1000, time: '8時間前' },
  { id: '18', author: 'さくら',   initials: 'さ', text: '初めて自分で料理した手作りケーキ、家族に大好評だった！',        posiCount: 445, target: 1000, time: '9時間前', photo: 'https://picsum.photos/seed/cake33/400/220' },
  { id: '19', author: 'ひろき',   initials: 'ひ', text: 'デッドリフト150kg達成。2年かかったけど目標クリア！',            posiCount: 733, target: 1000, time: '10時間前' },
  { id: '20', author: 'ゆいな',   initials: 'ゆ', text: 'ブログ100記事書いた！毎週更新してついに達成',                  posiCount: 91,  target: 1000, time: '11時間前' },
  { id: '21', author: 'けいすけ', initials: 'け', text: 'チームで開発したアプリ、App Storeの審査が通過した！',           posiCount: 884, target: 1000, time: '12時間前', photo: 'https://picsum.photos/seed/phone22/400/220' },
  { id: '22', author: 'あいこ',   initials: 'あ', text: '子供の寝かしつけ後に毎日1時間勉強、ついにFP2級合格',           posiCount: 322, target: 1000, time: '13時間前' },
  { id: '23', author: 'まさと',   initials: 'ま', text: '懸垂20回連続できた！毎日コツコツやり続けた1年の成果',           posiCount: 567, target: 1000, time: '14時間前' },
  { id: '24', author: 'りな',     initials: 'り', text: '育休明け初日、無事に乗り越えた。職場のみんなに感謝',            posiCount: 719, target: 1000, time: '15時間前', photo: 'https://picsum.photos/seed/office11/400/220' },
  { id: '25', author: 'しんじ',   initials: 'し', text: '家族で植えた家庭菜園、初めてのトマトが収穫できた！',            posiCount: 183, target: 1000, time: '16時間前', photo: 'https://picsum.photos/seed/garden5/400/220' },
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
  const [popping, setPopping] = useState(false)

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
    setTimeout(advance, 300)
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
      if (Math.abs(d.dx) > 80) swipe(d.dx > 0 ? 'right' : 'left')
      return { on: false, x0: 0, dx: 0 }
    })
  }

  const sendPosi = () => {
    if (!post || sent[post.id]) return
    setPopping(true)
    setTimeout(() => setPopping(false), 380)
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
    if (didDragRef.current) { dragEnd(); return }
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
    cardTransform = 'translateX(-120vw) rotate(-22deg)'
    cardTransition = 'transform 0.3s ease-in'
  } else if (leaving === 'right') {
    cardTransform = 'translateX(120vw) rotate(22deg)'
    cardTransition = 'transform 0.3s ease-in'
  } else if (drag.on && Math.abs(drag.dx) > 6) {
    cardTransform = `translateX(${drag.dx}px) rotate(${drag.dx * 0.03}deg)`
    cardTransition = 'none'
  }

  const navTab = (tab, icon) => (
    <button
      style={{ ...S.navTab, ...(activeTab === tab ? S.navTabActive : {}) }}
      onClick={() => setActiveTab(tab)}
    >
      {icon}
    </button>
  )

  return (
    <div style={S.root}>
      <header style={S.header}>
        <span style={S.logo}>POSI.</span>
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
          <div style={S.empty}>
            <span style={{ fontSize: 52 }}>🎉</span>
            <p style={{ fontSize: 15, color: 'var(--text-sub)' }}>全部見たよ！また後でチェックしよう</p>
          </div>
        ) : (
          <>
            {idx + 1 < posts.length && (
              <div style={S.cardBehind} />
            )}

            <div
              style={{ ...S.card, transform: cardTransform, transition: cardTransition }}
              onMouseDown={e => dragStart(e.clientX)}
              onTouchStart={e => dragStart(e.touches[0].clientX)}
            >
              <div style={S.cardTop}>
                <div style={S.avatar}>{post.initials}</div>
                <div>
                  <div style={S.authorName}>{post.author}</div>
                  <div style={S.authorTime}>{post.time}</div>
                </div>
              </div>

              <div style={S.cardMiddle}>
                <p style={S.postText}>{post.text}</p>
                {post.photo && (
                  <div style={S.photoWrap}>
                    <img src={post.photo} alt="" style={S.photo} draggable={false} />
                  </div>
                )}
              </div>

              <div style={S.cardBottom}>
                <div style={S.indicator}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={S.indicatorLabel}>🎆 花火まであと{remaining.toLocaleString()}</span>
                    <span style={S.indicatorCount}>{post.posiCount.toLocaleString()} / {post.target.toLocaleString()}</span>
                  </div>
                  <div style={S.bar}>
                    <div style={{ ...S.barFill, width: `${progress}%` }} />
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <button
                    className={popping ? 'posi-pop' : ''}
                    style={{ ...S.posiBtn, ...(hasSent ? S.posiBtnSent : {}) }}
                    onMouseDown={posiDown}
                    onMouseUp={posiUp}
                    onTouchStart={posiDown}
                    onTouchEnd={posiUp}
                  >
                    <span style={{ fontSize: 20 }}>{emoji}</span>
                    <span>POSI.</span>
                    <span style={{ fontSize: 12, opacity: 0.75, fontWeight: 600 }}>{post.posiCount.toLocaleString()}</span>
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
            </div>
          </>
        )}
      </main>

      <nav style={S.nav}>
        {navTab('home', '🏠')}
        {navTab('goal', '🎯')}
        <button style={S.postTab} onClick={() => setActiveTab('post')}>
          <div style={S.postInner}>＋</div>
        </button>
        {navTab('notif', '🔔')}
        {navTab('profile', '👤')}
      </nav>
    </div>
  )
}

const S = {
  root: { display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)', maxWidth: 480, margin: '0 auto' },
  header: { padding: '10px 16px', display: 'flex', alignItems: 'center', background: 'var(--card-bg)', borderBottom: '0.5px solid var(--card-border)', flexShrink: 0 },
  logo: { fontSize: 22, fontWeight: 900, color: 'var(--orange)', letterSpacing: '1px' },

  main: { flex: 1, position: 'relative', overflow: 'hidden' },
  empty: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 },

  cardBehind: { position: 'absolute', inset: '6px 4px 0', background: 'var(--card-bg)', borderRadius: '20px 20px 0 0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', zIndex: 0 },
  card: { position: 'absolute', inset: 0, background: 'var(--card-bg)', zIndex: 1, display: 'flex', flexDirection: 'column', cursor: 'grab', willChange: 'transform', boxShadow: '0 4px 24px rgba(255,107,53,0.08)' },

  cardTop: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px', flexShrink: 0 },
  avatar: { width: 40, height: 40, borderRadius: '50%', background: 'var(--orange-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--orange)', fontWeight: 800, flexShrink: 0, border: '2px solid var(--orange-border)' },
  authorName: { fontSize: 14, fontWeight: 700, color: 'var(--text)' },
  authorTime: { fontSize: 11, color: 'var(--text-sub)', marginTop: 1 },

  cardMiddle: { flex: 1, overflow: 'hidden', padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 },
  postText: { fontSize: 17, fontWeight: 600, lineHeight: 1.65, color: 'var(--text)', flexShrink: 0 },
  photoWrap: { flex: 1, borderRadius: 16, overflow: 'hidden', minHeight: 0 },
  photo: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },

  cardBottom: { padding: '0 16px 20px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 },
  indicator: { background: 'var(--bg-posi)', borderRadius: 10, padding: '8px 12px', border: '0.5px solid var(--orange-border)' },
  indicatorLabel: { fontSize: 11, color: 'var(--orange)', fontWeight: 700 },
  indicatorCount: { fontSize: 11, color: 'var(--text-sub)' },
  bar: { height: 3, background: 'rgba(255,107,53,0.15)', borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', background: 'var(--orange)', borderRadius: 99, transition: 'width 0.3s ease' },

  posiBtn: { width: '100%', background: 'var(--orange)', border: 'none', borderRadius: 9999, padding: '15px', fontSize: 17, fontWeight: 900, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(255,107,53,0.4)', letterSpacing: '0.5px' },
  posiBtnSent: { background: '#ccc', boxShadow: 'none', cursor: 'default' },
  picker: { position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: 16, padding: 12, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, zIndex: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
  pickerEmoji: { fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8 },

  nav: { display: 'flex', alignItems: 'center', height: 60, borderTop: '0.5px solid var(--card-border)', background: 'var(--card-bg)', flexShrink: 0 },
  navTab: { flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  navTabActive: { background: 'var(--orange-tint)' },
  postTab: { flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  postInner: { width: 48, height: 48, borderRadius: '50%', background: 'var(--orange)', color: '#fff', fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(255,107,53,0.4)' },
}
