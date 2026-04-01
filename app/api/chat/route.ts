import { NextRequest, NextResponse } from 'next/server'
import { getRelevantContext } from '@/lib/retrieval'
import { askClaude, type ChatMessage } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { messages: ChatMessage[] }
    const { messages } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages requis' }, { status: 400 })
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
    const question = lastUserMessage?.content ?? ''

    const context = getRelevantContext(question)
    const filesUsed = context.match(/=== (.+?) ===/g)?.map((m) => m.replace(/=== | ===/g, '')) ?? []

    const text = await askClaude(messages, context)

    return NextResponse.json({ message: text, filesUsed })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
