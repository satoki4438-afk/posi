importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyD0AjExnUYpD6WUgvDz0ZRRryMXBiYTw8s',
  authDomain: 'posi-b6621.firebaseapp.com',
  projectId: 'posi-b6621',
  storageBucket: 'posi-b6621.firebasestorage.app',
  messagingSenderId: '53292920656',
  appId: '1:53292920656:web:b330b5f89edd679b274655',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {}
  self.registration.showNotification(title || 'Posi', {
    body: body || '',
    icon: '/icon-192.png',
  })
})
