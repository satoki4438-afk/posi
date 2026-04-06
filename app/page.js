'use client'

import { useState, useRef, useEffect } from 'react'
import { db, auth } from './lib/firebase'
import { collection, addDoc, getDocs, doc, updateDoc, increment, orderBy, query, limit, serverTimestamp } from 'firebase/firestore'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'

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
  { id: '26', author: 'けいた',   initials: 'け', text: '富士山登頂した！3776m制覇',                                      posiCount: 512, target: 1000, time: '30分前',  photo: 'https://picsum.photos/seed/fuji26/400/500' },
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

const MOCK_FIREWORKS = [
  { id: 'fw1', author: 'けんじ', initials: 'け', text: '念願のカフェ開店！', hoursLeft: 3,  expired: false,
    messages: [
      { id: 'f1m1', text: 'おめでとう！', own: false },
      { id: 'f1m2', text: 'ずっと応援してたよ', own: true },
      { id: 'f1m3', text: 'カフェ行きたい！', own: false },
      { id: 'f1m4', text: 'すごい！夢が叶ったね', own: false },
      { id: 'f1m5', text: '頑張ったね🎉', own: false },
    ]
  },
  { id: 'fw2', author: 'まい',   initials: 'ま', text: '転職内定もらえた！', hoursLeft: 0,  expired: true,
    messages: [
      { id: 'f2m1', text: 'おめでとう！', own: false },
      { id: 'f2m2', text: '新天地でも頑張れ', own: false },
    ]
  },
  { id: 'fw3', author: 'たろう', initials: 'た', text: '10kmマラソン完走！', hoursLeft: 11, expired: false,
    messages: [
      { id: 'f3m1', text: '走り切ったね！', own: false },
      { id: 'f3m2', text: '諦めずに練習した成果！', own: true },
      { id: 'f3m3', text: 'かっこいい', own: false },
    ]
  },
  { id: 'fw4', author: 'りな',   initials: 'り', text: '育休明け初日乗り越えた', hoursLeft: 6, expired: false,
    messages: [
      { id: 'f4m1', text: 'お疲れ様！', own: false },
      { id: 'f4m2', text: 'よく頑張った', own: false },
      { id: 'f4m3', text: '応援してるよ', own: true },
      { id: 'f4m4', text: '無理しないでね', own: false },
    ]
  },
]

const MOCK_FRIENDS = [
  { id: 'fr1', initials: 'け', name: 'けんじ' },
  { id: 'fr2', initials: 'ま', name: 'まい' },
  { id: 'fr3', initials: 'た', name: 'たろう' },
  { id: 'fr4', initials: 'り', name: 'りな' },
  { id: 'fr5', initials: 'は', name: 'はなこ' },
  { id: 'fr6', initials: 'だ', name: 'だいき' },
]

const MOCK_CHEERS_HISTORY = [
  { id: 'ch1', author: 'たろう',   initials: 'た', text: '今日マラソン完走した！初めての10km！',                time: '2分前',   photo: 'https://picsum.photos/seed/marathon1/400/220' },
  { id: 'ch2', author: 'はなこ',   initials: 'は', text: 'TOEIC 900点超えた。3年間の勉強がついに実った！',    time: '15分前' },
  { id: 'ch3', author: 'りょうた', initials: 'り', text: 'ベンチプレス100kg達成！1年半かかったけどやっと三桁！', time: '5分前',  photo: 'https://picsum.photos/seed/gym42/400/220' },
  { id: 'ch4', author: 'えり',     initials: 'え', text: 'ランニング累計500km達成。毎朝コツコツ積み上げた結果', time: '4時間前' },
  { id: 'ch5', author: 'なつみ',   initials: 'な', text: '毎日続けてた日記、今日でちょうど1年になった📖',      time: '1時間前', photo: 'https://picsum.photos/seed/notebook7/400/220' },
  { id: 'ch6', author: 'しょうた', initials: 'し', text: 'スクワット自重100回、ノンストップでできた！',         time: '2時間前' },
]

