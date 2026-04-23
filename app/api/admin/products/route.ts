import { NextRequest, NextResponse } from 'next/server'
import { getProducts, setProducts } from '@/lib/kv'

function unauthorized() {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
}

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  return NextResponse.json(await getProducts())
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  const body = await req.json()
  const products = await getProducts()
  const item = { ...body, id: body.id || crypto.randomUUID() }
  await setProducts([...products, item])
  return NextResponse.json(item, { status: 201 })
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  const body = await req.json()
  const products = await getProducts()
  await setProducts(products.map(p => p.id === body.id ? body : p))
  return NextResponse.json(body)
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()
  const { id } = await req.json()
  const products = await getProducts()
  await setProducts(products.filter(p => p.id !== id))
  return NextResponse.json({ success: true })
}
