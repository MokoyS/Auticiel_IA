import { NextRequest, NextResponse } from 'next/server'
import { getProcesses, setProcesses } from '@/lib/kv'

function unauthorized() {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
}

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  return NextResponse.json(await getProcesses())
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  const body = await req.json()
  const processes = await getProcesses()
  const item = { ...body, id: body.id || crypto.randomUUID(), steps: body.steps || [] }
  await setProcesses([...processes, item])
  return NextResponse.json(item, { status: 201 })
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  const body = await req.json()
  const processes = await getProcesses()
  await setProcesses(processes.map(p => p.id === body.id ? body : p))
  return NextResponse.json(body)
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  const { id } = await req.json()
  const processes = await getProcesses()
  await setProcesses(processes.filter(p => p.id !== id))
  return NextResponse.json({ success: true })
}
