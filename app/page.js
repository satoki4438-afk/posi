'use client'

import { useState, useRef, useEffect } from 'react'
import { getApp } from 'firebase/app'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, auth, getMessagingInstance } from './lib/firebase'
import { collection, addDoc, getDocs, doc, updateDoc, increment, orderBy, query, limit, serverTimestamp, onSnapshot, deleteDoc, setDoc, getDoc, Timestamp } from 'firebase/firestore'
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'

const EMOJIS = ['👍', '🎉', '🔥', '💗', '🌸', '👏', '💪', '✨', '🥹', '🎊', '🌈']
const EMOJIS_FREE = EMOJIS.slice(0, 5)

const MOCK_POSTS = [
  { id: '1', author: 'たろう', initials: 'た', text: '今日マラソン完走した！初めての10km！',            posiCount: 847, target: 1000, time: '今すぐ',   photo: 'https://picsum.photos/seed/run/400/300' },
  { id: '2', author: 'だいき', initials: 'だ', text: '初めての営業で契約取れた！断られ続けて2ヶ月、ようやく', posiCount: 519, target: 1000, time: '45分前' },
  { id: '3', author: 'なつみ', initials: 'な', text: '毎日続けてた日記、今日でちょうど1年になった',      posiCount: 302, target: 1000, time: '1時間前' },
  { id: '4', author: 'みさき', initials: 'み', text: '子供が初めて自転車に乗れた！1週間の練習の成果',    posiCount: 156, target: 1000, time: '2時間前' },
  { id: '5', author: 'けんじ', initials: 'け', text: '念願のカフェ、今日オープンしました！店主になったよ', posiCount: 992, target: 1000, time: '3時間前', photo: 'https://picsum.photos/seed/cafe/400/300' },
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

const MOCK_FIREWORKS = []

const MOCK_CHEERS_HISTORY = []

const MOCK_ACHIEVED = []

const BG_PATTERNS = [
  { background: 'linear-gradient(135deg, #c8e6c9, #a5d6a7)', emoji: '🌿' },
  { background: 'linear-gradient(135deg, #bbdefb, #90caf9)', emoji: '🌊' },
  { background: 'linear-gradient(135deg, #f8bbd0, #f48fb1)', emoji: '🌸' },
  { background: 'linear-gradient(135deg, #fff9c4, #fff176)', emoji: '☀️' },
  { background: 'linear-gradient(135deg, #e1bee7, #ce93d8)', emoji: '🌙' },
]

const POST_BG_PATTERNS = [
  { id: 0, background: 'linear-gradient(135deg, #ffcc80, #ff8a65)', label: '🌅 オレンジ系' },
  { id: 1, background: 'linear-gradient(135deg, #c8e6c9, #a5d6a7)', label: '🌿 グリーン系' },
  { id: 2, background: 'linear-gradient(135deg, #bbdefb, #90caf9)', label: '🌊 ブルー系' },
  { id: 3, background: 'linear-gradient(135deg, #1a1a2e, #3a3a5c)', label: '⭐ ネイビー系' },
  { id: 4, background: 'linear-gradient(135deg, #f8bbd0, #f48fb1)', label: '🌸 ピンク系' },
]

const getPattern = (id) => {
  const n = String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return BG_PATTERNS[n % BG_PATTERNS.length]
}

const hashColor = (name) => {
  const colors = ['#ff6b35', '#4caf50', '#2196f3', '#9c27b0', '#f5a623', '#00bcd4', '#e91e63', '#ff9800']
  const n = String(name).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colors[n % colors.length]
}

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
  const [userProfile, setUserProfile] = useState(null)
  const [authScreen, setAuthScreen] = useState(null) // null | 'top' | 'register' | 'login'
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authNickname, setAuthNickname] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [goals, setGoals] = useState([])
  const [goalModal, setGoalModal] = useState(null) // null | 'add' | {goal} for edit
  const [goalText, setGoalText] = useState('')
  const [goalDeadline, setGoalDeadline] = useState('')
  const [goalMenuId, setGoalMenuId] = useState(null)
  const [goalDeleteConfirm, setGoalDeleteConfirm] = useState(null)
  const goalLongRef = useRef(null)
  const [notifications, setNotifications] = useState([])
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false)
  const [postText, setPostText] = useState('')
  const [postPhotoFile, setPostPhotoFile] = useState(null)
  const [postPhotoPreview, setPostPhotoPreview] = useState(null)
  const [postPatternId, setPostPatternId] = useState(0)
  const [postSubmitting, setPostSubmitting] = useState(false)
  const [postDone, setPostDone] = useState(false)
  const [confettiPieces, setConfettiPieces] = useState([])
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(true)
  const [onboardIdx, setOnboardIdx] = useState(0)
  const [selectedEffect, setSelectedEffect] = useState('🎆')
  const [achieveModal, setAchieveModal] = useState(null)
  const [achieveStep, setAchieveStep] = useState(1)
  const [achieveEffect, setAchieveEffect] = useState('🎆')
  const [achieveMsg, setAchieveMsg] = useState('')
  const [achieveMsgPos, setAchieveMsgPos] = useState('mid')
  const [achieveMsgColor, setAchieveMsgColor] = useState('white')
  const [achieveMsgSize, setAchieveMsgSize] = useState('mid')
  const [achieveEffectItems, setAchieveEffectItems] = useState([])
  const [friends, setFriends] = useState([])
  const [achieveMessages, setAchieveMessages] = useState([])

  const longRef = useRef(null)
  const didDragRef = useRef(false)
  const fwStartRef = useRef(Date.now())
  const fileInputRef = useRef(null)
  const fireworkCanvasRef = useRef(null)
  const fireworkAnimRef = useRef(null)

  useEffect(() => {
    if (!localStorage.getItem('posi_onboarded')) {
      setOnboardingDone(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setWobble(false), 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setFwTick(n => n + 1), 60000)
    return () => clearInterval(t)
  }, [])

  const STAMINA_RECOVERY_MS = 1800000 // 30分

  const calcStaminaRecovery = (stamina, lastRecoveryAt) => {
    const lastMs = lastRecoveryAt?.toMillis ? lastRecoveryAt.toMillis() : (lastRecoveryAt?.seconds ? lastRecoveryAt.seconds * 1000 : Date.now())
    const recovered = Math.floor((Date.now() - lastMs) / STAMINA_RECOVERY_MS)
    if (recovered <= 0) return { stamina, lastRecoveryMs: lastMs }
    const newStamina = Math.min(stamina + recovered, 15)
    const newLastMs = lastMs + recovered * STAMINA_RECOVERY_MS
    return { stamina: newStamina, lastRecoveryMs: newLastMs }
  }

  const loadStamina = async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid, 'stamina', 'current'))
      if (!snap.exists()) {
        const now = Timestamp.now()
        await setDoc(doc(db, 'users', uid, 'stamina', 'current'), { stamina: 15, maxStamina: 15, lastRecoveryAt: now })
        setCheerEnergy(15)
        return
      }
      const { stamina, lastRecoveryAt } = snap.data()
      const { stamina: newStamina, lastRecoveryMs } = calcStaminaRecovery(stamina, lastRecoveryAt)
      if (newStamina !== stamina) {
        await setDoc(doc(db, 'users', uid, 'stamina', 'current'), { stamina: newStamina, maxStamina: 15, lastRecoveryAt: Timestamp.fromMillis(lastRecoveryMs) })
      }
      setCheerEnergy(newStamina)
    } catch (e) { console.error('stamina load error:', e) }
  }

  useEffect(() => {
    const t = setInterval(async () => {
      const user = auth.currentUser
      if (!user) return
      await loadStamina(user.uid)
    }, 60000)
    return () => clearInterval(t)
  }, [])

  const registerFcmToken = async (uid) => {
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
      const { getToken } = await import('firebase/messaging')
      const messaging = await getMessagingInstance()
      if (!messaging) return
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js'),
      })
      if (token) {
        await setDoc(doc(db, 'users', uid), { fcmToken: token }, { merge: true })
      }
    } catch (e) { console.error('FCM token error:', e) }
  }

  const loadFriends = async (uid) => {
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'friends'))
      setFriends(snap.docs.map(d => ({ uid: d.id, ...d.data() })))
    } catch (e) { console.error('friends load error:', e) }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user)
        setAuthScreen(null)
        try {
          const snap = await getDoc(doc(db, 'users', user.uid))
          if (snap.exists()) setUserProfile(snap.data())
        } catch (e) { console.error(e) }
        registerFcmToken(user.uid)
        loadStamina(user.uid)
        loadFriends(user.uid)
      } else {
        setCurrentUser(null)
        setUserProfile(null)
        setFriends([])
        setCheerEnergy(15)
        setAuthScreen('top')
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
          authorId: d.data().authorId || null,
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
    try {
      setDrag(d => {
        if (!d.on) return d
        if (Math.abs(d.dx) > 80) swipe(d.dx > 0 ? 'right' : 'left')
        return { on: false, x0: 0, dx: 0 }
      })
    } catch (e) {
      console.error('[dragEnd error]', e)
    }
  }

  const sendPosi = (overrideEmoji) => {
    if (!post || sent[post.id]) return
    const isFriendPost = currentUser && post.authorId && friends.some(f => f.uid === post.authorId)
    if (!isFriendPost && cheerEnergy <= 0) {
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
      return
    }
    if (!isFriendPost) {
      const newEnergy = cheerEnergy - 1
      setCheerEnergy(newEnergy)
      if (currentUser) {
        setDoc(doc(db, 'users', currentUser.uid, 'stamina', 'current'), { stamina: newEnergy, maxStamina: 15 }, { merge: true }).catch(console.error)
      }
    }
    setPopping(true)
    setTimeout(() => setPopping(false), 380)
    const count = 3 + Math.floor(Math.random() * 3)
    const particles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      e: overrideEmoji || emoji,
      left: 15 + Math.random() * 70,
      dur: 0.65 + Math.random() * 0.3,
      delay: Math.random() * 0.15,
      tx: Math.round((Math.random() - 0.5) * 60),
      rot: Math.round((Math.random() - 0.5) * 50),
    }))
    setFloatingEmojis(es => [...es, ...particles])
    const ids = new Set(particles.map(p => p.id))
    setTimeout(() => setFloatingEmojis(es => es.filter(fe => !ids.has(fe.id))), 1200)
    setSent(s => ({ ...s, [post.id]: true }))
    const newCount = Math.min(post.posiCount + 1, post.target)
    setPosts(ps => ps.map(p =>
      p.id === post.id ? { ...p, posiCount: newCount } : p
    ))
    if (newCount >= post.target && post.posiCount < post.target) {
      setTimeout(() => {
        setAchieveModal({ post: { ...post, posiCount: newCount } })
        setAchieveStep(1)
        setAchieveEffect('🎆')
        setAchieveMsg('')
        setAchieveMsgPos('mid')
        setAchieveMsgColor('white')
        setAchieveMsgSize('mid')
      }, 400)
    }
    if (currentUser) {
      updateDoc(doc(db, 'posts', post.id), { congratsCount: increment(1) }).catch(console.error)
      sendPosiNotification(post, newCount)
      recordPosiAndCheckFriend(post)
    }
  }

  const recordPosiAndCheckFriend = async (targetPost) => {
    if (!targetPost.authorId || targetPost.authorId === currentUser.uid) return
    try {
      // posi記録
      await setDoc(doc(db, 'posts', targetPost.id, 'posis', currentUser.uid), {
        uid: currentUser.uid,
        createdAt: serverTimestamp(),
      })
      // 相互チェック：相手が自分の投稿にPosiしているか確認
      const myPostsSnap = await getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50)))
      const myPosts = myPostsSnap.docs.filter(d => d.data().authorId === currentUser.uid)
      let isMutual = false
      for (const myPost of myPosts) {
        const theirPosiSnap = await getDoc(doc(db, 'posts', myPost.id, 'posis', targetPost.authorId))
        if (theirPosiSnap.exists()) { isMutual = true; break }
      }
      if (isMutual && !friends.some(f => f.uid === targetPost.authorId)) {
        const authorSnap = await getDoc(doc(db, 'users', targetPost.authorId))
        const authorData = authorSnap.exists() ? authorSnap.data() : {}
        const friendData = {
          uid: targetPost.authorId,
          displayName: authorData.nickname || targetPost.author || 'ユーザー',
          photoURL: authorData.photoURL || null,
          createdAt: serverTimestamp(),
        }
        await setDoc(doc(db, 'users', currentUser.uid, 'friends', targetPost.authorId), friendData)
        await setDoc(doc(db, 'users', targetPost.authorId, 'friends', currentUser.uid), {
          uid: currentUser.uid,
          displayName: userProfile?.nickname || currentUser.displayName || 'ユーザー',
          photoURL: userProfile?.photoURL || null,
          createdAt: serverTimestamp(),
        })
        setFriends(fs => [...fs, friendData])
      }
    } catch (e) { console.error('posi record error:', e) }
  }

  const saveNotification = async (uid, title, body) => {
    await addDoc(collection(db, 'users', uid, 'notifications'), {
      title, body, isRead: false, createdAt: serverTimestamp(),
    }).catch(console.error)
  }

  const sendPosiNotification = async (targetPost, newCount) => {
    if (!targetPost.authorId || targetPost.authorId === currentUser?.uid) return
    try {
      const authorSnap = await getDoc(doc(db, 'users', targetPost.authorId))
      if (!authorSnap.exists()) return
      const { fcmToken } = authorSnap.data()
      const senderName = userProfile?.nickname || currentUser?.displayName || 'だれか'
      const isKirakira = newCount >= targetPost.target && targetPost.posiCount < targetPost.target

      if (isKirakira) {
        const ownerTitle = '🎉 お祝いが始まりました！'
        const ownerBody = 'みんなの応援ありがとう'
        await saveNotification(targetPost.authorId, ownerTitle, ownerBody)
        if (fcmToken) await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: fcmToken, title: ownerTitle, body: ownerBody }) })

        const myTitle = '✨ お祝いに参加しました！'
        const myBody = `あなたが応援した${targetPost.author}さんのお祝いが始まりました！`
        await saveNotification(currentUser.uid, myTitle, myBody)
        const mySnap = await getDoc(doc(db, 'users', currentUser.uid))
        if (mySnap.exists() && mySnap.data().fcmToken) await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: mySnap.data().fcmToken, title: myTitle, body: myBody }) })
      } else {
        const title = `👍 ${senderName}さんがPosiしてくれました！`
        await saveNotification(targetPost.authorId, title, targetPost.text)
        if (fcmToken) await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: fcmToken, title, body: targetPost.text }) })
      }
    } catch (e) { console.error('notify error:', e) }
  }

  const markNotifRead = async (notif) => {
    if (notif.isRead || !currentUser) return
    await updateDoc(doc(db, 'users', currentUser.uid, 'notifications', notif.id), { isRead: true }).catch(console.error)
  }

  const pickerOpenedRef = useRef(false)

  const posiDown = (e) => {
    e.stopPropagation()
    pickerOpenedRef.current = false
    longRef.current = setTimeout(() => {
      pickerOpenedRef.current = true
      setPickerOpen(true)
      longRef.current = null
    }, 400)
  }

  const posiUp = (e) => {
    e.stopPropagation()
    if (didDragRef.current) { dragEnd(); return }
    if (longRef.current) {
      clearTimeout(longRef.current)
      longRef.current = null
      sendPosi()
    } else if (!pickerOpenedRef.current) {
      sendPosi()
    }
    pickerOpenedRef.current = false
  }

  const pickEmoji = (e) => {
    setEmoji(e)
    setPickerOpen(false)
    sendPosi(e)
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

  useEffect(() => {
    if (!achieveModal || achieveStep !== 3 || achieveEffect !== '🎆') return
    const canvas = fireworkCanvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const ctx = canvas.getContext('2d')
    const particles = []
    const rockets = []
    const flashes = []
    const pending = [] // { spawnAt, rocket }
    const COLORS = ['#ffb7c5','#c8b4e3','#a8d8ea','#ffd700','#b5ead7','#ffc8dd','#e2b4e3','#c3e8ff','#ffe4b5','#d4f0d4']

    const explode = (x, y) => {
      flashes.push({ x, y, life: 1 })
      const isSingle = Math.random() < 0.5
      const c1 = COLORS[Math.floor(Math.random() * COLORS.length)]
      let c2 = COLORS[Math.floor(Math.random() * COLORS.length)]
      while (c2 === c1) c2 = COLORS[Math.floor(Math.random() * COLORS.length)]
      const colorFn = (s) => isSingle ? c1 : (s < 5 ? c1 : c2)
      const count = 120 + Math.floor(Math.random() * 31)
      for (let i = 0; i < count; i++) {
        const baseAngle = (Math.PI * 2 * i) / count
        const a = baseAngle + (Math.random() - 0.5) * (Math.PI / 12)
        const s = 2 + Math.random() * 6
        const isTail = Math.random() < 0.4
        const decay = isTail ? 0.005 + Math.random() * 0.006 : 0.009 + Math.random() * 0.008
        particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, color: colorFn(s), life: 1, decay, size: isTail ? 1.5 + Math.random() : 2 + Math.random()*2.5, isTail })
      }
    }

    let frame = 0
    let nextLaunch = 0

    const launch = () => {
      const count = 2 + Math.floor(Math.random() * 2)
      for (let i = 0; i < count; i++) {
        pending.push({
          spawnAt: frame + i * 12,
          rocket: { x: canvas.width*(0.15+Math.random()*0.7), y: canvas.height, vy: -(6+Math.random()*4), vx: (Math.random()-0.5)*1.0, targetY: canvas.height*(0.1+Math.random()*0.32), trail: [] },
        })
      }
      nextLaunch = frame + 20 + Math.floor(Math.random() * 21)
    }

    const tick = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // フラッシュ
      for (let i = flashes.length-1; i >= 0; i--) {
        const f = flashes[i]; f.life -= 0.08
        if (f.life <= 0) { flashes.splice(i, 1); continue }
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 90*f.life)
        g.addColorStop(0, `rgba(255,240,255,${f.life*0.75})`); g.addColorStop(0.4, `rgba(200,180,255,${f.life*0.35})`); g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 90*f.life, 0, Math.PI*2); ctx.fill()
      }

      // pending → rockets
      for (let i = pending.length-1; i >= 0; i--) {
        if (frame >= pending[i].spawnAt) { rockets.push(pending[i].rocket); pending.splice(i, 1) }
      }

      if (frame >= nextLaunch) launch()
      frame++

      // ロケット
      for (let i = rockets.length-1; i >= 0; i--) {
        const r = rockets[i]
        r.vx += (Math.random()-0.5)*0.3
        r.trail.push({ x: r.x, y: r.y })
        if (r.trail.length > 12) r.trail.shift()
        r.x += r.vx; r.y += r.vy
        r.trail.forEach((t, ti) => { ctx.beginPath(); ctx.arc(t.x,t.y,2,0,Math.PI*2); ctx.fillStyle=`rgba(255,200,100,${ti/r.trail.length})`; ctx.fill() })
        if (r.y <= r.targetY) { explode(r.x, r.y); rockets.splice(i, 1) }
      }

      // パーティクル
      for (let i = particles.length-1; i >= 0; i--) {
        const p = particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.03; p.vx*=0.99; p.life-=p.decay
        if (p.life <= 0) { particles.splice(i, 1); continue }
        ctx.globalAlpha = p.life
        if (p.isTail) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x-p.vx*3, p.y-p.vy*3)
          ctx.strokeStyle = p.color; ctx.lineWidth = p.size*p.life; ctx.stroke()
        } else {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size*p.life, 0, Math.PI*2); ctx.fillStyle = p.color; ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      fireworkAnimRef.current = requestAnimationFrame(tick)
    }
    launch(); tick()
    return () => cancelAnimationFrame(fireworkAnimRef.current)
  }, [achieveModal, achieveStep, achieveEffect])

  useEffect(() => {
    if (!achieveModal || achieveStep !== 3) return
    const effect = achieveEffect
    if (effect === '🎆') return
    const count = effect === '🎈' ? 10 : effect === '🏮' ? 9 : effect === '☄️' ? 14 : 10
    const BALLOON_HUES = [0, 55, 165, 220, 105]
    const items = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 5 + Math.random() * 88,
      dur: (effect === '🏮' || effect === '🎈') ? 9+Math.random()*6 : effect === '☄️' ? 4+Math.random()*3 : 7+Math.random()*5,
      delay: Math.random() * 5,
      size: 0.5 + Math.random() * 0.7,
      sway: (Math.random() - 0.5) * 90,
      hue: BALLOON_HUES[i % 5],
    }))
    setAchieveEffectItems(items)
    return () => setAchieveEffectItems([])
  }, [achieveModal, achieveStep, achieveEffect])

  useEffect(() => {
    if (!achieveModal) { setAchieveMessages([]); return }
    const authorId = achieveModal.post?.authorId
    if (!authorId) {
      setAchieveMessages([{ id: 'default', text: 'みんなありがとう！🎉', own: false }])
      return
    }
    getDocs(collection(db, 'users', authorId, 'messages')).then(snap => {
      if (snap.empty) {
        setAchieveMessages([{ id: 'default', text: 'みんなありがとう！🎉', own: false }])
      } else {
        setAchieveMessages(snap.docs.map(d => ({
          id: d.id,
          text: d.data().text || '',
          own: d.data().senderId === currentUser?.uid,
        })))
      }
    }).catch(() => {
      setAchieveMessages([{ id: 'default', text: 'みんなありがとう！🎉', own: false }])
    })
  }, [achieveModal])

  const AUTH_ERRORS = {
    'auth/email-already-in-use': 'このメールアドレスはすでに登録されています',
    'auth/invalid-email': 'メールアドレスの形式が正しくありません',
    'auth/weak-password': 'パスワードは8文字以上にしてください',
    'auth/user-not-found': 'メールアドレスまたはパスワードが違います',
    'auth/wrong-password': 'メールアドレスまたはパスワードが違います',
    'auth/invalid-credential': 'メールアドレスまたはパスワードが違います',
    'auth/too-many-requests': 'しばらく時間をおいてから再試行してください',
    'auth/popup-closed-by-user': 'ログインがキャンセルされました',
  }

  const saveUserProfile = async (user, nickname) => {
    const data = { uid: user.uid, nickname: nickname || user.displayName || 'ユーザー', email: user.email || '', createdAt: serverTimestamp() }
    await setDoc(doc(db, 'users', user.uid), data, { merge: true })
    setUserProfile(data)
  }

  const handleGoogle = async () => {
    setAuthError(''); setAuthLoading(true)
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider())
      const user = result.user
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (!snap.exists()) await saveUserProfile(user, user.displayName)
    } catch (e) {
      setAuthError(AUTH_ERRORS[e.code] || 'ログインに失敗しました')
    } finally { setAuthLoading(false) }
  }

  const handleRegister = async () => {
    if (!authNickname.trim()) { setAuthError('ニックネームを入力してください'); return }
    if (authPassword.length < 8) { setAuthError('パスワードは8文字以上にしてください'); return }
    setAuthError(''); setAuthLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, authEmail, authPassword)
      await saveUserProfile(result.user, authNickname.trim())
    } catch (e) {
      setAuthError(AUTH_ERRORS[e.code] || '登録に失敗しました')
    } finally { setAuthLoading(false) }
  }

  const handleLogin = async () => {
    setAuthError(''); setAuthLoading(true)
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword)
    } catch (e) {
      setAuthError(AUTH_ERRORS[e.code] || 'ログインに失敗しました')
    } finally { setAuthLoading(false) }
  }

  const handlePasswordReset = async () => {
    if (!authEmail) { setAuthError('メールアドレスを入力してください'); return }
    try {
      await sendPasswordResetEmail(auth, authEmail)
      setAuthError('パスワードリセットメールを送信しました')
    } catch (e) {
      setAuthError(AUTH_ERRORS[e.code] || '送信に失敗しました')
    }
  }

  const openAuthScreen = (screen) => {
    setAuthScreen(screen); setAuthError(''); setAuthEmail(''); setAuthPassword(''); setAuthNickname('')
  }

  useEffect(() => {
    if (!currentUser) { setGoals([]); return }
    const loadGoals = async () => {
      try {
        const q = query(collection(db, 'users', currentUser.uid, 'goals'), orderBy('createdAt', 'asc'))
        const snap = await getDocs(q)
        setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) { console.error(e) }
    }
    loadGoals()
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) { setNotifications([]); return }
    const q = query(collection(db, 'users', currentUser.uid, 'notifications'), orderBy('createdAt', 'desc'), limit(20))
    const unsub = onSnapshot(q, async (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setNotifications(items)
      if (snap.docs.length > 20) {
        const oldest = snap.docs.slice(20)
        for (const d of oldest) await deleteDoc(doc(db, 'users', currentUser.uid, 'notifications', d.id)).catch(() => {})
      }
    }, (e) => console.error(e))
    return () => unsub()
  }, [currentUser])

  const openGoalAdd = () => { setGoalModal('add'); setGoalText(''); setGoalDeadline('') }
  const openGoalEdit = (g) => { setGoalModal(g); setGoalText(g.text); setGoalDeadline(g.deadline || '') }

  const saveGoal = async () => {
    if (!goalText.trim() || !currentUser) return
    const color = hashColor(goalText)
    const data = { text: goalText.trim(), deadline: goalDeadline || null, isAchieved: false, color, createdAt: serverTimestamp() }
    const ref = await addDoc(collection(db, 'users', currentUser.uid, 'goals'), data)
    setGoals(gs => [...gs, { id: ref.id, ...data, createdAt: new Date() }])
    setGoalModal(null)
  }

  const updateGoal = async () => {
    if (!goalText.trim() || !currentUser || !goalModal?.id) return
    const updates = { text: goalText.trim(), deadline: goalDeadline || null }
    await updateDoc(doc(db, 'users', currentUser.uid, 'goals', goalModal.id), updates).catch(console.error)
    setGoals(gs => gs.map(g => g.id === goalModal.id ? { ...g, ...updates } : g))
    setGoalModal(null)
  }

  const achieveGoal = async (gid) => {
    await updateDoc(doc(db, 'users', currentUser.uid, 'goals', gid), { isAchieved: true }).catch(console.error)
    setGoals(gs => gs.map(g => g.id === gid ? { ...g, isAchieved: true } : g))
    setGoalMenuId(null)
  }

  const deleteGoal = async (gid) => {
    const { deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, 'users', currentUser.uid, 'goals', gid)).catch(console.error)
    setGoals(gs => gs.filter(g => g.id !== gid))
    setGoalMenuId(null); setGoalDeleteConfirm(null)
  }

  const finishOnboarding = () => {
    localStorage.setItem('posi_onboarded', '1')
    setOnboardingDone(true)
    if (!currentUser) setAuthScreen('top')
  }

  const closePost = () => {
    setActiveTab('home')
    setPostText('')
    setPostPhotoFile(null)
    setPostPhotoPreview(null)
    setPostPatternId(0)
    setPostSubmitting(false)
    setPostDone(false)
    setConfettiPieces([])
  }

  const submitPost = async () => {
    if (!postText.trim() || postSubmitting) return
    setPostSubmitting(true)
    try {
      let photoUrl = null
      if (postPhotoFile) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result.split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(postPhotoFile)
        })
        const modRes = await fetch('/api/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: postPhotoFile.type }),
        })
        const { blocked } = await modRes.json()
        if (blocked) {
          setToast('この写真は投稿できません。別の写真を選んでください。')
          setTimeout(() => setToast(null), 3000)
          setPostSubmitting(false)
          return
        }
        const storage = getStorage(getApp())
        const fileRef = storageRef(storage, `posts/${Date.now()}_${postPhotoFile.name}`)
        await uploadBytes(fileRef, postPhotoFile)
        photoUrl = await getDownloadURL(fileRef)
      }
      await addDoc(collection(db, 'posts'), {
        text: postText.trim(),
        imageUrl: photoUrl,
        patternId: postPhotoFile ? null : postPatternId,
        authorId: currentUser?.uid || null,
        authorName: userProfile?.nickname || currentUser?.displayName || '名無し',
        congratsCount: 0,
        createdAt: serverTimestamp(),
        reported: false,
      })
      const pieces = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: ['#ff6b35', '#f5a623', '#4caf50', '#2196f3', '#e91e63', '#9c27b0'][Math.floor(Math.random() * 6)],
        delay: Math.random() * 0.6,
        dur: 1.2 + Math.random() * 1,
        size: 6 + Math.random() * 8,
      }))
      setConfettiPieces(pieces)
      setPostDone(true)
      setTimeout(closePost, 2000)
    } catch (e) {
      console.error('Post error:', e)
      setPostSubmitting(false)
    }
  }

  const hasSentMsg = post ? !!msgSent[post.id] : false

  const progress = post ? (post.posiCount / post.target) * 100 : 0
  const remaining = post ? post.target - post.posiCount : 0
  const hasSent = post ? !!sent[post.id] : false
  const emojis = EMOJIS

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

  const soonPosts = isFeed ? posts.filter(p => (p.target - p.posiCount) <= 100 && (p.target - p.posiCount) > 0) : []
  const hasSoonBanner = soonPosts.length > 0
  const BANNER_H = 36

  const jumpToSoon = () => {
    const p = soonPosts[Math.floor(Math.random() * soonPosts.length)]
    const newIdx = posts.indexOf(p)
    if (newIdx !== -1) setIdx(newIdx)
  }

  const NAV_LABELS = { home: 'ホーム', goal: 'フレンド', cheers: 'Cheers', profile: 'プロフ' }

  const IconHome = ({ color }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  )
  const IconCheers = ({ color }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
      <path d="M9.5 3L8 8H5L3 18h7v3h4v-3h7L19 8h-3L14.5 3h-5zm-.74 2h5.48l1.25 3.5H7.51L8.76 5zM5.22 16l1.45-6h10.66l1.45 6H5.22z"/>
    </svg>
  )
  const IconFriends = ({ color }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  )
  const IconProfile = ({ color }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  )

  const navTab = (tab, Icon) => {
    const active = activeTab === tab
    const color = active ? 'var(--orange)' : '#aaa'
    return (
      <button
        style={{ ...S.navTab, ...(active ? S.navTabActive : {}) }}
        onClick={() => { setActiveTab(tab); setCheersSubView(null) }}
      >
        <Icon color={color} />
        <span style={{ ...S.navLabel, color }}>{NAV_LABELS[tab]}</span>
      </button>
    )
  }

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
      <style>{`@keyframes soonBlink { 0%,100%{opacity:1} 50%{opacity:0.6} } @keyframes notifSlideDown { from { transform: translateY(-110%) } to { transform: translateY(0) } } @keyframes posiPop { 0%{transform:scale(1)} 40%{transform:scale(1.08)} 100%{transform:scale(1)} } .posi-pop{animation:posiPop 0.4s ease-out} @keyframes posiShake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} } .posi-shake{animation:posiShake 0.4s ease-out} @keyframes emojiFly { 0%{transform:translateY(0) translateX(0) rotate(0deg);opacity:1} 70%{opacity:1} 100%{transform:translateY(-160px) translateX(var(--tx,0px)) rotate(var(--rot,0deg));opacity:0} } .emoji-fly{animation:emojiFly var(--dur,0.8s) var(--delay,0s) ease-out both}`}</style>
      <header style={S.header}>
        <span style={S.logo}>POSI.</span>
        {currentUser && (
          <button style={S.bellBtn} onClick={() => setNotifDrawerOpen(v => !v)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span style={S.bellBadge}>{Math.min(notifications.filter(n => !n.isRead).length, 99)}</span>
            )}
          </button>
        )}
      </header>

      {isFeed && hasSoonBanner && (
        <div style={S.soonBanner} onClick={jumpToSoon}>
          <span style={{ animation: 'soonBlink 1.4s ease-in-out infinite' }}>もうすぐ！→</span>
        </div>
      )}

      {isFeed && post && (
        <div style={{ ...S.authorFixed, top: 60 + (hasSoonBanner ? BANNER_H : 0) }}>
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
        onTouchMove={e => { try { if (isFeed && e.touches[0]) dragMove(e.touches[0].clientX) } catch (e) { console.error('[onTouchMove error]', e) } }}
        onTouchEnd={e => { try { isFeed && dragEnd() } catch (e) { console.error('[onTouchEnd error]', e) } }}
      >
        {activeTab === 'profile' ? (
          <div style={S.profileScroll}>
            <div style={S.profileCard}>
              <div style={S.profileAvatar}>{MOCK_PROFILE.initials}</div>
              <div style={S.profileName}>{MOCK_PROFILE.name}</div>
              <div style={S.profileHandle}>{MOCK_PROFILE.handle}</div>
              <div style={S.profileStats}>
                <div style={S.profileStat}>
                  <span style={S.profileStatNum}>{friends.length}</span>
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
              <span style={S.sectionAction} onClick={openGoalAdd}>＋ 追加</span>
            </div>
            {goals.map(g => (
              <div
                key={g.id}
                style={{ ...S.goalCard, borderLeft: `3px solid ${g.color || 'var(--orange)'}`, ...(g.isAchieved ? S.goalCardDone : {}) }}
                onMouseDown={() => { goalLongRef.current = setTimeout(() => { setGoalMenuId(g.id); goalLongRef.current = null }, 500) }}
                onMouseUp={() => { if (goalLongRef.current) { clearTimeout(goalLongRef.current); goalLongRef.current = null } }}
                onTouchStart={() => { goalLongRef.current = setTimeout(() => { setGoalMenuId(g.id); goalLongRef.current = null }, 500) }}
                onTouchEnd={() => { if (goalLongRef.current) { clearTimeout(goalLongRef.current); goalLongRef.current = null } }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: g.isAchieved ? 'var(--text-sub)' : 'var(--text)', textDecoration: g.isAchieved ? 'line-through' : 'none' }}>{g.text}</div>
                  {g.deadline && <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 3 }}>期限 {g.deadline}</div>}
                </div>
                {g.isAchieved && <span style={S.achievedBadge}>達成 ✓</span>}
              </div>
            ))}
            <button style={S.addGoalBtn} onClick={openGoalAdd}>＋ 目標を追加する</button>

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

            <div style={{ ...S.sectionHeader, marginTop: 8 }}>
              <span style={S.sectionTitle}>📄 法的情報</span>
            </div>
            {[['プライバシーポリシー', '/privacy'], ['利用規約', '/terms']].map(([label, href]) => (
              <a key={href} href={href} style={{ ...S.settingRow, textDecoration: 'none', display: 'flex', marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{label}</span>
                <span style={{ color: 'var(--text-sub)', fontSize: 18 }}>›</span>
              </a>
            ))}

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
                {MOCK_FIREWORKS.length === 0 && <div style={S.emptyState}>まだ花火はありません</div>}
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

              {/* 2. Cheers履歴 */}
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

              {/* 3. 達成済み */}
              <div style={{ ...S.sectionHeader, marginTop: 20 }}>
                <div>
                  <span style={S.sectionTitle}>🏆 達成済み</span>
                  <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>あなたが応援した人の達成</div>
                </div>
              </div>
              {(() => {
                const sentAuthors = new Set(posts.filter(p => sent[p.id]).map(p => p.author))
                const achieved = MOCK_ACHIEVED.filter(p => sentAuthors.has(p.author)).slice(-30)
                return achieved.length === 0 ? (
                  <div style={S.emptyState}>Posiした投稿の作者が達成するとここに表示されます</div>
                ) : (
                  <>
                    {achieved.slice(0, 3).map(p => <AchievedCard key={p.id} p={p} />)}
                    {achieved.length > 3 && (
                      <button style={S.moreBtn} onClick={() => setCheersSubView('achieved-all')}>もっと見る →</button>
                    )}
                  </>
                )
              })()}

              <div style={{ height: 20 }} />
            </div>
          )

        ) : activeTab === 'goal' ? (
          <div style={S.profileScroll}>
            <div style={{ ...S.sectionHeader, marginTop: 0 }}>
              <span style={S.sectionTitle}>👥 フレンド</span>
              <button style={S.inviteBtn} onClick={() => setInviteModalOpen(true)}>＋ 招待</button>
            </div>
            {friends.length === 0 ? (
              <div style={S.emptyState}>まだフレンドがいません　Posiし合うと繋がれます</div>
            ) : (
              friends.map(fr => (
                <div key={fr.uid} style={S.friendRow}>
                  <div style={{ ...S.friendRowAvatar, background: hashColor(fr.displayName) }}>{(fr.displayName || 'U')[0]}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{fr.displayName}</div>
                </div>
              ))
            )}
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
            style={{ ...S.screen, top: 130 + (hasSoonBanner ? BANNER_H : 0), ...(isWobbling ? {} : { transform: cardTransform, transition: cardTransition }) }}
            onMouseDown={e => { setWobble(false); dragStart(e.clientX) }}
            onTouchStart={e => { setWobble(false); dragStart(e.touches[0].clientX) }}
          >
            {floatingEmojis.map(fe => (
              <div key={fe.id} className="emoji-fly" style={{ ...S.floatingEmoji, left: `${fe.left}%`, '--dur': `${fe.dur}s`, '--delay': `${fe.delay}s`, '--tx': `${fe.tx}px`, '--rot': `${fe.rot}deg` }}>{fe.e}</div>
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
        {navTab('home', IconHome)}
        {navTab('cheers', IconCheers)}
        <button style={S.postTab} onClick={() => setActiveTab('post')}>
          <div style={S.postInner}>＋</div>
        </button>
        {navTab('goal', IconFriends)}
        {navTab('profile', IconProfile)}
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

      {inviteModalOpen && (
        <div style={S.msgOverlay} onClick={() => setInviteModalOpen(false)}>
          <div style={S.msgSheet} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>友達を招待する</div>
            <div style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 20 }}>一緒にPosiしよう！</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href={`https://line.me/R/msg/text/?Posi%E3%82%A2%E3%83%97%E3%83%AA%E3%81%A7%E4%B8%80%E7%B7%92%E3%81%AB%E3%81%8A%E3%82%81%E3%81%A7%E3%81%A8%E3%81%86%E8%A8%80%E3%81%84%E5%90%88%E3%81%8A%E3%81%86%EF%BC%81%20https%3A%2F%2Fposi-2o6x.vercel.app`}
                style={S.inviteOptionBtn}
                onClick={() => setInviteModalOpen(false)}
              >LINE で送る</a>
              <a
                href={`mailto:?subject=Posi%20-%20%E3%81%8A%E3%82%81%E3%81%A7%E3%81%A8%E3%81%86%E3%82%92%E8%A8%80%E3%81%84%E5%90%88%E3%81%8A%E3%81%86&body=Posi%E3%82%A2%E3%83%97%E3%83%AA%E3%81%A7%E4%B8%80%E7%B7%92%E3%81%AB%E3%81%8A%E3%82%81%E3%81%A7%E3%81%A8%E3%81%86%E8%A8%80%E3%81%84%E5%90%88%E3%81%8A%E3%81%86%EF%BC%81%20https%3A%2F%2Fposi-2o6x.vercel.app`}
                style={S.inviteOptionBtn}
                onClick={() => setInviteModalOpen(false)}
              >メールで送る</a>
            </div>
          </div>
        </div>
      )}

      {postModal && (
        <div style={S.postOverlay} onClick={() => setPostModal(null)}>
          <button style={S.lightboxClose} onClick={e => { e.stopPropagation(); setPostModal(null) }}>×</button>
          <PostModalCard p={postModal} />
        </div>
      )}

      {activeTab === 'post' && (
        <div style={S.postScreenOverlay}>
          <style>{`
            @keyframes confettiFall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
            }
            @keyframes postDoneIn {
              0% { transform: scale(0.7); opacity: 0; }
              60% { transform: scale(1.08); }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>

          {postDone ? (
            <div style={S.postDoneScreen}>
              {confettiPieces.map(p => (
                <div key={p.id} style={{
                  position: 'fixed',
                  left: `${p.left}%`,
                  top: -10,
                  width: p.size,
                  height: p.size * 0.55,
                  background: p.color,
                  borderRadius: 2,
                  animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
                  pointerEvents: 'none',
                  zIndex: 320,
                }} />
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, zIndex: 320, position: 'relative' }}>
                <div style={S.postDoneText}>投稿できました！</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 240 }}>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Posiに投稿しました！みんなの応援待ってます🎆 #POSI https://posi-2o6x.vercel.app')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={S.shareBtn}
                  >𝕏 でシェア</a>
                  <a
                    href={`https://line.me/R/msg/text/?${encodeURIComponent('Posiに投稿しました！応援してね🎆 https://posi-2o6x.vercel.app')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...S.shareBtn, background: '#06c755' }}
                  >LINE でシェア</a>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={S.postScreenHeader}>
                <button style={S.postScreenClose} onClick={closePost}>×</button>
                <span style={S.postScreenTitle}>投稿する</span>
                <div style={{ width: 40 }} />
              </div>

              <div style={S.postScreenBody}>
                <div style={S.postTextWrap}>
                  <textarea
                    style={S.postTextarea}
                    placeholder="今日達成したことを書こう！"
                    maxLength={100}
                    value={postText}
                    onChange={e => setPostText(e.target.value)}
                    rows={4}
                  />
                  <div style={S.postCharCount}>{postText.length} / 100</div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setPostPhotoFile(file)
                    setPostPhotoPreview(URL.createObjectURL(file))
                  }}
                />
                <button style={S.photoAddBtn} onClick={() => fileInputRef.current?.click()}>
                  📷 写真を追加
                </button>

                {!postPhotoFile && (
                  <div style={S.patternSection}>
                    <div style={S.patternLabel}>背景パターン</div>
                    <div style={S.patternScroll}>
                      {POST_BG_PATTERNS.map(p => (
                        <button
                          key={p.id}
                          style={{ ...S.patternItem, background: p.background, ...(postPatternId === p.id ? S.patternItemSelected : {}) }}
                          onClick={() => setPostPatternId(p.id)}
                        >
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={S.previewLabel}>プレビュー</div>
                <div style={S.previewCard}>
                  {postPhotoPreview ? (
                    <div style={{ position: 'relative' }}>
                      <div style={{ ...S.photoArea, maxHeight: 180 }}>
                        <img src={postPhotoPreview} alt="" style={{ ...S.photo, maxHeight: 180 }} draggable={false} />
                      </div>
                      <button style={S.removePhotoBtn} onClick={() => { setPostPhotoFile(null); setPostPhotoPreview(null) }}>×</button>
                    </div>
                  ) : (
                    <div style={{ ...S.photoAreaNoPhoto, background: POST_BG_PATTERNS[postPatternId].background, height: 160 }} />
                  )}
                  <div style={{ ...S.textArea, minHeight: 60 }}>
                    <p style={{ ...S.postText, fontSize: postText.length <= 10 ? '1.6rem' : postText.length <= 30 ? '1.3rem' : '1rem' }}>
                      {postText || <span style={{ color: '#ccc' }}>今日達成したことを書こう！</span>}
                    </p>
                  </div>
                </div>

                <button
                  style={{ ...S.submitPostBtn, ...(!postText.trim() || postSubmitting ? S.submitPostBtnDisabled : {}) }}
                  onClick={submitPost}
                  disabled={!postText.trim() || postSubmitting}
                >
                  {postSubmitting ? '投稿中...' : '投稿する'}
                </button>

                <div style={{ height: 20 }} />
              </div>
            </>
          )}
        </div>
      )}

      {achieveModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, maxWidth: 480, margin: '0 auto' }}>
          <style>{`
            @keyframes lanternRise { 0%{transform:translateY(0) translateX(0) rotate(-5deg);opacity:0} 8%{opacity:1} 40%{transform:translateY(-38vh) translateX(var(--sw)) rotate(5deg)} 75%{transform:translateY(-78vh) translateX(0) rotate(-3deg)} 100%{transform:translateY(-115vh) translateX(calc(var(--sw)*0.5)) rotate(-5deg);opacity:0} }
            @keyframes meteorFall { 0%{opacity:0;transform:rotate(35deg) translateX(0)} 8%{opacity:1} 88%{opacity:0.85} 100%{opacity:0;transform:rotate(35deg) translateX(-130vw)} }
            @keyframes balloonRise { 0%{transform:translateY(0) translateX(0);opacity:0} 8%{opacity:1} 40%{transform:translateY(-38vh) translateX(var(--sw))} 72%{transform:translateY(-76vh) translateX(0)} 100%{transform:translateY(-115vh) translateX(calc(var(--sw)*0.6));opacity:0} }
            @keyframes butterflyFloat { 0%{transform:translate(0,0) rotate(0deg) scale(1)} 20%{transform:translate(50px,-70px) rotate(8deg) scale(1.05)} 45%{transform:translate(100px,15px) rotate(-5deg) scale(0.96)} 70%{transform:translate(30px,75px) rotate(9deg) scale(1.04)} 85%{transform:translate(-25px,40px) rotate(-3deg) scale(1)} 100%{transform:translate(0,0) rotate(0deg) scale(1)} }
            @keyframes wingFlap { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(0.15)} }
            @keyframes scrollAchieve { from{transform:translateX(100vw)} to{transform:translateX(-100%)} }
            @keyframes achMsgBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
          `}</style>

          {/* STEP 1: 演出選択 */}
          {achieveStep === 1 && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 4 }}>🎆</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', textAlign: 'center' }}>1,000 Posi達成！</div>
              <div style={{ fontSize: 15, color: '#ddd', textAlign: 'center', marginBottom: 8 }}>どの演出で打ち上げる？</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[['🎆','花火'],['🏮','ランタン'],['☄️','流星群'],['🦋','光の蝶'],['🎈','風船']].map(([e, label]) => (
                  <button key={e} onClick={() => setAchieveEffect(e)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: achieveEffect === e ? 'rgba(245,96,30,0.25)' : 'rgba(255,255,255,0.08)', border: achieveEffect === e ? '2px solid #f5601e' : '2px solid transparent', borderRadius: 14, padding: '12px 16px', cursor: 'pointer' }}>
                    <span style={{ fontSize: 32 }}>{e}</span>
                    <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setAchieveStep(2)}
                style={{ width: '100%', background: '#f5601e', border: 'none', borderRadius: 9999, padding: '16px', fontSize: 17, fontWeight: 900, color: '#fff', cursor: 'pointer', marginTop: 8 }}>
                次へ →
              </button>
            </div>
          )}

          {/* STEP 2: メッセージ入力 */}
          {achieveStep === 2 && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', padding: '48px 24px 32px', gap: 20, overflowY: 'auto' }}>
              <button onClick={() => setAchieveStep(1)} style={{ position: 'absolute', top: 16, left: 16, background: 'none', border: 'none', color: '#aaa', fontSize: 14, cursor: 'pointer' }}>← 戻る</button>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', textAlign: 'center' }}>みんなへひとこと</div>
              <textarea
                style={{ width: '100%', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px', fontSize: 15, lineHeight: 1.6, fontFamily: 'inherit', outline: 'none', resize: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', boxSizing: 'border-box' }}
                placeholder="ありがとう！みんなのおかげです✨"
                maxLength={30}
                rows={3}
                value={achieveMsg}
                onChange={e => setAchieveMsg(e.target.value)}
              />
              <div style={{ textAlign: 'right', fontSize: 11, color: '#888', marginTop: -12 }}>{achieveMsg.length} / 30</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['表示位置', [['top','上'],['mid','中'],['bot','下']], achieveMsgPos, setAchieveMsgPos],
                  ['文字色', [['white','白'],['orange','オレンジ'],['gold','金']], achieveMsgColor, setAchieveMsgColor],
                  ['文字サイズ', [['large','大'],['mid','中'],['small','小']], achieveMsgSize, setAchieveMsgSize],
                ].map(([label, opts, val, setter]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#ccc', fontWeight: 600, width: 72, flexShrink: 0 }}>{label}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {opts.map(([v, l]) => (
                        <button key={v} onClick={() => setter(v)}
                          style={{ fontSize: 12, fontWeight: 700, border: val === v ? '2px solid #f5601e' : '2px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '5px 12px', background: val === v ? 'rgba(245,96,30,0.25)' : 'transparent', color: '#fff', cursor: 'pointer' }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => setAchieveStep(3)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9999, padding: '14px', fontSize: 14, fontWeight: 700, color: '#aaa', cursor: 'pointer' }}>
                  スキップ
                </button>
                <button onClick={() => setAchieveStep(3)}
                  style={{ flex: 2, background: '#f5601e', border: 'none', borderRadius: 9999, padding: '14px', fontSize: 16, fontWeight: 900, color: '#fff', cursor: 'pointer' }}>
                  打ち上げる！
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: 演出再生 */}
          {achieveStep === 3 && (() => {
            const bgMap = { '🎆': '#000', '🏮': '#0a0a2e', '☄️': '#000', '🦋': '#1a0a2e', '🎈': '#87ceeb' }
            const msgColorMap = { white: '#fff', orange: '#f5601e', gold: '#ffd700' }
            const msgSizeMap = { large: 22, mid: 16, small: 12 }
            const msgPosStyle = { top: { top: '12%' }, mid: { top: '45%', transform: 'translateY(-50%)' }, bot: { bottom: '22%' } }
            return (
              <div style={{ position: 'absolute', inset: 0, background: bgMap[achieveEffect], overflow: 'hidden' }}>
                <button onClick={() => setAchieveModal(null)} style={S.lightboxClose}>×</button>

                {/* Canvas: 花火 */}
                {achieveEffect === '🎆' && <canvas ref={fireworkCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />}

                {/* ランタン */}
                {achieveEffect === '🏮' && achieveEffectItems.map(item => (
                  <div key={item.id} style={{ position: 'absolute', left: `${item.left}%`, bottom: -80, fontSize: 50 + item.size * 20, animation: `lanternRise ${item.dur}s ${item.delay}s ease-in-out infinite`, '--sw': `${item.sway}px`, filter: 'drop-shadow(0 0 18px rgba(255,160,0,0.95)) drop-shadow(0 0 40px rgba(255,100,0,0.45))' }}>🏮</div>
                ))}

                {/* 流星群 */}
                {achieveEffect === '☄️' && achieveEffectItems.map(item => (
                  <div key={item.id} style={{ position: 'absolute', right: `${item.left}%`, top: `${5 + (item.id * 7) % 45}%`, width: 3 + item.size * 4, height: 90 + item.size * 60, background: 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(200,230,255,0.7), transparent)', borderRadius: 99, animation: `meteorFall ${item.dur}s ${item.delay}s ease-in-out infinite`, filter: 'blur(0.5px)' }} />
                ))}

                {/* 光の蝶 */}
                {achieveEffect === '🦋' && achieveEffectItems.map(item => (
                  <div key={item.id} style={{ position: 'absolute', left: `${5 + (item.id * 9) % 84}%`, top: `${8 + (item.id * 11) % 72}%`, animation: `butterflyFloat ${item.dur}s ${item.delay}s ease-in-out infinite`, filter: 'drop-shadow(0 0 12px rgba(200,150,255,0.9))' }}>
                    <span style={{ fontSize: 45 + item.size * 20, display: 'block', animation: `wingFlap 0.9s ${item.delay}s ease-in-out infinite` }}>🦋</span>
                  </div>
                ))}

                {/* 風船 */}
                {achieveEffect === '🎈' && achieveEffectItems.map(item => (
                  <div key={item.id} style={{ position: 'absolute', left: `${item.left}%`, bottom: -70, fontSize: 50 + item.size * 20, animation: `balloonRise ${item.dur}s ${item.delay}s ease-in-out infinite`, '--sw': `${item.sway}px`, filter: `hue-rotate(${item.hue}deg) brightness(1.1) saturate(0.85)` }}>🎈</div>
                ))}

                {/* 流れるメッセージ */}
                {achieveMessages.map((msg, i) => (
                  <div key={msg.id} style={{ position: 'absolute', top: `${14 + i * 13}%`, fontSize: 15, fontWeight: 700, color: msg.own ? '#f5601e' : '#fff', opacity: msg.own ? 1 : 0.85, whiteSpace: 'nowrap', textShadow: '0 1px 4px rgba(0,0,0,0.8)', animation: `scrollAchieve ${7 + i * 1.5}s ${i * 1.2}s linear infinite`, zIndex: 10, pointerEvents: 'none', ...(msg.own ? { animationName: 'scrollAchieve, achMsgBlink' } : {}) }}>
                    {msg.text}
                  </div>
                ))}

                {/* 達成者のひとこと */}
                {achieveMsg !== '' && (
                  <div style={{ position: 'absolute', left: 0, right: 0, padding: '0 24px', textAlign: 'center', zIndex: 20, ...msgPosStyle[achieveMsgPos] }}>
                    <span style={{ fontSize: msgSizeMap[achieveMsgSize], fontWeight: 900, color: msgColorMap[achieveMsgColor], textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{achieveMsg}</span>
                  </div>
                )}

                {/* 下部：達成者情報 */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.8))', padding: '32px 20px 24px', zIndex: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f5601e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 900, flexShrink: 0 }}>{achieveModal.post.initials}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{achieveModal.post.author}</div>
                      <div style={{ fontSize: 12, color: '#aaa' }}>1,000 Posi達成！🎉</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: '#ddd', lineHeight: 1.5 }}>{achieveModal.post.text}</div>
                </div>

                {/* 共有ボタン */}
                <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${achieveModal.post.author}さんが1,000 Posi達成🎆 #POSI https://posi-2o6x.vercel.app`)}`, '_blank')}
                  style={{ position: 'absolute', bottom: 24, right: 20, background: '#1a1a2e', border: 'none', borderRadius: 99, padding: '8px 16px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', zIndex: 30 }}>
                  共有
                </button>
              </div>
            )
          })()}
        </div>
      )}

      {goalModal && (
        <div style={S.msgOverlay} onClick={() => setGoalModal(null)}>
          <div style={S.msgSheet} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
              {goalModal === 'add' ? '目標を追加' : '目標を編集'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea
                style={{ ...S.postTextarea, minHeight: 80, resize: 'none' }}
                placeholder="目標を入力してください（50文字以内）"
                maxLength={50}
                value={goalText}
                onChange={e => setGoalText(e.target.value)}
                rows={3}
                autoFocus
              />
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 6 }}>期限（任意）</div>
                <input
                  type="date"
                  style={{ ...S.authInput, padding: '10px 12px', fontSize: 14 }}
                  value={goalDeadline}
                  onChange={e => setGoalDeadline(e.target.value)}
                />
              </div>
              <button
                style={{ ...S.submitPostBtn, ...(!goalText.trim() ? S.submitPostBtnDisabled : {}) }}
                onClick={goalModal === 'add' ? saveGoal : updateGoal}
                disabled={!goalText.trim()}
              >
                {goalModal === 'add' ? '追加する' : '保存する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {goalMenuId && (
        <div style={S.msgOverlay} onClick={() => setGoalMenuId(null)}>
          <div style={S.msgSheet} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                ['編集', () => { const g = goals.find(x => x.id === goalMenuId); setGoalMenuId(null); openGoalEdit(g) }],
                ['達成にする', () => achieveGoal(goalMenuId)],
                ['削除', () => { setGoalDeleteConfirm(goalMenuId); setGoalMenuId(null) }],
              ].map(([label, action]) => (
                <button key={label} onClick={action}
                  style={{ background: 'none', border: 'none', padding: '16px 0', fontSize: 15, fontWeight: 600, color: label === '削除' ? '#e53935' : 'var(--text)', cursor: 'pointer', borderBottom: '0.5px solid var(--card-border)', textAlign: 'left' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {goalDeleteConfirm && (
        <div style={S.msgOverlay} onClick={() => setGoalDeleteConfirm(null)}>
          <div style={{ ...S.msgSheet, gap: 16 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>この目標を削除しますか？</div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>削除すると元に戻せません</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setGoalDeleteConfirm(null)}
                style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 9999, padding: '12px', fontSize: 14, fontWeight: 700, color: 'var(--text-sub)', cursor: 'pointer' }}>
                キャンセル
              </button>
              <button onClick={() => deleteGoal(goalDeleteConfirm)}
                style={{ flex: 1, background: '#e53935', border: 'none', borderRadius: 9999, padding: '12px', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {authScreen && !achieveModal && onboardingDone && (
        <div style={S.authOverlay}>
          <div style={S.authHeader}><span style={S.logo}>POSI.</span></div>

          {authScreen === 'top' && (
            <div style={S.authBody}>
              <div style={S.authTitle}>はじめよう</div>
              <div style={{ fontSize: 14, color: 'var(--text-sub)', textAlign: 'center', marginBottom: 32 }}>おめでとうだけが存在する場所</div>

              <button style={S.googleBtn} onClick={handleGoogle} disabled={authLoading}>
                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.4-.1-2.7-.5-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 16.3 3 9.6 7.9 6.3 14.7z"/><path fill="#FBBC05" d="M24 45c5.5 0 10.5-1.9 14.3-5l-6.6-5.4C29.8 36.2 27 37 24 37c-5.8 0-10.7-3.1-11.8-7.5l-7 5.4C8.9 41.2 15.9 45 24 45z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.6 2-1.8 3.7-3.4 5l6.6 5.4C42.3 35.7 45 30.3 45 24c0-1.4-.2-2.7-.5-4z"/></svg>
                {authLoading ? '処理中...' : 'Googleでログイン'}
              </button>

              <button style={S.emailRegisterBtn} onClick={() => openAuthScreen('register')} disabled={authLoading}>
                メールアドレスで登録
              </button>

              {authError && <div style={S.authError}>{authError}</div>}

              <button style={S.authLinkBtn} onClick={() => openAuthScreen('login')}>
                すでにアカウントをお持ちの方はこちら
              </button>
            </div>
          )}

          {authScreen === 'register' && (
            <div style={S.authBody}>
              <button style={S.authBack} onClick={() => openAuthScreen('top')}>← 戻る</button>
              <div style={S.authTitle}>新規登録</div>

              <input style={S.authInput} type="email" placeholder="メールアドレス" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
              <input style={S.authInput} type="password" placeholder="パスワード（8文字以上）" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
              <input style={S.authInput} type="text" placeholder="ニックネーム（プロフに表示される名前）" value={authNickname} onChange={e => setAuthNickname(e.target.value)} maxLength={20} />

              {authError && <div style={S.authError}>{authError}</div>}

              <button style={S.emailRegisterBtn} onClick={handleRegister} disabled={authLoading || !authEmail || !authPassword || !authNickname}>
                {authLoading ? '登録中...' : '登録する'}
              </button>
            </div>
          )}

          {authScreen === 'login' && (
            <div style={S.authBody}>
              <button style={S.authBack} onClick={() => openAuthScreen('top')}>← 戻る</button>
              <div style={S.authTitle}>ログイン</div>

              <input style={S.authInput} type="email" placeholder="メールアドレス" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
              <input style={S.authInput} type="password" placeholder="パスワード" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />

              {authError && <div style={S.authError}>{authError}</div>}

              <button style={S.emailRegisterBtn} onClick={handleLogin} disabled={authLoading || !authEmail || !authPassword}>
                {authLoading ? 'ログイン中...' : 'ログイン'}
              </button>

              <button style={S.authLinkBtn} onClick={handlePasswordReset}>
                パスワードをお忘れの方はこちら
              </button>
            </div>
          )}
        </div>
      )}

      {!onboardingDone && (
        <div style={S.onboardOverlay}>
          <style>{`
            @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
            @keyframes swipeHint { 0%{transform:translateX(0);opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{transform:translateX(60px);opacity:0} }
          `}</style>

          {onboardIdx === 0 && (
            <div style={S.onboardSlide}>
              <div style={{ position: 'relative', width: 160, height: 160, marginBottom: 32 }}>
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    position: 'absolute', width: 16, height: 16, borderRadius: '50%',
                    background: ['#ff6b35','#f5a623','#4caf50','#2196f3','#e91e63','#9c27b0'][i],
                    top: `${50 + 44 * Math.sin(i * Math.PI / 3)}%`,
                    left: `${50 + 44 * Math.cos(i * Math.PI / 3)}%`,
                    animation: `floatUp ${1.2 + i * 0.2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.18}s`,
                  }} />
                ))}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>🌍</div>
              </div>
              <div style={S.onboardTitle}>あなたの達成を、世界に届けよう</div>
              <div style={S.onboardSub}>おめでとうだけが存在する場所</div>
            </div>
          )}

          {onboardIdx === 1 && (
            <div style={S.onboardSlide}>
              <div style={{ position: 'relative', width: 200, height: 140, marginBottom: 32 }}>
                <div style={{ position: 'absolute', left: 20, top: 20, width: 120, height: 90, borderRadius: 16, background: 'linear-gradient(135deg,#ffcc80,#ff8a65)', boxShadow: '0 4px 20px rgba(255,107,53,0.3)' }} />
                <div style={{ position: 'absolute', left: 0, top: 0, width: 120, height: 90, borderRadius: 16, background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#333', padding: 8, textAlign: 'center' }}>マラソン完走した！🏃</span>
                </div>
                <div style={{ position: 'absolute', right: 0, bottom: 0, animation: 'swipeHint 1.8s ease-in-out infinite' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ff6b35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff', boxShadow: '0 4px 12px rgba(255,107,53,0.4)' }}>👍</div>
                </div>
              </div>
              <div style={S.onboardTitle}>スワイプして、応援しよう</div>
              <div style={S.onboardSub}>誰かの達成にPosiを送ろう。{'\n'}応援するほど、あなたも輝く。</div>
            </div>
          )}

          <div style={S.onboardDots}>
            {[0,1].map(i => (
              <div key={i} style={{ ...S.onboardDot, ...(onboardIdx === i ? S.onboardDotActive : {}) }} onClick={() => setOnboardIdx(i)} />
            ))}
          </div>

          {onboardIdx < 1 ? (
            <button style={S.onboardNext} onClick={() => setOnboardIdx(i => i + 1)}>次へ</button>
          ) : (
            <button style={S.onboardNext} onClick={finishOnboarding}>はじめる！</button>
          )}
        </div>
      )}

      {notifDrawerOpen && (
        <>
          <div style={S.notifOverlay} onClick={() => setNotifDrawerOpen(false)} />
          <div style={S.notifDrawer} onClick={e => e.stopPropagation()}>
            <div style={S.notifHeader}>
              <span style={S.notifTitle}>通知</span>
              <button style={S.notifClose} onClick={() => setNotifDrawerOpen(false)}>✕</button>
            </div>
            <div style={S.notifList}>
              {notifications.length === 0 ? (
                <div style={S.notifEmpty}>まだ通知がありません</div>
              ) : notifications.map(n => (
                <div key={n.id} style={{ ...S.notifItem, ...(n.isRead ? S.notifItemRead : {}) }} onClick={() => markNotifRead(n)}>
                  <div style={S.notifItemTitle}>{n.title}</div>
                  {n.body ? <div style={S.notifItemBody}>{n.body}</div> : null}
                  {!n.isRead && <div style={S.notifUnreadDot} />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const S = {
  root: { display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)', maxWidth: 480, margin: '0 auto' },
  header: { padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'var(--orange)', flexShrink: 0 },
  logo: { fontSize: 33, fontWeight: 900, color: '#fff', letterSpacing: '1px' },
  bellBtn: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bellBadge: { position: 'absolute', top: 0, right: 0, background: '#e53935', color: '#fff', fontSize: 10, fontWeight: 800, borderRadius: 99, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', lineHeight: 1 },
  notifOverlay: { position: 'fixed', inset: 0, zIndex: 49, background: 'transparent' },
  notifDrawer: { position: 'fixed', top: 60, right: 0, left: 0, maxWidth: 480, margin: '0 auto', background: 'var(--card-bg)', borderRadius: '0 0 20px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 50, animation: 'notifSlideDown 0.25s cubic-bezier(0.34,1.0,0.64,1)', maxHeight: '70vh', display: 'flex', flexDirection: 'column' },
  notifHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 10px', borderBottom: '0.5px solid var(--card-border)' },
  notifTitle: { fontSize: 16, fontWeight: 800, color: 'var(--text)' },
  notifClose: { background: 'none', border: 'none', fontSize: 16, color: 'var(--text-sub)', cursor: 'pointer', padding: 4 },
  notifList: { overflowY: 'auto', flex: 1 },
  notifEmpty: { padding: '32px 18px', textAlign: 'center', color: 'var(--text-sub)', fontSize: 14 },
  notifItem: { position: 'relative', padding: '13px 18px', borderBottom: '0.5px solid var(--card-border)', cursor: 'pointer' },
  notifItemRead: { opacity: 0.5 },
  notifItemTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 },
  notifItemBody: { fontSize: 12, color: 'var(--text-sub)', marginTop: 3, lineHeight: 1.4 },
  notifUnreadDot: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: 'var(--orange)' },

  soonBanner: { position: 'fixed', top: 60, left: 0, right: 0, maxWidth: 480, margin: '0 auto', height: 36, background: '#f5601e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', cursor: 'pointer', zIndex: 3, letterSpacing: '0.5px' },
  main: { flex: 1, position: 'relative', overflow: 'hidden' },
  empty: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 },

  screen: { position: 'fixed', top: 130, bottom: 295, left: 0, right: 0, maxWidth: 480, margin: '0 auto', zIndex: 1, cursor: 'grab', willChange: 'transform', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px 24px', overflow: 'hidden' },
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
  inviteBtn: { fontSize: 13, fontWeight: 700, color: 'var(--orange)', background: 'var(--orange-tint)', border: '1px solid var(--orange-border)', borderRadius: 99, padding: '5px 12px', cursor: 'pointer' },
  friendRow: { background: 'var(--card-bg)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  friendRowAvatar: { width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 800, flexShrink: 0 },
  inviteOptionBtn: { display: 'block', width: '100%', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, color: 'var(--text)', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' },
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

  // 投稿画面
  postScreenOverlay: { position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 300, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' },
  postScreenHeader: { padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--card-border)', background: 'var(--bg)', flexShrink: 0 },
  postScreenClose: { width: 40, height: 40, background: 'none', border: 'none', fontSize: 24, fontWeight: 700, color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  postScreenTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text)' },
  postScreenBody: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 },
  postTextWrap: { position: 'relative' },
  postTextarea: { width: '100%', border: '1.5px solid var(--card-border)', borderRadius: 12, padding: '12px', fontSize: 15, lineHeight: 1.6, fontFamily: 'inherit', outline: 'none', resize: 'none', background: 'var(--card-bg)', color: 'var(--text)', boxSizing: 'border-box' },
  postCharCount: { textAlign: 'right', fontSize: 11, color: 'var(--text-sub)', marginTop: 4 },
  photoAddBtn: { width: '100%', background: 'var(--card-bg)', border: '1.5px dashed var(--card-border)', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 600, color: 'var(--text-sub)', cursor: 'pointer' },
  patternSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  patternLabel: { fontSize: 13, fontWeight: 700, color: 'var(--text)' },
  patternScroll: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' },
  patternItem: { minWidth: 90, height: 52, borderRadius: 10, border: '2.5px solid transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px' },
  patternItemSelected: { border: '2.5px solid var(--orange)', boxShadow: '0 0 0 2px rgba(255,107,53,0.3)' },
  previewLabel: { fontSize: 13, fontWeight: 700, color: 'var(--text)' },
  previewCard: { borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(255,107,53,0.1)' },
  removePhotoBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  submitPostBtn: { width: '100%', background: 'var(--orange)', border: 'none', borderRadius: 9999, padding: '16px', fontSize: 16, fontWeight: 900, color: '#fff', cursor: 'pointer', boxShadow: '0 6px 20px rgba(217,79,26,0.35)' },
  submitPostBtnDisabled: { background: '#ccc', boxShadow: 'none', cursor: 'not-allowed' },
  postDoneScreen: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  postDoneText: { fontSize: 28, fontWeight: 900, color: 'var(--orange)', animation: 'postDoneIn 0.4s ease-out forwards', zIndex: 320, position: 'relative', textAlign: 'center', marginBottom: 4 },
  shareBtn: { display: 'block', width: '100%', background: '#1a1a2e', border: 'none', borderRadius: 9999, padding: '14px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' },

  authOverlay: { position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 450, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' },
  authHeader: { padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--orange)', flexShrink: 0 },
  authBody: { flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 24px', gap: 14, overflowY: 'auto' },
  authTitle: { fontSize: 24, fontWeight: 900, color: 'var(--text)', textAlign: 'center', marginBottom: 4 },
  authInput: { width: '100%', border: '1.5px solid var(--card-border)', borderRadius: 12, padding: '14px', fontSize: 15, fontFamily: 'inherit', outline: 'none', background: 'var(--card-bg)', color: 'var(--text)', boxSizing: 'border-box' },
  googleBtn: { width: '100%', background: '#fff', border: '1.5px solid var(--card-border)', borderRadius: 9999, padding: '14px', fontSize: 15, fontWeight: 700, color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  emailRegisterBtn: { width: '100%', background: 'var(--orange)', border: 'none', borderRadius: 9999, padding: '16px', fontSize: 16, fontWeight: 900, color: '#fff', cursor: 'pointer', boxShadow: '0 6px 20px rgba(217,79,26,0.35)' },
  authLinkBtn: { background: 'none', border: 'none', fontSize: 13, color: 'var(--orange)', fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'underline', padding: '4px 0' },
  authBack: { background: 'none', border: 'none', fontSize: 14, color: 'var(--text-sub)', fontWeight: 600, cursor: 'pointer', textAlign: 'left', padding: '0 0 8px' },
  authError: { fontSize: 13, color: '#e53935', fontWeight: 600, textAlign: 'center', background: '#ffebee', borderRadius: 8, padding: '10px 14px' },

  onboardOverlay: { position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: 480, margin: '0 auto', padding: '0 32px 40px' },
  onboardSkip: { position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', fontSize: 14, fontWeight: 600, color: 'var(--text-sub)', cursor: 'pointer' },
  onboardSlide: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, justifyContent: 'center' },
  onboardTitle: { fontSize: 22, fontWeight: 900, color: 'var(--text)', lineHeight: 1.4, marginBottom: 12, whiteSpace: 'pre-line' },
  onboardSub: { fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7, whiteSpace: 'pre-line' },
  onboardDots: { display: 'flex', gap: 8, marginBottom: 24 },
  onboardDot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--card-border)', cursor: 'pointer' },
  onboardDotActive: { background: 'var(--orange)', width: 20, borderRadius: 99 },
  onboardNext: { width: '100%', background: 'var(--orange)', border: 'none', borderRadius: 9999, padding: '16px', fontSize: 17, fontWeight: 900, color: '#fff', cursor: 'pointer', boxShadow: '0 6px 20px rgba(217,79,26,0.35)' },

  // モーダル
  fwOverlay: { position: 'fixed', inset: 0, background: 'rgba(10,10,30,0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fwModalContent: { padding: '32px 24px', maxWidth: 320, width: '100%' },
  postOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' },
  postModalCard: { width: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' },
}
