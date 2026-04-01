import { NextRequest, NextResponse } from 'next/server'
import { syncNotionToMarkdown } from '@/lib/notion-sync'

export async function POST(req: NextRequest) {
  const body = await req.json() as { secret?: string }

  if (body.secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await syncNotionToMarkdown()
    return NextResponse.json({ success: true, message: 'Sync Notion terminée' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
