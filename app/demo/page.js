'use client'

import { useState, useEffect, useRef } from 'react'

const EFFECTS = [
  { e: '🎆', label: '花火' },
  { e: '🏮', label: 'ランタン' },
  { e: '☄️', label: '流星群' },
  { e: '🦋', label: '光の蝶' },
  { e: '🎈', label: '風船' },
]

const BG = { '🎆': '#000', '🏮': '#0a0a2e', '☄️': '#000', '🦋': '#1a0a2e', '🎈': '#87ceeb' }

export default function DemoPage() {
  const [effect, setEffect] = useState('🎆')
  const [items, setItems] = useState([])
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  // 花火 Canvas
  useEffect(() => {
    if (effect !== '🎆') {
      cancelAnimationFrame(animRef.current)
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const ctx = canvas.getContext('2d')
    const particles = []
    const rockets = []
    const COLORS = ['#ff6b35','#f5a623','#fff','#4caf50','#2196f3','#e91e63','#9c27b0','#ffeb3b']
    const explode = (x, y) => {
      for (let i = 0; i < 80; i++) {
        const a = (Math.PI * 2 * i) / 80
        const s = 2 + Math.random() * 5
        particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, color: COLORS[i%COLORS.length], life: 1, decay: 0.012 + Math.random()*0.015, size: 2 + Math.random()*2 })
      }
    }
    const launch = () => rockets.push({ x: canvas.width*(0.2+Math.random()*0.6), y: canvas.height, vy: -(9+Math.random()*5), targetY: canvas.height*(0.1+Math.random()*0.35), trail: [] })
    let frame = 0
    const tick = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      if (++frame % 45 === 0) launch()
      rockets.forEach((r, ri) => {
        r.trail.push({ x: r.x, y: r.y })
        if (r.trail.length > 12) r.trail.shift()
        r.y += r.vy
        r.trail.forEach((t, ti) => { ctx.beginPath(); ctx.arc(t.x,t.y,2,0,Math.PI*2); ctx.fillStyle=`rgba(255,200,100,${ti/r.trail.length})`; ctx.fill() })
        if (r.y <= r.targetY) { explode(r.x, r.y); rockets.splice(ri, 1) }
      })
      for (let i = particles.length-1; i >= 0; i--) {
        const p = particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.06; p.life-=p.decay
        if (p.life <= 0) { particles.splice(i, 1); continue }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size*p.life, 0, Math.PI*2)
        ctx.fillStyle = p.color; ctx.globalAlpha = p.life; ctx.fill(); ctx.globalAlpha = 1
      }
      animRef.current = requestAnimationFrame(tick)
    }
    launch(); tick()
    return () => cancelAnimationFrame(animRef.current)
  }, [effect])

  // その他演出のアイテム生成
  useEffect(() => {
    if (effect === '🎆') { setItems([]); return }
    const count = effect === '🎈' ? 12 : effect === '🏮' ? 8 : effect === '☄️' ? 16 : 10
    setItems(Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 5 + Math.random() * 90,
      dur: 4 + Math.random() * 5,
      delay: Math.random() * 3,
      size: 0.7 + Math.random() * 0.8,
      sway: (Math.random() - 0.5) * 60,
    })))
  }, [effect])

  return (
    <div style={{ background: '#111', minHeight: '100vh', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes lanternRise { 0%{transform:translateY(0) translateX(0) rotate(-3deg);opacity:0} 10%{opacity:1} 50%{transform:translateY(-50vh) translateX(var(--sw)) rotate(3deg)} 100%{transform:translateY(-110vh) translateX(0) rotate(-3deg);opacity:0} }
        @keyframes meteorFall { 0%{transform:translate(0,0);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translate(-120vw,120vh);opacity:0} }
        @keyframes balloonRise { 0%{transform:translateY(0) translateX(0);opacity:0} 10%{opacity:1} 50%{transform:translateY(-50vh) translateX(var(--sw))} 100%{transform:translateY(-110vh) translateX(0);opacity:0} }
        @keyframes butterflyFloat { 0%{transform:translate(0,0) rotate(0deg)} 25%{transform:translate(60px,-40px) rotate(15deg)} 50%{transform:translate(120px,20px) rotate(-10deg)} 75%{transform:translate(60px,60px) rotate(20deg)} 100%{transform:translate(0,0) rotate(0deg)} }
        @keyframes wingFlap { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(0.3)} }
      `}</style>

      {/* ヘッダー */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
        <button onClick={() => history.back()} style={{ background: 'none', border: 'none', color: '#FF6B35', fontSize: 15, fontWeight: 700, cursor: 'pointer', padding: 0 }}>← 戻る</button>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>お祝い演出デモ</span>
      </div>

      {/* 演出切り替えボタン */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 20px', flexWrap: 'wrap' }}>
        {EFFECTS.map(({ e, label }) => (
          <button key={e} onClick={() => setEffect(e)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            background: effect === e ? 'rgba(245,96,30,0.25)' : 'rgba(255,255,255,0.08)',
            border: effect === e ? '2px solid #f5601e' : '2px solid transparent',
            borderRadius: 14, padding: '10px 14px', cursor: 'pointer',
          }}>
            <span style={{ fontSize: 28 }}>{e}</span>
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* 演出ステージ */}
      <div style={{ flex: 1, position: 'relative', background: BG[effect], overflow: 'hidden', minHeight: 500 }}>

        {effect === '🎆' && (
          <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        )}

        {effect === '🏮' && items.map(item => (
          <div key={item.id} style={{ position: 'absolute', left: `${item.left}%`, bottom: -60, fontSize: 36 * item.size, animation: `lanternRise ${item.dur}s ${item.delay}s ease-in-out infinite`, '--sw': `${item.sway}px`, filter: 'drop-shadow(0 0 12px rgba(255,140,0,0.8))' }}>🏮</div>
        ))}

        {effect === '☄️' && items.map(item => (
          <div key={item.id} style={{ position: 'absolute', right: `${item.left}%`, top: `${10 + (item.id * 6) % 40}%`, width: 2 + item.size * 2, height: 80 + item.size * 40, background: 'linear-gradient(135deg, #fff, transparent)', borderRadius: 99, animation: `meteorFall ${item.dur}s ${item.delay}s linear infinite`, transform: 'rotate(35deg)' }} />
        ))}

        {effect === '🦋' && items.map(item => (
          <div key={item.id} style={{ position: 'absolute', left: `${10 + (item.id * 8) % 80}%`, top: `${15 + (item.id * 7) % 65}%`, animation: `butterflyFloat ${item.dur}s ${item.delay}s ease-in-out infinite`, filter: 'drop-shadow(0 0 8px rgba(200,150,255,0.9))' }}>
            <span style={{ fontSize: 28 * item.size, display: 'block', animation: `wingFlap 0.4s ${item.delay}s linear infinite` }}>🦋</span>
          </div>
        ))}

        {effect === '🎈' && items.map(item => (
          <div key={item.id} style={{ position: 'absolute', left: `${item.left}%`, bottom: -60, fontSize: 32 * item.size, animation: `balloonRise ${item.dur}s ${item.delay}s ease-in-out infinite`, '--sw': `${item.sway}px` }}>🎈</div>
        ))}

        {/* 演出名ラベル */}
        <div style={{ position: 'absolute', top: 16, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
            {EFFECTS.find(x => x.e === effect)?.label}
          </span>
        </div>
      </div>
    </div>
  )
}
