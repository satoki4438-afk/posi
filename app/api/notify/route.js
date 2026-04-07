import { createSign } from 'crypto'

const PROJECT_ID = 'posi-b6621'

async function getAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url')

  const signingInput = `${header}.${payload}`
  const sign = createSign('RSA-SHA256')
  sign.update(signingInput)
  const signature = sign.sign(serviceAccount.private_key, 'base64url')
  const jwt = `${signingInput}.${signature}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  const data = await res.json()
  return data.access_token
}

export async function POST(req) {
  const { token, title, body } = await req.json()
  if (!token || !title) return Response.json({ error: 'missing params' }, { status: 400 })

  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!saJson) return Response.json({ error: 'service account not configured' }, { status: 500 })

  const serviceAccount = JSON.parse(saJson)
  const accessToken = await getAccessToken(serviceAccount)

  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      message: {
        token,
        notification: { title, body: body || '' },
      },
    }),
  })

  const data = await res.json()
  return Response.json(data, { status: res.ok ? 200 : 502 })
}
