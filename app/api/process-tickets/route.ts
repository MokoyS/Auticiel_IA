import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildZendeskAuthHeader, sanitizeText, isAssignTicket } from '@/lib/zendesk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ZENDESK_BASE = 'https://auticiel.zendesk.com/api/v2'

interface ZendeskTicket {
  id: number
  subject: string
  description: string
}

export interface TicketResult {
  ticketId: number
  subject: string
  reply: string
  status: 'success' | 'error'
  error?: string
}

async function fetchNewTickets(count: number): Promise<ZendeskTicket[]> {
  const authHeader = buildZendeskAuthHeader(
    process.env.ZENDESK_EMAIL ?? '',
    process.env.ZENDESK_API_TOKEN ?? '',
  )
  const url = `${ZENDESK_BASE}/tickets.json?status=new&sort_by=created_at&sort_order=desc&per_page=${count}`
  const res = await fetch(url, { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Zendesk fetch failed: ${res.status} ${text}`)
  }
  const data = await res.json() as { tickets: ZendeskTicket[] }
  return data.tickets
}

async function generateReply(subject: string, description: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    system: `Tu es l'assistant support d'Auticiel, une startup qui développe des applications pour personnes autistes (suite AMIKEO).
Rédige une réponse email professionnelle, bienveillante et adaptée au public autiste. Sans emoji.
Signature : Nous vous souhaitons une bonne journée, L'équipe Auticiel.`,
    messages: [{
      role: 'user',
      content: `Rédige une réponse pour ce ticket support.\nSujet: ${subject}\nMessage: ${description}`,
    }],
  })
  const block = response.content[0]
  return block.type === 'text' ? block.text : ''
}

async function postInternalNote(ticketId: number, reply: string): Promise<void> {
  const authHeader = buildZendeskAuthHeader(
    process.env.ZENDESK_EMAIL ?? '',
    process.env.ZENDESK_API_TOKEN ?? '',
  )
  const res = await fetch(`${ZENDESK_BASE}/tickets/${ticketId}.json`, {
    method: 'PUT',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticket: {
        comment: {
          body: `Réponse suggérée par Claude:\n\n${reply}`,
          public: false,
        },
      },
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Zendesk note failed: ${res.status} ${text}`)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { count?: number }
    const count = Math.min(10, Math.max(1, Math.floor(body.count ?? 5)))

    const tickets = await fetchNewTickets(count)
    const filtered = tickets.filter((t) => !isAssignTicket(t.subject ?? ''))

    const results: TicketResult[] = await Promise.all(
      filtered.map(async (ticket): Promise<TicketResult> => {
        try {
          const subject = sanitizeText(ticket.subject)
          const description = sanitizeText(ticket.description)
          const reply = await generateReply(subject, description)
          await postInternalNote(ticket.id, reply)
          return { ticketId: ticket.id, subject, reply, status: 'success' }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Erreur inconnue'
          return {
            ticketId: ticket.id,
            subject: sanitizeText(ticket.subject),
            reply: '',
            status: 'error',
            error: message,
          }
        }
      }),
    )

    return NextResponse.json({ results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
