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
  { author: 'たろう',   text: '今日マラソン完走した！初めての10km！',                         congratsCount: 847, photo: 'https://picsum.photos/seed/marathon1/400/220',  category: '💪 健康・ダイエット', minsAgo: 2 },
  { author: 'はなこ',   text: 'TOEIC 900点超えた。3年間の勉強がついに実った！',                congratsCount: 234, photo: null,                                            category: '📚 資格・勉強',      minsAgo: 15 },
  { author: 'けんじ',   text: '念願のカフェ、今日オープンしました！店主になったよ',            congratsCount: 992, photo: 'https://picsum.photos/seed/cafe99/400/220',     category: '💼 仕事・起業',      minsAgo: 60 },
  { author: 'みさき',   text: '子供が初めて自転車に乗れた！1週間の練習の成果',                congratsCount: 156, photo: null,                                            category: '👶 家族・育児',      minsAgo: 120 },
  { author: 'ゆうき',   text: '独学3ヶ月でWebアプリ完成させた。ついにリリースできた！',        congratsCount: 421, photo: null,                                            category: '💼 仕事・起業',      minsAgo: 180 },
  { author: 'りょうた', text: 'ベンチプレス100kg達成！1年半かかったけどやっと三桁！',          congratsCount: 763, photo: 'https://picsum.photos/seed/gym42/400/220',      category: '💪 健康・ダイエット', minsAgo: 5 },
  { author: 'あやか',   text: '簿記2級、一発合格した！毎朝5時起きで勉強した甲斐があった',      congratsCount: 88,  photo: null,                                            category: '📚 資格・勉強',      minsAgo: 32 },
  { author: 'だいき',   text: '初めての営業で契約取れた！断られ続けて2ヶ月、ようやく',        congratsCount: 519, photo: null,                                            category: '💼 仕事・起業',      minsAgo: 45 },
  { author: 'なつみ',   text: '毎日続けてた日記、今日でちょうど1年になった📖',                congratsCount: 302, photo: 'https://picsum.photos/seed/notebook7/400/220', category: '🌱 その他の達成',    minsAgo: 60 },
  { author: 'しょうた', text: 'スクワット自重100回、ノンストップでできた！半年前は30回だった',  congratsCount: 671, photo: null,                                            category: '💪 健康・ダイエット', minsAgo: 120 },
  { author: 'まい',     text: '転職活動、内定もらえた！希望の会社に行けます',                  congratsCount: 950, photo: null,                                            category: '💼 仕事・起業',      minsAgo: 120 },
  { author: 'こうへい', text: '子供と一緒に作った工作、学校で金賞取れた！',                    congratsCount: 137, photo: 'https://picsum.photos/seed/craft55/400/220',  category: '👶 家族・育児',      minsAgo: 180 },
  { author: 'えり',     text: 'ランニング累計500km達成。毎朝コツコツ積み上げた結果',            congratsCount: 408, photo: null,                                            category: '💪 健康・ダイエット', minsAgo: 240 },
  { author: 'とも',     text: '苦手だった英語の発表、今日は震えなかった。小さな一歩',          congratsCount: 54,  photo: null,                                            category: '📚 資格・勉強',      minsAgo: 300 },
  { author: 'かずや',   text: 'フリーランス1年目の確定申告、自力で乗り越えた！',              congratsCount: 829, photo: null,                                            category: '💼 仕事・起業',      minsAgo: 360 },
  { author: 'のぞみ',   text: '初めてのハーフマラソン、2時間10分で完走！',                    congratsCount: 612, photo: 'https://picsum.photos/seed/run88/400/220',     category: '🏆 スポーツ・大会',  minsAgo: 420 },
  { author: 'たいち',   text: '宅建の試験、合格できた！独学8ヶ月の勉強が実を結んだ',            congratsCount: 278, photo: null,                                            category: '📚 資格・勉強',      minsAgo: 480 },
  { author: 'さくら',   text: '初めて自分で料理した手作りケーキ、家族に大好評だった！',        congratsCount: 445, photo: 'https://picsum.photos/seed/cake33/400/220',    category: '🌱 その他の達成',    minsAgo: 540 },
  { author: 'ひろき',   text: 'デッドリフト150kg達成。2年かかったけど目標クリア！',            congratsCount: 733, photo: null,                                            category: '💪 健康・ダイエット', minsAgo: 600 },
  { author: 'ゆいな',   text: 'ブログ100記事書いた！毎週更新してついに達成',                  congratsCount: 91,  photo: null,                                            category: '🌱 その他の達成',    minsAgo: 660 },
  { author: 'けいすけ', text: 'チームで開発したアプリ、App Storeの審査が通過した！',           congratsCount: 884, photo: 'https://picsum.photos/seed/phone22/400/220',  category: '💼 仕事・起業',      minsAgo: 720 },
  { author: 'あいこ',   text: '子供の寝かしつけ後に毎日1時間勉強、ついにFP2級合格',           congratsCount: 322, photo: null,                                            category: '📚 資格・勉強',      minsAgo: 780 },
  { author: 'まさと',   text: '懸垂20回連続できた！毎日コツコツやり続けた1年の成果',           congratsCount: 567, photo: null,                                            category: '💪 健康・ダイエット', minsAgo: 840 },
  { author: 'りな',     text: '育休明け初日、無事に乗り越えた。職場のみんなに感謝',            congratsCount: 719, photo: 'https://picsum.photos/seed/office11/400/220', category: '💼 仕事・起業',      minsAgo: 900 },
  { author: 'しんじ',   text: '家族で植えた家庭菜園、初めてのトマトが収穫できた！',            congratsCount: 183, photo: 'https://picsum.photos/seed/garden5/400/220',  category: '🌱 その他の達成',    minsAgo: 960 },
  { author: 'けいた',   text: '富士山登頂した！3776m制覇',                                      congratsCount: 512, photo: 'https://picsum.photos/seed/fuji26/400/500',  category: '🏆 スポーツ・大会',  minsAgo: 30 },
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
