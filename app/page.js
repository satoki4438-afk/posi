'use client'

import { useState, useRef, useEffect } from 'react'

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

const MOCK_PROFILE = {
  name: 'さとき',
  handle: '@satoki',
  initials: 'さ',
  friends: 12,
  posts: 34,
  totalPosi: 3247,
  goals: [
    { id: 'g1', text: '○○大学に合格するぞ！', date: '目標 2025年3月', achieved: false },
    { id: 'g2', text: '今年は恋スル！💗', date: null, achieved: false },
    { id: 'g3', text: 'フルマラソン完走する', date: '2024年12月', achieved: true },
  ],
  recentPosts: [
    { id: 'rp1', text: 'アプリのMVPをVercelにデプロイできた！', posi: 257, time: '2日前', milestone: false },
    { id: 'rp2', text: '英検2級合格した 🎉', posi: 1024, time: '先週', milestone: true },
  ],
}

const BG_PATTERNS = [
  { background: 'linear-gradient(135deg, #c8e6c9, #a5d6a7)', emoji: '🌿' },
  { background: 'linear-gradient(135deg, #bbdefb, #90caf9)', emoji: '🌊' },
  { background: 'linear-gradient(135deg, #f8bbd0, #f48fb1)', emoji: '🌸' },
  { background: 'linear-gradient(135deg, #fff9c4, #fff176)', emoji: '☀️' },
  { background: 'linear-gradient(135deg, #e1bee7, #ce93d8)', emoji: '🌙' },
]

