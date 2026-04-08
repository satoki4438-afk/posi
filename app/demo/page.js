'use client'

import { useState, useEffect, useRef } from 'react'

const EFFECTS = [
  { e: '🎆', label: '花火' },
  { e: '🏮', label: 'スカイランタン' },
  { e: '☄️', label: '流星群' },
  { e: '🦋', label: '光の蝶' },
  { e: '🎈', label: '風船' },
]

const BG = { '🎆': '#000', '🏮': '#05031a', '☄️': '#000', '🦋': '#1a0a2e', '🎈': '#87ceeb' }

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
        const a = (Math.PI * 2 * i) / count + (Math.random()-0.5)*(Math.PI/12)
        const s = 2 + Math.random() * 6
        const isTail = Math.random() < 0.4
        const decay = isTail ? 0.005+Math.random()*0.006 : 0.009+Math.random()*0.008
        particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, color: colorFn(s), life: 1, decay, size: isTail ? 1.5+Math.random() : 2+Math.random()*2.5, isTail })
      }
    }

    let frame = 0, nextLaunch = 0
    const launch = () => {
      const count = 2 + Math.floor(Math.random() * 2)
      for (let i = 0; i < count; i++) {
        pending.push({ spawnAt: frame + i*12, rocket: { x: canvas.width*(0.15+Math.random()*0.7), y: canvas.height, vy: -(6+Math.random()*4), vx: (Math.random()-0.5)*1.0, targetY: canvas.height*(0.1+Math.random()*0.32), trail: [] } })
      }
      nextLaunch = frame + 20 + Math.floor(Math.random()*21)
    }

    const tick = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      for (let i = flashes.length-1; i >= 0; i--) {
        const f = flashes[i]; f.life -= 0.08
        if (f.life <= 0) { flashes.splice(i,1); continue }
        const g = ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,90*f.life)
        g.addColorStop(0,`rgba(255,240,255,${f.life*0.75})`); g.addColorStop(0.4,`rgba(200,180,255,${f.life*0.35})`); g.addColorStop(1,'rgba(255,255,255,0)')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x,f.y,90*f.life,0,Math.PI*2); ctx.fill()
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
        const p = particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.03; p.vx*=0.99; p.life-=p.decay
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

  // スカイランタン Canvas
  useEffect(() => {
    if (effect !== '🏮') { cancelAnimationFrame(animRef.current); return }
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const ctx = canvas.getContext('2d')

    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: 0.5 + Math.random() * 1.5, a: 0.2 + Math.random() * 0.6,
      tw: Math.random() * Math.PI * 2, ts: 0.02 + Math.random() * 0.04,
    }))
    const lanterns = Array.from({ length: 22 }, () => ({
      x: canvas.width * (0.05 + Math.random() * 0.9),
      y: canvas.height + 60 + Math.random() * 300,
      vy: -(0.35 + Math.random() * 0.45),
      size: 0.5 + Math.random() * 0.9,
      swayAmp: 12 + Math.random() * 22,
      swaySpeed: 0.004 + Math.random() * 0.007,
      swayPhase: Math.random() * Math.PI * 2,
      alpha: 0, targetAlpha: 0.7 + Math.random() * 0.3,
    }))

    const drawLantern = (x, y, size, alpha) => {
      const w = 18 * size, h = 26 * size
      ctx.save()
      const g = ctx.createRadialGradient(x, y, 0, x, y, w * 3.2)
      g.addColorStop(0, `rgba(255,155,40,${alpha * 0.6})`)
      g.addColorStop(0.4, `rgba(255,100,10,${alpha * 0.2})`)
      g.addColorStop(1, 'rgba(255,80,0,0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, w * 3.2, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = alpha
      const r = w / 3
      ctx.beginPath()
      ctx.moveTo(x - w/2 + r, y - h/2)
      ctx.arcTo(x + w/2, y - h/2, x + w/2, y + h/2, r)
      ctx.arcTo(x + w/2, y + h/2, x - w/2, y + h/2, r)
      ctx.arcTo(x - w/2, y + h/2, x - w/2, y - h/2, r)
      ctx.arcTo(x - w/2, y - h/2, x + w/2, y - h/2, r)
      ctx.closePath()
      const bg = ctx.createRadialGradient(x, y - h/8, w * 0.08, x, y, w * 0.95)
      bg.addColorStop(0, '#fff8d0'); bg.addColorStop(0.3, '#ffcc44')
      bg.addColorStop(0.7, '#ff8800'); bg.addColorStop(1, '#aa3300')
      ctx.fillStyle = bg; ctx.fill()
      ctx.strokeStyle = `rgba(160,50,0,${alpha * 0.45})`; ctx.lineWidth = 0.8 * size
      for (let li = -1; li <= 1; li++) {
        ctx.beginPath(); ctx.moveTo(x - w/2 + 3, y + li * h/4); ctx.lineTo(x + w/2 - 3, y + li * h/4); ctx.stroke()
      }
      ctx.fillStyle = `rgba(90,25,0,${alpha})`
      ctx.fillRect(x - w/4, y - h/2 - 4 * size, w/2, 5 * size)
      ctx.strokeStyle = `rgba(160,90,0,${alpha * 0.55})`; ctx.lineWidth = 0.8 * size
      ctx.beginPath(); ctx.moveTo(x, y - h/2 - 4 * size); ctx.lineTo(x, y - h/2 - 11 * size); ctx.stroke()
      ctx.fillStyle = `rgba(200,55,0,${alpha * 0.85})`
      ctx.fillRect(x - w/6, y + h/2, w/3, 5 * size)
      ctx.restore()
    }

    const tick = () => {
      ctx.fillStyle = 'rgba(5,3,22,0.22)'; ctx.fillRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        s.tw += s.ts
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,240,200,${s.a * (0.5 + 0.5 * Math.sin(s.tw))})`; ctx.fill()
      })
      lanterns.forEach(l => {
        if (l.y < canvas.height + 20) l.alpha = Math.min(l.alpha + 0.008, l.targetAlpha)
        l.swayPhase += l.swaySpeed
        l.x += Math.sin(l.swayPhase) * l.swayAmp * 0.025
        l.y += l.vy
        l.x = Math.max(20, Math.min(canvas.width - 20, l.x))
        if (l.y < -120) {
          l.y = canvas.height + 60 + Math.random() * 100
          l.x = canvas.width * (0.05 + Math.random() * 0.9)
          l.alpha = 0; l.swayPhase = Math.random() * Math.PI * 2
        }
        if (l.alpha > 0.01) drawLantern(l.x, l.y, l.size, l.alpha)
      })
      animRef.current = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(animRef.current)
  }, [effect])

  // その他演出のアイテム生成
  useEffect(() => {
    if (effect === '🎆' || effect === '🏮') { setItems([]); return }
    const count = effect === '🎈' ? 10 : effect === '☄️' ? 14 : 10
    const BALLOON_HUES = [0, 55, 165, 220, 105]
    setItems(Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 5 + Math.random() * 88,
      dur: effect === '🎈' ? 9+Math.random()*6 : effect === '☄️' ? 4+Math.random()*3 : 7+Math.random()*5,
      delay: Math.random() * 5,
      size: 0.5 + Math.random() * 0.7,
      sway: (Math.random() - 0.5) * 90,
      hue: BALLOON_HUES[i % 5],
    })))
  }, [effect])

  return (
    <div style={{ background: '#111', minHeight: '100vh', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes meteorFall { 0%{opacity:0;transform:rotate(35deg) translateX(0)} 8%{opacity:1} 88%{opacity:0.85} 100%{opacity:0;transform:rotate(35deg) translateX(-130vw)} }
        @keyframes balloonRise { 0%{transform:translateY(0) translateX(0);opacity:0} 8%{opacity:1} 40%{transform:translateY(-38vh) translateX(var(--sw))} 72%{transform:translateY(-76vh) translateX(0)} 100%{transform:translateY(-115vh) translateX(calc(var(--sw)*0.6));opacity:0} }
        @keyframes butterflyFloat { 0%{transform:translate(0,0) rotate(0deg) scale(1)} 20%{transform:translate(50px,-70px) rotate(8deg) scale(1.05)} 45%{transform:translate(100px,15px) rotate(-5deg) scale(0.96)} 70%{transform:translate(30px,75px) rotate(9deg) scale(1.04)} 85%{transform:translate(-25px,40px) rotate(-3deg) scale(1)} 100%{transform:translate(0,0) rotate(0deg) scale(1)} }
        @keyframes wingFlap { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(0.15)} }
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

        {/* 動画背景（花火・ランタン・流星群・光の蝶） */}
        {effect !== '🎈' && (() => {
          const videoMap = { '🎆': '/videos/hanabi.mp4', '🏮': '/videos/rantan.mp4', '☄️': '/videos/ryusei.mp4', '🦋': '/videos/tyoutyou.mp4' }
          return (
            <>
              <video key={videoMap[effect]} autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} src={videoMap[effect]} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, background: 'rgba(0,0,0,0.85)', zIndex: 1 }} />
            </>
          )
        })()}

        {effect === '🎈' && items.map(item => (
          <div key={item.id} style={{ position: 'absolute', left: `${item.left}%`, bottom: -70, fontSize: 50 + item.size * 20, animation: `balloonRise ${item.dur}s ${item.delay}s ease-in-out infinite`, '--sw': `${item.sway}px`, filter: `hue-rotate(${item.hue}deg) brightness(1.1) saturate(0.85)` }}>🎈</div>
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
