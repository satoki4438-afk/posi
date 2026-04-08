import { NextResponse } from 'next/server'

export async function POST(request) {
  const { imageBase64, mimeType } = await request.json()
  const apiKey = process.env.VISION_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'VISION_API_KEY not set' }, { status: 500 })
  }

  const body = {
    requests: [{
      image: { content: imageBase64 },
      features: [{ type: 'SAFE_SEARCH_DETECTION' }],
    }],
  }

  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )
  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: 'Vision API error' }, { status: 500 })
  }

  const safe = data.responses?.[0]?.safeSearchAnnotation
  const NG_LEVELS = ['LIKELY', 'VERY_LIKELY']
  const blocked = safe && (
    NG_LEVELS.includes(safe.adult) ||
    NG_LEVELS.includes(safe.violence) ||
    NG_LEVELS.includes(safe.racy)
  )

  return NextResponse.json({ blocked: !!blocked })
}
