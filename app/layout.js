import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const noto = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

export const metadata = {
  title: 'POSI.',
  description: 'ポジティブな達成を祝い合うSNS',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className={noto.className}>{children}</body>
    </html>
  )
}
