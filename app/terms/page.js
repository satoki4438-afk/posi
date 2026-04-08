'use client'

export default function TermsPage() {
  return (
    <div style={{ background: '#F5F5F0', minHeight: '100vh', maxWidth: 480, margin: '0 auto', padding: '0 0 40px' }}>
      <div style={{ position: 'sticky', top: 0, background: '#F5F5F0', borderBottom: '0.5px solid rgba(0,0,0,0.08)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10 }}>
        <button onClick={() => history.back()} style={{ background: 'none', border: 'none', fontSize: 15, fontWeight: 700, color: '#7C5CBF', cursor: 'pointer', padding: 0 }}>← 戻る</button>
        <span style={{ fontSize: 16, fontWeight: 900, color: '#1a1a2e' }}>利用規約</span>
      </div>

      <div style={{ padding: '24px 20px', lineHeight: 1.8 }}>
        <div style={{ fontSize: 13, color: '#6b6b80', marginBottom: 24 }}>
          <div>運営：tas.studio</div>
          <div>最終更新日：2026年4月8日</div>
        </div>

        <Section title="禁止事項">
          <ul style={listStyle}>
            <li>他者への誹謗中傷・嫌がらせ</li>
            <li>虚偽の情報の投稿</li>
            <li>著作権・肖像権を侵害するコンテンツの投稿</li>
            <li>18歳未満の方による会員登録</li>
            <li>その他法令に違反する行為</li>
          </ul>
        </Section>

        <Section title="免責事項">
          <p style={paraStyle}>本サービスの利用により生じた損害について、tas.studioは責任を負いません。</p>
          <p style={paraStyle}>サービスは予告なく変更・終了する場合があります。</p>
        </Section>

        <Section title="準拠法">
          <p style={paraStyle}>日本法を準拠法とします。</p>
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