const MOCK_ACHIEVED = [
  { id: 'ac1', author: 'けんじ',   initials: 'け', text: '念願のカフェ、今日オープンしました！店主になったよ',      achievedDate: '4/3', posiCount: 1000, photo: 'https://picsum.photos/seed/cafe99/400/220' },
  { id: 'ac2', author: 'まい',     initials: 'ま', text: '転職活動、内定もらえた！希望の会社に行けます',            achievedDate: '4/3', posiCount: 1000 },
  { id: 'ac3', author: 'りな',     initials: 'り', text: '育休明け初日、無事に乗り越えた。職場のみんなに感謝',      achievedDate: '4/2', posiCount: 1000, photo: 'https://picsum.photos/seed/office11/400/220' },
  { id: 'ac4', author: 'たろう',   initials: 'た', text: '今日マラソン完走した！初めての10km！',                    achievedDate: '4/1', posiCount: 1000, photo: 'https://picsum.photos/seed/marathon1/400/220' },
  { id: 'ac5', author: 'こうへい', initials: 'こ', text: '子供と一緒に作った工作、学校で金賞取れた！',              achievedDate: '3/31', posiCount: 1000, photo: 'https://picsum.photos/seed/craft55/400/220' },
]

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
  const [lightbox, setLightbox] = useState(null)
  const [fireworkModal, setFireworkModal] = useState(null)
  const [postModal, setPostModal] = useState(null)
  const [cheersSubView, setCheersSubView] = useState(null)
  const [notifSetting, setNotifSetting] = useState('all')
  const [, setFwTick] = useState(0)
  const [msgSent, setMsgSent] = useState({})
  const [msgModalOpen, setMsgModalOpen] = useState(false)
  const [msgText, setMsgText] = useState('')
  const [toast, setToast] = useState(null)
  const [msgPaused, setMsgPaused] = useState(false)
  const [cheerEnergy, setCheerEnergy] = useState(15)
  const [shaking, setShaking] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const longRef = useRef(null)
  const didDragRef = useRef(false)
  const fwStartRef = useRef(Date.now())

  useEffect(() => {
    const t = setTimeout(() => setWobble(false), 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setFwTick(n => n + 1), 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const RECOVERY_MS = 3600000
    const stored = localStorage.getItem('cheerEnergy')
    if (!stored) {
      localStorage.setItem('cheerEnergy', JSON.stringify({ energy: 15, lastTime: Date.now() }))
    } else {
      let { energy, lastTime } = JSON.parse(stored)
      const recovered = Math.floor((Date.now() - lastTime) / RECOVERY_MS)
      if (recovered > 0) {
        energy = Math.min(energy + recovered, 15)
        lastTime += recovered * RECOVERY_MS
        localStorage.setItem('cheerEnergy', JSON.stringify({ energy, lastTime }))
      }
      setCheerEnergy(energy)
    }
    const t = setInterval(() => {
      const s = JSON.parse(localStorage.getItem('cheerEnergy') || '{}')
      if (!s.lastTime) return
      const recovered = Math.floor((Date.now() - s.lastTime) / RECOVERY_MS)
      if (recovered > 0) {
        const newEnergy = Math.min(s.energy + recovered, 15)
        localStorage.setItem('cheerEnergy', JSON.stringify({ energy: newEnergy, lastTime: s.lastTime + recovered * RECOVERY_MS }))
        setCheerEnergy(newEnergy)
      }
    }, 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user)
      } else {
        signInAnonymously(auth).catch(console.error)
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30))
        const snap = await getDocs(q)
        if (snap.empty) {
          setPosts([])
          return
        }
        const formatTime = (date) => {
          const mins = Math.floor((Date.now() - date) / 60000)
          if (mins < 1) return 'たった今'
          if (mins < 60) return `${mins}分前`
          const h = Math.floor(mins / 60)
          if (h < 24) return `${h}時間前`
          return `${Math.floor(h / 24)}日前`
        }
        const loaded = snap.docs.map(d => ({
          id: d.id,
          author: d.data().authorName || '名無し',
          initials: (d.data().authorName || '名')[0],
          text: d.data().text || '',
          posiCount: d.data().congratsCount || 0,
          target: 1000,
          time: d.data().createdAt?.toDate ? formatTime(d.data().createdAt.toDate()) : '今',
          photo: d.data().imageUrl || null,
        }))
        setPosts(loaded)
        setIdx(0)
      } catch (e) {
        console.error('Firestore load error:', e)
      }
    }
    loadPosts()
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
    if (cheerEnergy <= 0) {
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
      return
    }
    const newEnergy = cheerEnergy - 1
    setCheerEnergy(newEnergy)
    const stored = JSON.parse(localStorage.getItem('cheerEnergy') || `{"energy":15,"lastTime":${Date.now()}}`)
    stored.energy = newEnergy
    localStorage.setItem('cheerEnergy', JSON.stringify(stored))
    setPopping(true)
    setTimeout(() => setPopping(false), 380)
    const count = 3 + Math.floor(Math.random() * 3)
    const particles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      e: emoji,
      left: 15 + Math.random() * 70,
      dur: 0.6 + Math.random() * 0.4,
      delay: Math.random() * 0.15,
    }))
    setFloatingEmojis(es => [...es, ...particles])
    const ids = new Set(particles.map(p => p.id))
    setTimeout(() => setFloatingEmojis(es => es.filter(fe => !ids.has(fe.id))), 1200)
    setSent(s => ({ ...s, [post.id]: true }))
    setPosts(ps => ps.map(p =>
      p.id === post.id ? { ...p, posiCount: Math.min(p.posiCount + 1, p.target) } : p
    ))
    if (currentUser) {
      updateDoc(doc(db, 'posts', post.id), { congratsCount: increment(1) }).catch(console.error)
    }
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

  const handleSendMsg = () => {
    if (!post || !msgText.trim()) return
    const text = msgText.trim()
    setMsgSent(s => ({ ...s, [post.id]: true }))
    setMsgModalOpen(false)
    setMsgText('')
    setToast('メッセージを送りました🎆')
    setTimeout(() => setToast(null), 2000)
    if (currentUser) {
      addDoc(collection(db, 'messages'), {
        postId: post.id,
        senderId: currentUser.uid,
        text,
        createdAt: serverTimestamp(),
      }).catch(console.error)
    }
  }

  const hasSentMsg = post ? !!msgSent[post.id] : false

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

  const fwElapsedMin = Math.floor((Date.now() - fwStartRef.current) / 60000)
  const getFwRemaining = (hoursLeft) => {
    const rem = Math.max(0, hoursLeft * 60 - fwElapsedMin)
    if (rem === 0) return null
    if (rem >= 60) return `あと${Math.floor(rem / 60)}時間${rem % 60 > 0 ? rem % 60 + '分' : ''}`
    return `あと${rem}分`
  }

  const isFeed = activeTab === 'home'
  const isScroll = activeTab === 'profile' || activeTab === 'cheers'

  const NAV_LABELS = { home: 'ホーム', goal: '目標', cheers: 'Cheers', profile: 'プロフ' }
  const navTab = (tab, icon) => (
    <button
      style={{ ...S.navTab, ...(activeTab === tab ? S.navTabActive : {}) }}
      onClick={() => { setActiveTab(tab); setCheersSubView(null) }}
    >
      <span>{icon}</span>
      <span style={S.navLabel}>{NAV_LABELS[tab]}</span>
    </button>
  )

  const PostModalCard = ({ p }) => (
    <div style={S.postModalCard} onClick={e => e.stopPropagation()}>
      {p.photo && (
        <div style={S.photoArea}>
          <img src={p.photo} alt="" style={S.photo} draggable={false} />
        </div>
      )}
      <div style={S.textArea}>
        <p style={{ ...S.postText, fontSize: p.text.length <= 10 ? '2rem' : p.text.length <= 30 ? '1.5rem' : '1.1rem' }}>{p.text}</p>
      </div>
    </div>
  )

  const HistoryCard = ({ p }) => (
    <div style={S.historyCard} onClick={() => setPostModal(p)}>
      <div style={S.histAvatar}>{p.initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{p.author}</span>
          <span style={{ fontSize: 11, color: 'var(--text-sub)', flexShrink: 0, marginLeft: 8 }}>{p.time}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.text}</div>
      </div>
    </div>
  )

  const AchievedCard = ({ p }) => (
    <div style={S.achievedHistCard} onClick={() => setPostModal(p)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={S.histAvatar}>{p.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{p.author}</div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.text}</div>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange)' }}>{p.posiCount.toLocaleString()} posi</div>
          <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>{p.achievedDate}</div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={S.root}>
      <header style={S.header}>
        <span style={S.logo}>POSI.</span>
      </header>

      {isFeed && post && (
        <div style={S.authorFixed}>
          <div style={S.avatar}>{post.initials}</div>
          <div>
            <div style={S.authorName}>{post.author}</div>
            <div style={S.authorTime}>{post.time}</div>
          </div>
        </div>
      )}

      <main
        style={{ ...S.main, overflowY: isScroll ? 'auto' : 'hidden' }}
        onMouseMove={e => isFeed && dragMove(e.clientX)}
        onMouseUp={e => isFeed && dragEnd()}
        onMouseLeave={e => isFeed && dragEnd()}
        onTouchMove={e => { if (isFeed) { e.preventDefault(); dragMove(e.touches[0].clientX) } }}
        onTouchEnd={e => isFeed && dragEnd()}
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

            <div style={{ ...S.sectionHeader, marginTop: 8 }}>
              <span style={S.sectionTitle}>⚙️ 設定</span>
            </div>
            <div style={S.settingRow}>
              <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>花火の通知</span>
              <div style={S.notifToggleGroup}>
                {[['all', '全員'], ['friends', 'フレンドのみ'], ['off', 'オフ']].map(([val, label]) => (
                  <button
                    key={val}
                    style={{ ...S.notifToggleBtn, ...(notifSetting === val ? S.notifToggleBtnActive : {}) }}
                    onClick={() => setNotifSetting(val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: 20 }} />
          </div>

        ) : activeTab === 'cheers' ? (
          cheersSubView === 'cheers-all' ? (
            <div style={S.profileScroll}>
              <button style={S.backBtn} onClick={() => setCheersSubView(null)}>← 戻る</button>
              <div style={{ ...S.sectionHeader, marginTop: 4 }}>
                <span style={S.sectionTitle}>👍 Cheersした（全件）</span>
              </div>
              {MOCK_CHEERS_HISTORY.map(p => <HistoryCard key={p.id} p={p} />)}
              <div style={{ height: 20 }} />
            </div>
          ) : cheersSubView === 'achieved-all' ? (
            <div style={S.profileScroll}>
              <button style={S.backBtn} onClick={() => setCheersSubView(null)}>← 戻る</button>
              <div style={{ ...S.sectionHeader, marginTop: 4 }}>
                <span style={S.sectionTitle}>🏆 達成済み（全件）</span>
              </div>
              {MOCK_ACHIEVED.map(p => <AchievedCard key={p.id} p={p} />)}
              <div style={{ height: 20 }} />
            </div>
          ) : (
            <div style={S.profileScroll}>
              {/* 1. 今日の花火 */}
              <div style={S.sectionHeader}>
                <span style={S.sectionTitle}>🎆 今日の花火</span>
                <span style={S.todayBadge}>本日限定</span>
              </div>
              <div style={S.hscrollWrap}>
                {MOCK_FIREWORKS.map(fw => {
                  const remText = fw.expired ? null : getFwRemaining(fw.hoursLeft)
                  const isExpired = fw.expired || remText === null
                  return (
                    <div
                      key={fw.id}
                      style={{ ...S.fireworkCard, ...(isExpired ? S.fireworkCardExpired : {}) }}
                      onClick={() => !isExpired && setFireworkModal(fw)}
                    >
                      <span style={{ fontSize: 32 }}>🎆</span>
                      <div style={S.fwAvatar}>{fw.initials}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginTop: 4, textAlign: 'center' }}>{fw.author}</div>
                      <div style={{ fontSize: 10, color: '#bbb', marginTop: 2, textAlign: 'center' }}>1,000 posi達成！</div>
                      {isExpired
                        ? <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>終了</div>
                        : <div style={{ fontSize: 10, color: 'var(--orange)', marginTop: 4 }}>{remText}</div>
                      }
                    </div>
                  )
                })}
              </div>

              {/* 2. フレンド */}
              <div style={{ ...S.sectionHeader, marginTop: 20 }}>
                <span style={S.sectionTitle}>👥 フレンド</span>
              </div>
              {MOCK_FRIENDS.length === 0 ? (
                <div style={S.emptyState}>まだフレンドがいません　POSIし合うと繋がれます</div>
              ) : (
                <div style={S.hscrollWrap}>
                  {MOCK_FRIENDS.map(fr => (
                    <div key={fr.id} style={S.friendItem} onClick={() => setActiveTab('profile')}>
                      <div style={S.friendAvatar}>{fr.initials}</div>
                      <div style={S.friendName}>{fr.name}</div>
                    </div>
                  ))}
                  <div style={S.friendItem}>
                    <div style={S.friendInviteBtn}>＋</div>
                    <div style={S.friendName}>招待</div>
                  </div>
                </div>
              )}

              {/* 3. Cheers履歴 */}
              <div style={{ ...S.sectionHeader, marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={S.sectionTitle}>👍 Cheersした</span>
                  <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>（直近100件）</span>
                </div>
              </div>
              {MOCK_CHEERS_HISTORY.length === 0 ? (
                <div style={S.emptyState}>まだCheersした投稿がありません</div>
              ) : (
                <>
                  {MOCK_CHEERS_HISTORY.slice(0, 3).map(p => <HistoryCard key={p.id} p={p} />)}
                  {MOCK_CHEERS_HISTORY.length > 3 && (
                    <button style={S.moreBtn} onClick={() => setCheersSubView('cheers-all')}>もっと見る →</button>
                  )}
                </>
              )}

              {/* 4. 達成済み */}
              <div style={{ ...S.sectionHeader, marginTop: 20 }}>
                <span style={S.sectionTitle}>🏆 達成済み</span>
              </div>
              {MOCK_ACHIEVED.length === 0 ? (
                <div style={S.emptyState}>まだ達成者がいません　どんどんPosiしよう！</div>
              ) : (
                <>
                  {MOCK_ACHIEVED.slice(0, 30).slice(0, 3).map(p => <AchievedCard key={p.id} p={p} />)}
                  {MOCK_ACHIEVED.length > 3 && (
                    <button style={S.moreBtn} onClick={() => setCheersSubView('achieved-all')}>もっと見る →</button>
                  )}
                </>
              )}

              <div style={{ height: 20 }} />
            </div>
          )

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
              <div key={fe.id} className="emoji-fly" style={{ ...S.floatingEmoji, left: `${fe.left}%`, animationDuration: `${fe.dur}s`, animationDelay: `${fe.delay}s` }}>{fe.e}</div>
            ))}

            <div style={S.centerWrap}>
              <div style={S.mainCard}>
                {post.photo ? (
                  <div style={S.photoArea} onClick={e => { e.stopPropagation(); setLightbox(post.photo) }}>
                    <img src={post.photo} alt="" style={S.photo} draggable={false} />
                  </div>
                ) : (
                  <div style={{ ...S.photoAreaNoPhoto, background: getPattern(post.id).background }}>
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

      {isFeed && post && (
        <div style={S.bottomFixed}>
          <div style={S.indicator}>
            <span
              className={remaining <= 50 ? 'indicator-blink' : ''}
              style={{ ...S.indicatorLabel, display: 'block', marginBottom: 8 }}
            >
              {remaining <= 10 ? `🎆 もうすぐ花火！あと${remaining.toLocaleString()}` : `🎆 あと${remaining.toLocaleString()}`}
            </span>
            <div style={S.bar}>
              <div style={{ ...S.barFill, width: `${progress}%`, ...(remaining <= 100 ? { background: '#e53935' } : {}) }} />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              className={popping ? 'posi-pop' : shaking ? 'posi-shake' : ''}
              style={{ ...S.posiBtn, ...(hasSent ? S.posiBtnSent : cheerEnergy <= 0 ? S.posiBtnNoEnergy : {}) }}
              onMouseDown={posiDown}
              onMouseUp={posiUp}
              onTouchStart={posiDown}
              onTouchEnd={posiUp}
            >
              <span style={{ fontSize: 24 }}>{emoji}</span>
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

          <button
            style={{ ...S.msgBtn, ...(hasSentMsg ? S.msgBtnSent : {}) }}
            disabled={hasSentMsg}
            onClick={() => !hasSentMsg && setMsgModalOpen(true)}
          >
            {hasSentMsg ? '✉️ 送信済み ✓' : '✉️ 花火が上がる前だけ送れます'}
          </button>
        </div>
      )}

      <div style={S.cheersMeter}>⚡ {cheerEnergy} / 15</div>

      <nav style={{ ...S.nav, borderTop: 'none' }}>
        {navTab('home', '🏠')}
        {navTab('goal', '🎯')}
        <button style={S.postTab} onClick={() => setActiveTab('post')}>
          <div style={S.postInner}>＋</div>
        </button>
        {navTab('cheers', '🎆')}
        {navTab('profile', '👤')}
      </nav>

      {lightbox && (
        <div style={S.lightboxOverlay} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" style={S.lightboxImg} draggable={false} />
          <button style={S.lightboxClose} onClick={e => { e.stopPropagation(); setLightbox(null) }}>×</button>
        </div>
      )}

      {fireworkModal && (
        <div style={S.fwOverlay} onClick={() => setMsgPaused(p => !p)}>
          <button style={S.lightboxClose} onClick={e => { e.stopPropagation(); setFireworkModal(null); setMsgPaused(false) }}>×</button>

          {(fireworkModal.messages || []).map((msg, i) => (
            <div
              key={msg.id}
              className={msg.own ? 'msg-blink' : ''}
              style={{
                position: 'absolute',
                top: `${12 + (i * 18) % 64}%`,
                fontSize: 16,
                fontWeight: 700,
                color: msg.own ? '#f5601e' : '#fff',
                opacity: msg.own ? 1 : 0.85,
                whiteSpace: 'nowrap',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                animationName: 'scrollMsg',
                animationDuration: `${7 + i * 1.8}s`,
                animationDelay: `${i * 1.0}s`,
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
                animationPlayState: msgPaused ? 'paused' : 'running',
                zIndex: 102,
                pointerEvents: 'none',
              }}
            >
              {msg.text}
            </div>
          ))}

          <div style={S.fwModalContent}>
            <div className="posi-pop" style={{ fontSize: 72, textAlign: 'center' }}>🎆</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', textAlign: 'center', margin: '16px 0 8px' }}>{fireworkModal.author}さん</div>
            <div style={{ fontSize: 15, color: '#ddd', textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>{fireworkModal.text}</div>
            <div style={{ fontSize: 18, color: 'var(--orange)', fontWeight: 900, textAlign: 'center' }}>🎉 1,000 posi達成！</div>
          </div>

          {msgPaused && (
            <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', fontSize: 12, color: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }}>タップで再開</div>
          )}
        </div>
      )}

      {msgModalOpen && (
        <div style={S.msgOverlay} onClick={() => setMsgModalOpen(false)}>
          <div style={S.msgSheet} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>応援メッセージを送る</div>
            <div style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 14 }}>花火が上がる前だけ送れます（20文字以内・匿名）</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={S.msgInput}
                maxLength={20}
                placeholder="おめでとう！"
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                autoFocus
              />
              <button style={S.msgSendBtn} onClick={handleSendMsg}>送る</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={S.toast}>{toast}</div>
      )}

      {postModal && (
        <div style={S.postOverlay} onClick={() => setPostModal(null)}>
          <button style={S.lightboxClose} onClick={e => { e.stopPropagation(); setPostModal(null) }}>×</button>
          <PostModalCard p={postModal} />
        </div>
      )}
    </div>
  )
}

const S = {
  root: { display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)', maxWidth: 480, margin: '0 auto' },
  header: { padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--orange)', flexShrink: 0 },
  logo: { fontSize: 33, fontWeight: 900, color: '#fff', letterSpacing: '1px' },

  main: { flex: 1, position: 'relative', overflow: 'hidden' },
  empty: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 },

  screen: { position: 'fixed', top: 130, bottom: 295, left: 0, right: 0, maxWidth: 480, margin: '0 auto', zIndex: 1, cursor: 'grab', willChange: 'transform', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' },
  centerWrap: { width: '100%' },

  authorFixed: { position: 'fixed', top: 60, left: 0, right: 0, maxWidth: 480, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)', zIndex: 2 },
  authorRow: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 46, height: 46, borderRadius: '50%', background: 'var(--orange-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--orange)', fontWeight: 800, flexShrink: 0, border: '2px solid var(--orange-border)' },
  authorName: { fontSize: 17, fontWeight: 700, color: 'var(--text)' },
  authorTime: { fontSize: 13, color: 'var(--text-sub)', marginTop: 1 },

  mainCard: { width: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(255,107,53,0.10)' },
  photoArea: { overflow: 'hidden', maxHeight: '45vh' },
  photoAreaNoPhoto: { height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: '100%', maxHeight: '45vh', objectFit: 'cover', display: 'block' },
  textArea: { background: '#fff', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  postText: { fontWeight: 700, lineHeight: 1.5, color: 'var(--text)', textAlign: 'center' },

  floatingEmoji: { position: 'absolute', bottom: 90, fontSize: 36, zIndex: 10, pointerEvents: 'none' },

  bottomFixed: { position: 'fixed', bottom: 90, left: 0, right: 0, maxWidth: 480, margin: '0 auto', padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 20 },
  indicator: { background: 'var(--card-bg)', borderRadius: 12, padding: '12px 16px' },
  indicatorLabel: { fontSize: 15, color: 'var(--orange)', fontWeight: 700 },
  bar: { height: 6, background: 'rgba(255,107,53,0.15)', borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', background: 'var(--orange)', borderRadius: 99, transition: 'width 0.3s ease' },

  posiBtn: { width: '100%', background: 'var(--orange-dark)', border: 'none', borderRadius: 9999, padding: '23px', fontSize: 20, fontWeight: 900, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(217,79,26,0.45)', letterSpacing: '0.5px' },
  posiBtnSent: { background: '#ccc', boxShadow: 'none', cursor: 'default' },
  posiBtnNoEnergy: { background: '#ccc', boxShadow: 'none', cursor: 'not-allowed' },
  cheersMeter: { textAlign: 'center', padding: '5px 0 4px', fontSize: 13, fontWeight: 800, color: 'var(--text-sub)', background: 'var(--card-bg)', borderTop: '0.5px solid var(--card-border)', flexShrink: 0 },
  picker: { position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: 16, padding: 12, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, zIndex: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
  pickerEmoji: { fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8 },

  lightboxOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  lightboxImg: { maxWidth: '100%', maxHeight: '100vh', objectFit: 'contain' },
  lightboxClose: { position: 'fixed', top: 16, right: 16, zIndex: 101, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', fontSize: 20, fontWeight: 700, color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

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

  // Cheers screen
  todayBadge: { fontSize: 11, background: 'var(--orange)', color: '#fff', borderRadius: 99, padding: '2px 8px', fontWeight: 700 },
  hscrollWrap: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' },
  fireworkCard: { minWidth: 130, background: '#1a1a2e', borderRadius: 20, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flexShrink: 0 },
  fireworkCardExpired: { opacity: 0.4 },
  fwAvatar: { width: 36, height: 36, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', fontWeight: 800, marginTop: 8 },
  friendItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 },
  friendAvatar: { width: 48, height: 48, borderRadius: '50%', background: 'var(--orange-tint)', border: '2px solid var(--orange-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--orange)', fontWeight: 800 },
  friendInviteBtn: { width: 48, height: 48, borderRadius: '50%', background: 'var(--card-bg)', border: '2px dashed var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--text-sub)', cursor: 'pointer' },
  friendName: { fontSize: 11, color: 'var(--text-sub)', fontWeight: 500 },
  historyCard: { background: 'var(--card-bg)', borderRadius: 12, padding: '12px 14px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' },
  achievedHistCard: { background: 'var(--card-bg)', borderRadius: 12, padding: '12px 14px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', borderLeft: '3px solid var(--orange)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' },
  histAvatar: { width: 38, height: 38, borderRadius: '50%', background: 'var(--orange-tint)', border: '2px solid var(--orange-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--orange)', fontWeight: 800, flexShrink: 0 },
  moreBtn: { background: 'none', border: 'none', fontSize: 13, color: 'var(--orange)', fontWeight: 700, cursor: 'pointer', textAlign: 'right', padding: '4px 0', alignSelf: 'flex-end' },
  backBtn: { background: 'none', border: 'none', fontSize: 13, color: 'var(--text-sub)', fontWeight: 600, cursor: 'pointer', textAlign: 'left', padding: '4px 0' },
  emptyState: { fontSize: 13, color: 'var(--text-sub)', textAlign: 'center', padding: '20px 0' },
  settingRow: { background: 'var(--card-bg)', borderRadius: 12, padding: '14px 14px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  notifToggleGroup: { display: 'flex', gap: 4 },
  notifToggleBtn: { fontSize: 11, fontWeight: 600, border: '1px solid var(--card-border)', borderRadius: 99, padding: '5px 10px', background: 'none', color: 'var(--text-sub)', cursor: 'pointer' },
  notifToggleBtnActive: { background: 'var(--orange)', borderColor: 'var(--orange)', color: '#fff' },

  // 応援メッセージ
  msgBtn: { width: '100%', background: 'var(--card-bg)', border: '1px solid var(--orange-border)', borderRadius: 9999, padding: '10px 14px', fontSize: 12, fontWeight: 600, color: 'var(--orange)', cursor: 'pointer', textAlign: 'center' },
  msgBtnSent: { background: '#f5f5f5', borderColor: 'var(--card-border)', color: 'var(--text-sub)', cursor: 'default' },
  msgOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
  msgSheet: { background: 'var(--card-bg)', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 480 },
  msgInput: { flex: 1, border: '1.5px solid var(--card-border)', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  msgSendBtn: { background: 'var(--orange)', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', flexShrink: 0 },
  toast: { position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#1a1a2e', color: '#fff', fontSize: 13, fontWeight: 600, padding: '10px 20px', borderRadius: 99, zIndex: 200, whiteSpace: 'nowrap' },

  // モーダル
  fwOverlay: { position: 'fixed', inset: 0, background: 'rgba(10,10,30,0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fwModalContent: { padding: '32px 24px', maxWidth: 320, width: '100%' },
  postOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' },
  postModalCard: { width: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' },
}
