import { NextRequest, NextResponse } from 'next/server'
import { getTemplates, setTemplates } from '@/lib/kv'

function unauthorized() {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
}

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('x-admin-password')
  return auth === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  const data = await getTemplates()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  const body = await req.json()
  const templates = await getTemplates()
  const newTemplate = { ...body, id: body.id || crypto.randomUUID() }
  await setTemplates([...templates, newTemplate])
  return NextResponse.json(newTemplate, { status: 201 })
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  const body = await req.json()
  const templates = await getTemplates()
  const updated = templates.map(t => t.id === body.id ? body : t)
  await setTemplates(updated)
  return NextResponse.json(body)
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  const { id } = await req.json()
  const templates = await getTemplates()
  await setTemplates(templates.filter(t => t.id !== id))
  return NextResponse.json({ success: true })
}
