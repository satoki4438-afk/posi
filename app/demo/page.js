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
    if (effect !== '🎆') { cancelAnimationFrame(animRef.current); return }
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const ctx = canvas.getContext('2d')
    const particles = [], rockets = [], flashes = [], pending = []
    const COLORS = ['#ff6b35','#f5a623','#fff','#4caf50','#2196f3','#e91e63','#9c27b0','#ffeb3b','#00bcd4','#ff4488']

    const explode = (x, y) => {
      flashes.push({ x, y, life: 1 })
      const isSingle = Math.random() < 0.5
      const c1 = COLORS[Math.floor(Math.random() * COLORS.length)]
      let c2 = COLORS[Math.floor(Math.random() * COLORS.length)]
      while (c2 === c1) c2 = COLORS[Math.floor(Math.random() * COLORS.length)]
      const colorFn = (s) => isSingle ? c1 : (s < 7 ? c1 : c2)
      const count = 120 + Math.floor(Math.random() * 31)
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + (Math.random()-0.5)*(Math.PI/12)
        const s = 3 + Math.random() * 9
        const isTail = Math.random() < 0.35
        const decay = (isTail ? 0.006+Math.random()*0.008 : 0.014+Math.random()*0.012) + (s > 7 ? 0.005 : 0)
        particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, color: colorFn(s), life: 1, decay, size: isTail ? 1.5+Math.random() : 2+Math.random()*2.5, isTail })
      }
    }

    let frame = 0, nextLaunch = 0
    const launch = () => {
      const count = 2 + Math.floor(Math.random() * 2)
      for (let i = 0; i < count; i++) {
        pending.push({ spawnAt: frame + i*12, rocket: { x: canvas.width*(0.15+Math.random()*0.7), y: canvas.height, vy: -(9+Math.random()*5), vx: (Math.random()-0.5)*1.5, targetY: canvas.height*(0.08+Math.random()*0.3), trail: [] } })
      }
      nextLaunch = frame + 20 + Math.floor(Math.random()*21)
    }

    const tick = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      for (let i = flashes.length-1; i >= 0; i--) {
        const f = flashes[i]; f.life -= 0.12
        if (f.life <= 0) { flashes.splice(i,1); continue }
        const g = ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,60*f.life)
        g.addColorStop(0,`rgba(255,255,255,${f.life*0.9})`); g.addColorStop(1,'rgba(255,255,255,0)')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x,f.y,60*f.life,0,Math.PI*2); ctx.fill()
      }
      for (let i = pending.length-1; i >= 0; i--) {
        if (frame >= pending[i].spawnAt) { rockets.push(pending[i].rocket); pending.splice(i,1) }
      }
      if (frame >= nextLaunch) launch()
      frame++
      for (let i = rockets.length-1; i >= 0; i--) {
        const r = rockets[i]; r.vx += (Math.random()-0.5)*0.3
        r.trail.push({x:r.x,y:r.y}); if (r.trail.length>12) r.trail.shift()
        r.x += r.vx; r.y += r.vy
        r.trail.forEach((t,ti) => { ctx.beginPath(); ctx.arc(t.x,t.y,2,0,Math.PI*2); ctx.fillStyle=`rgba(255,200,100,${ti/r.trail.length})`; ctx.fill() })
        if (r.y <= r.targetY) { explode(r.x,r.y); rockets.splice(i,1) }
      }
      for (let i = particles.length-1; i >= 0; i--) {
        const p = particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.06; p.vx*=0.98; p.life-=p.decay
        if (p.life <= 0) { particles.splice(i,1); continue }
        ctx.globalAlpha = p.life
        if (p.isTail) { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-p.vx*3,p.y-p.vy*3); ctx.strokeStyle=p.color; ctx.lineWidth=p.size*p.life; ctx.stroke() }
        else { ctx.beginPath(); ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2); ctx.fillStyle=p.color; ctx.fill() }
        ctx.globalAlpha = 1
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
