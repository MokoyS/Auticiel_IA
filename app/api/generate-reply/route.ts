import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { subject, description } = await req.json()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'Tu es l assistant support d Auticiel. Redige une reponse email professionnelle en francais, sans emoji. Signature : Nous vous souhaitons une bonne journee, L equipe Auticiel.',
      messages: [{
        role: 'user',
        content: `Redige une reponse pour ce ticket. Sujet: ${subject}. Message: ${description}`
      }]
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ reply })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
