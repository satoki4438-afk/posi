const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore')

const app = initializeApp({
  apiKey: 'AIzaSyD0AjExnUYpD6WUgvDz0ZRRryMXBiYTw8s',
  authDomain: 'posi-b6621.firebaseapp.com',
  projectId: 'posi-b6621',
  storageBucket: 'posi-b6621.firebasestorage.app',
  messagingSenderId: '53292920656',
  appId: '1:53292920656:web:b330b5f89edd679b274655',
})
const db = getFirestore(app)

const MOCK_POSTS = [
  { author: 'たろう', text: '今日マラソン完走した！初めての10km！',            congratsCount: 847, photo: 'https://picsum.photos/seed/run/400/300',  category: '💪 健康・ダイエット', minsAgo: 0 },
  { author: 'だいき', text: '初めての営業で契約取れた！断られ続けて2ヶ月、ようやく', congratsCount: 519, photo: null,                                   category: '💼 仕事・起業',      minsAgo: 45 },
  { author: 'なつみ', text: '毎日続けてた日記、今日でちょうど1年になった',      congratsCount: 302, photo: null,                                   category: '🌱 その他の達成',    minsAgo: 60 },
  { author: 'みさき', text: '子供が初めて自転車に乗れた！1週間の練習の成果',    congratsCount: 156, photo: null,                                   category: '👶 家族・育児',      minsAgo: 120 },
  { author: 'けんじ', text: '念願のカフェ、今日オープンしました！店主になったよ', congratsCount: 992, photo: 'https://picsum.photos/seed/cafe/400/300', category: '💼 仕事・起業',      minsAgo: 180 },
]

;(async () => {
  const col = collection(db, 'posts')
  for (const p of MOCK_POSTS) {
    const createdAt = Timestamp.fromDate(new Date(Date.now() - p.minsAgo * 60 * 1000))
    await addDoc(col, {
      authorName: p.author,
      text: p.text,
      category: p.category,
      congratsCount: p.congratsCount,
      imageUrl: p.photo,
      createdAt,
      reported: false,
      userId: 'seed',
    })
    process.stdout.write('.')
  }
  console.log('\nDone: ' + MOCK_POSTS.length + '件投入完了')
  process.exit(0)
})()
