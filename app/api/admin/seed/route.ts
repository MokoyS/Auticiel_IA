import { NextRequest, NextResponse } from 'next/server'
import { setTemplates, setProducts, setProcesses, setEditorial } from '@/lib/kv'
import templates from '@/data/templates.json'
import products from '@/data/products.json'
import processes from '@/data/processes.json'
import editorial from '@/data/editorial.json'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  await setTemplates(templates as any)
  await setProducts(products as any)
  await setProcesses(processes as any)
  await setEditorial(editorial as any)

  return NextResponse.json({ success: true, message: 'Base de données initialisée.' })
}
