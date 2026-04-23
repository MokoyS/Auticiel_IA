import { NextRequest, NextResponse } from 'next/server'
import { getEditorial, setEditorial } from '@/lib/kv'

function unauthorized() {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
}

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  return NextResponse.json(await getEditorial())
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  const body = await req.json()
  await setEditorial(body)
  return NextResponse.json(body)
}
