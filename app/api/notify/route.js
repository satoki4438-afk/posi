export async function POST(req) {
  const { token, title, body } = await req.json()
  if (!token || !title) return Response.json({ error: 'missing params' }, { status: 400 })

  const serverKey = process.env.FCM_SERVER_KEY
  if (!serverKey) return Response.json({ error: 'FCM_SERVER_KEY not set' }, { status: 500 })

  const res = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `key=${serverKey}`,
    },
    body: JSON.stringify({
      to: token,
      notification: { title, body: body || '' },
    }),
  })

  const data = await res.json()
  return Response.json(data, { status: res.ok ? 200 : 502 })
}
