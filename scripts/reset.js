const { initializeApp } = require('firebase/app')
const { getFirestore, collection, getDocs, deleteDoc, addDoc, doc, setDoc, Timestamp } = require('firebase/firestore')

const app = initializeApp({
  apiKey: 'AIzaSyD0AjExnUYpD6WUgvDz0ZRRryMXBiYTw8s',
  authDomain: 'posi-b6621.firebaseapp.com',
  projectId: 'posi-b6621',
  storageBucket: 'posi-b6621.firebasestorage.app',
  messagingSenderId: '53292920656',
  appId: '1:53292920256:web:b330b5f89edd679b274655',
})
const db = getFirestore(app)

async function clearCollection(name) {
  const snap = await getDocs(collection(db, name))
  for (const d of snap.docs) await deleteDoc(doc(db, name, d.id))
  console.log(`${name}: ${snap.size}件削除`)
}

const SEEDS = [
  { author: 'たろう', text: '今日マラソン完走した！初めての10km！',             congratsCount: 847, photo: 'https://picsum.photos/seed/marathon1/400/220', category: '💪 健康・ダイエット', minsAgo: 2 },
  { author: 'みさき', text: '子供が初めて自転車に乗れた！1週間の練習の成果',    congratsCount: 156, photo: null,                                            category: '👶 家族・育児',      minsAgo: 30 },
  { author: 'なつみ', text: '毎日続けてた日記、今日でちょうど1年になった',       congratsCount: 302, photo: null,                                            category: '🌱 その他の達成',    minsAgo: 90 },
  { author: 'けんじ', text: '念願のカフェ、今日オープンしました！店主になったよ', congratsCount: 992, photo: 'https://picsum.photos/seed/cafe99/400/220',    category: '💼 仕事・起業',      minsAgo: 180 },
  { author: 'だいき', text: '初めての営業で契約取れた！断られ続けて2ヶ月、ようやく', congratsCount: 519, photo: null,                                         category: '💼 仕事・起業',      minsAgo: 300 },
]

;(async () => {
  // 全消去
  await clearCollection('posts')
  await clearCollection('messages')

  // genki リセット
  await setDoc(doc(db, 'meta', 'genki'), { congratsCount: 0 })
  console.log('meta/genki: リセット')

  // 再投入
  for (const p of SEEDS) {
    await addDoc(collection(db, 'posts'), {
      authorName: p.author,
      text: p.text,
      category: p.category,
      congratsCount: p.congratsCount,
      imageUrl: p.photo,
      createdAt: Timestamp.fromDate(new Date(Date.now() - p.minsAgo * 60 * 1000)),
      reported: false,
      userId: 'seed',
    })
    process.stdout.write('.')
  }
  console.log('\nposts: ' + SEEDS.length + '件投入完了')
  process.exit(0)
})()
