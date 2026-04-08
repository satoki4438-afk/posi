'use client'

export default function PrivacyPage() {
  return (
    <div style={{ background: '#F5F5F0', minHeight: '100vh', maxWidth: 480, margin: '0 auto', padding: '0 0 40px' }}>
      <div style={{ position: 'sticky', top: 0, background: '#F5F5F0', borderBottom: '0.5px solid rgba(0,0,0,0.08)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10 }}>
        <button onClick={() => history.back()} style={{ background: 'none', border: 'none', fontSize: 15, fontWeight: 700, color: '#7C5CBF', cursor: 'pointer', padding: 0 }}>← 戻る</button>
        <span style={{ fontSize: 16, fontWeight: 900, color: '#1a1a2e' }}>プライバシーポリシー</span>
      </div>

      <div style={{ padding: '24px 20px', lineHeight: 1.8 }}>
        <div style={{ fontSize: 13, color: '#6b6b80', marginBottom: 24 }}>
          <div>運営：tas.studio</div>
          <div>お問い合わせ：tas.studio2026@gmail.com</div>
          <div>最終更新日：2026年4月8日</div>
        </div>

        <Section title="取得する情報">
          <ul style={listStyle}>
            <li>メールアドレス・表示名（会員登録時）</li>
            <li>Googleアカウント情報（Googleログイン時）</li>
            <li>投稿テキスト・写真</li>
            <li>FCMトークン（プッシュ通知用）</li>
            <li>利用ログ（Firebase Analytics）</li>
          </ul>
        </Section>

        <Section title="利用目的">
          <ul style={listStyle}>
            <li>サービスの提供・運営</li>
            <li>プッシュ通知の送信</li>
            <li>不正利用の防止</li>
          </ul>
        </Section>

        <Section title="第三者提供">
          <p style={paraStyle}>法令に基づく場合を除き、個人情報を第三者に提供しません。</p>
        </Section>

        <Section title="利用するサービス">
          <ul style={listStyle}>
            <li>Firebase（Google LLC）：認証・データ保存・通知</li>
            <li>Vercel Inc.：ホスティング</li>
          </ul>
        </Section>

        <Section title="お問い合わせ">
          <p style={paraStyle}>tas.studio2026@gmail.com</p>
        </Section>
      </div>
    </div>
  )
}

const listStyle = { margin: '8px 0 0 0', paddingLeft: 20, color: '#1a1a2e', fontSize: 14 }
const paraStyle = { margin: '8px 0 0 0', color: '#1a1a2e', fontSize: 14 }

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#7C5CBF', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
      <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        {children}
      </div>
    </div>
  )
}