const getPattern = (id) => BG_PATTERNS[parseInt(id, 10) % BG_PATTERNS.length]

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
  const [wobble, setWobble] = useState(true)
  const [floatingEmojis, setFloatingEmojis] = useState([])

  const longRef = useRef(null)
  const didDragRef = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setWobble(false), 1500)
    return () => clearTimeout(t)
  }, [])

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
    const fid = Date.now()
    setFloatingEmojis(es => [...es, { id: fid, e: emoji }])
    setTimeout(() => setFloatingEmojis(es => es.filter(fe => fe.id !== fid)), 800)
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

  const isWobbling = wobble && !drag.on && !leaving
  let cardTransform = 'translateX(0) rotate(0deg)'
  let cardTransition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)'

  if (!isWobbling) {
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
  }

  const NAV_LABELS = { home: 'ホーム', goal: '目標', notif: '通知', profile: 'プロフ' }
  const navTab = (tab, icon) => (
    <button
      style={{ ...S.navTab, ...(activeTab === tab ? S.navTabActive : {}) }}
      onClick={() => setActiveTab(tab)}
    >
      <span>{icon}</span>
      <span style={S.navLabel}>{NAV_LABELS[tab]}</span>
    </button>
  )

  return (
    <div style={S.root}>
      <header style={S.header}>
        <span style={S.logo}>POSI.</span>
      </header>

      <main
        style={{ ...S.main, overflowY: activeTab === 'profile' ? 'auto' : 'hidden' }}
        onMouseMove={e => activeTab !== 'profile' && dragMove(e.clientX)}
        onMouseUp={e => activeTab !== 'profile' && dragEnd()}
        onMouseLeave={e => activeTab !== 'profile' && dragEnd()}
        onTouchMove={e => { if (activeTab !== 'profile') { e.preventDefault(); dragMove(e.touches[0].clientX) } }}
        onTouchEnd={e => activeTab !== 'profile' && dragEnd()}
      >
        {activeTab === 'profile' ? (
          <div style={S.profileScroll}>
            <div style={S.profileCard}>
              <div style={S.profileAvatar}>{MOCK_PROFILE.initials}</div>
              <div style={S.profileName}>{MOCK_PROFILE.name}</div>
              <div style={S.profileHandle}>{MOCK_PROFILE.handle}</div>
              <div style={S.profileStats}>
                <div style={S.profileStat}>
                  <span style={S.profileStatNum}>{MOCK_PROFILE.friends}</span>
                  <span style={S.profileStatLabel}>フレンド</span>
                </div>
                <div style={S.profileStatDivider} />
                <div style={S.profileStat}>
                  <span style={S.profileStatNum}>{MOCK_PROFILE.posts}</span>
                  <span style={S.profileStatLabel}>投稿</span>
                </div>
              </div>
            </div>

            <div style={S.posiCountCard}>
              <div>
                <div style={S.posiCountLabel}>もらった Posi</div>
                <div style={S.posiCountNum}>{MOCK_PROFILE.totalPosi.toLocaleString()} <span style={{ fontSize: 16, fontWeight: 600 }}>posi</span></div>
              </div>
              <div style={S.posiCountIcon}>🎆</div>
            </div>

            <div style={S.sectionHeader}>
              <span style={S.sectionTitle}>🎯 目標</span>
              <span style={S.sectionAction}>＋ 追加</span>
            </div>
            {MOCK_PROFILE.goals.map(g => (
              <div key={g.id} style={{ ...S.goalCard, ...(g.achieved ? S.goalCardDone : {}) }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: g.achieved ? 'var(--text-sub)' : 'var(--text)', textDecoration: g.achieved ? 'line-through' : 'none' }}>{g.text}</div>
                  {g.date && <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 3 }}>{g.date}</div>}
                </div>
                {g.achieved && <span style={S.achievedBadge}>達成 ✓</span>}
              </div>
            ))}
            <button style={S.addGoalBtn}>＋ 目標を追加する</button>

            <div style={{ ...S.sectionHeader, marginTop: 8 }}>
              <span style={S.sectionTitle}>最近の投稿</span>
            </div>
            {MOCK_PROFILE.recentPosts.map(p => (
              <div key={p.id} style={S.recentPostCard}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>{p.text}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 700 }}>🔥 {p.posi.toLocaleString()} posi {p.milestone ? '🏅' : ''}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>{p.time}</span>
                </div>
              </div>
            ))}
            <div style={{ height: 20 }} />
          </div>
        ) : !post ? (
          <div style={S.empty}>
            <span style={{ fontSize: 52 }}>🎉</span>
            <p style={{ fontSize: 15, color: 'var(--text-sub)' }}>全部見たよ！また後でチェックしよう</p>
          </div>
        ) : (
          <div
            className={isWobbling ? 'card-wobble' : ''}
            style={{ ...S.screen, ...(isWobbling ? {} : { transform: cardTransform, transition: cardTransition }) }}
            onMouseDown={e => { setWobble(false); dragStart(e.clientX) }}
            onTouchStart={e => { setWobble(false); dragStart(e.touches[0].clientX) }}
          >
            {floatingEmojis.map(fe => (
              <div key={fe.id} className="emoji-fly" style={S.floatingEmoji}>{fe.e}</div>
            ))}

            <div style={S.cardGroup}>
              <div style={S.authorRow}>
                <div style={S.avatar}>{post.initials}</div>
                <div>
                  <div style={S.authorName}>{post.author}</div>
                  <div style={S.authorTime}>{post.time}</div>
                </div>
              </div>

              <div style={S.mainCard}>
                {post.photo ? (
                  <div style={S.photoArea}>
                    <img src={post.photo} alt="" style={S.photo} draggable={false} />
                  </div>
                ) : (
                  <div style={{ ...S.photoArea, ...{ background: getPattern(post.id).background }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 48 }}>{getPattern(post.id).emoji}</span>
                  </div>
                )}
                <div style={S.textArea}>
                  <p style={{ ...S.postText, fontSize: post.text.length <= 10 ? '2rem' : post.text.length <= 30 ? '1.5rem' : '1.1rem' }}>{post.text}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {activeTab === 'home' && post && (
        <>
          <div style={S.indicatorOuter}>
            <div style={S.indicator}>
              <span style={{ ...S.indicatorLabel, display: 'block', marginBottom: 8 }}>🎆 あと{remaining.toLocaleString()}</span>
              <div style={S.bar}>
                <div style={{ ...S.barFill, width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div style={S.posiOuter}>
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
        </>
      )}

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
  header: { padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--orange)', flexShrink: 0 },
  logo: { fontSize: 33, fontWeight: 900, color: '#fff', letterSpacing: '1px' },

  main: { flex: 1, position: 'relative', overflow: 'hidden' },
  empty: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 },

  screen: { position: 'absolute', inset: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', willChange: 'transform' },

  cardGroup: { display: 'flex', flexDirection: 'column', gap: 8, width: 'calc(100% - 32px)' },

  authorRow: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  avatar: { width: 40, height: 40, borderRadius: '50%', background: 'var(--orange-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--orange)', fontWeight: 800, flexShrink: 0, border: '2px solid var(--orange-border)' },
  authorName: { fontSize: 14, fontWeight: 700, color: 'var(--text)' },
  authorTime: { fontSize: 11, color: 'var(--text-sub)', marginTop: 1 },

  mainCard: { borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(255,107,53,0.10)' },
  photoArea: { height: 200, overflow: 'hidden' },
  photo: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  textArea: { background: '#fff', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  postText: { fontWeight: 700, lineHeight: 1.5, color: 'var(--text)', textAlign: 'center' },

  floatingEmoji: { position: 'absolute', bottom: 90, left: '50%', fontSize: 40, zIndex: 10, pointerEvents: 'none' },

  indicatorOuter: { padding: '0 16px 8px', flexShrink: 0 },
  indicator: { background: 'var(--card-bg)', borderRadius: 12, padding: '12px 16px' },
  indicatorLabel: { fontSize: 15, color: 'var(--orange)', fontWeight: 700 },
  bar: { height: 6, background: 'rgba(255,107,53,0.15)', borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', background: 'var(--orange)', borderRadius: 99, transition: 'width 0.3s ease' },

  posiOuter: { padding: '0 16px 12px', flexShrink: 0 },
  posiBtn: { width: '100%', background: 'var(--orange-dark)', border: 'none', borderRadius: 9999, padding: '15px', fontSize: 17, fontWeight: 900, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(217,79,26,0.45)', letterSpacing: '0.5px' },
  posiBtnSent: { background: '#ccc', boxShadow: 'none', cursor: 'default' },
  picker: { position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: 16, padding: 12, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, zIndex: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
  pickerEmoji: { fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8 },

  nav: { display: 'flex', alignItems: 'center', height: 64, borderTop: '0.5px solid var(--card-border)', background: 'var(--card-bg)', flexShrink: 0 },
  navTab: { flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 },
  navTabActive: { background: 'var(--orange-tint)', color: 'var(--orange)' },
  navLabel: { fontSize: 10, fontWeight: 500, color: 'var(--text-sub)' },

  profileScroll: { padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 },
  profileCard: { background: 'var(--card-bg)', borderRadius: 16, padding: '20px 16px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  profileAvatar: { width: 64, height: 64, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#fff', fontWeight: 900, marginBottom: 4 },
  profileName: { fontSize: 18, fontWeight: 700, color: 'var(--text)' },
  profileHandle: { fontSize: 13, color: 'var(--text-sub)' },
  profileStats: { display: 'flex', gap: 24, marginTop: 8, alignItems: 'center' },
  profileStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  profileStatNum: { fontSize: 18, fontWeight: 700, color: 'var(--text)' },
  profileStatLabel: { fontSize: 11, color: 'var(--text-sub)' },
  profileStatDivider: { width: 1, height: 28, background: 'var(--card-border)' },

  posiCountCard: { background: 'var(--card-bg)', borderRadius: 16, padding: '14px 16px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  posiCountLabel: { fontSize: 12, color: 'var(--text-sub)', marginBottom: 4 },
  posiCountNum: { fontSize: 32, fontWeight: 900, color: 'var(--orange)' },
  posiCountIcon: { width: 48, height: 48, borderRadius: 12, background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 },

  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 2px' },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text)' },
  sectionAction: { fontSize: 13, fontWeight: 600, color: 'var(--orange)', cursor: 'pointer' },

  goalCard: { background: 'var(--card-bg)', borderRadius: 12, padding: '12px 14px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', borderLeft: '3px solid var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  goalCardDone: { borderLeft: '3px solid #ccc', background: '#fafafa' },
  achievedBadge: { fontSize: 11, fontWeight: 700, color: '#2e7d32', background: '#e8f5e9', borderRadius: 99, padding: '3px 8px', flexShrink: 0 },
  addGoalBtn: { background: 'none', border: '1.5px dashed var(--card-border)', borderRadius: 12, padding: '12px', fontSize: 13, color: 'var(--text-sub)', cursor: 'pointer', width: '100%', textAlign: 'center' },

  recentPostCard: { background: 'var(--card-bg)', borderRadius: 12, padding: '12px 14px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  postTab: { flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  postInner: { width: 48, height: 48, borderRadius: '50%', background: 'var(--orange)', color: '#fff', fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(255,107,53,0.4)' },
}
