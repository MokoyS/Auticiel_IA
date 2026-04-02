import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    let subject = ''
    let description = ''

    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const rawText = await req.text()
      console.error('RAW BODY:', rawText)
      const cleanText = rawText
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
      const body = JSON.parse(cleanText)
      subject = body.subject || ''
      description = body.description || ''
    } else {
      const formData = await req.formData()
      subject = formData.get('subject')?.toString() || ''
      description = formData.get('description')?.toString() || ''
    }

    const cleanSubject = subject.replace(/[\r\n\t]/g, ' ').trim()
    const cleanDescription = description.replace(/[\r\n\t]/g, ' ').trim()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'Tu es l assistant support d Auticiel. Redige une reponse email professionnelle en francais, sans emoji. Signature : Nous vous souhaitons une bonne journee, L equipe Auticiel.',
      messages: [{
        role: 'user',
        content: `Redige une reponse pour ce ticket. Sujet: ${cleanSubject}. Message: ${cleanDescription}`
      }]
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ reply })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
