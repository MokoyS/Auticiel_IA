import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getTemplates, getProducts, getProcesses, getEditorial } from '@/lib/kv'
import type { Template } from '@/lib/kv'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

function matchTemplates(text: string, templates: Template[]): Template[] {
  const q = text.toLowerCase()
  const scored = templates.map(t => {
    const hits = t.keywords.filter(kw => q.includes(kw.toLowerCase())).length
    return { template: t, score: hits }
  })
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.template)
}

function buildSystemPrompt(
  editorial: Awaited<ReturnType<typeof getEditorial>>,
  matchedTemplates: Template[],
  products: Awaited<ReturnType<typeof getProducts>>,
  processes: Awaited<ReturnType<typeof getProcesses>>,
): string {
  const ed = editorial

  const coreProducts = products.filter(p => p.priority === 'Coeur métier')

  let prompt = `Tu es chargé du support client chez Auticiel, une startup qui développe des applications pour personnes en situation de handicap cognitif (suite AMIKEO : tablette préconfigurée + logiciel AMIKEOAPPS avec 10 apps adaptées).

Tu rédiges UNIQUEMENT le corps de l'email de réponse — sans objet, sans en-tête, sans commentaire. Texte brut directement exploitable.

═══════════════════════════════════════
TON ET STYLE
═══════════════════════════════════════
${ed?.tone ?? 'Professionnel, bienveillant, direct. Empathique avec les familles.'}

═══════════════════════════════════════
STRUCTURE OBLIGATOIRE
═══════════════════════════════════════
${ed?.structure.map((s, i) => `${i + 1}. ${s}`).join('\n') ?? ''}

═══════════════════════════════════════
SIGNATURE À UTILISER
═══════════════════════════════════════
${ed?.signature ?? 'Nous vous souhaitons une bonne journée,\nL\'équipe Auticiel.'}

═══════════════════════════════════════
RÈGLES ABSOLUES — NE JAMAIS FAIRE
═══════════════════════════════════════
${ed?.rules_never.map(r => `- ${r}`).join('\n') ?? ''}

═══════════════════════════════════════
FORMAT
═══════════════════════════════════════
- Texte brut UNIQUEMENT. Zéro markdown, zéro gras, zéro astérisques, zéro tirets markdown.
- Sauts de ligne entre chaque bloc (salutation, corps, signature).
- Maximum 8 lignes hors procédure. Si une procédure dépasse 5 étapes, synthétise-la.
- Variables à remplacer : [Prénom], [nom bénéficiaire], [référence commande], [date si mentionnée].
`

  if (matchedTemplates.length > 0) {
    prompt += `
═══════════════════════════════════════
RÉPONSES TYPE PERTINENTES
═══════════════════════════════════════
Ces templates correspondent à la demande du client. Utilise-les comme base, adapte au contexte exact du ticket.

`
    matchedTemplates.forEach((t, i) => {
      prompt += `--- Template ${i + 1} : ${t.title} (${t.category}) ---
Corps du mail :
${t.template}

Notes internes (ne pas mentionner dans la réponse) :
${t.notes}

`
    })
  }

  if (coreProducts.length > 0) {
    prompt += `═══════════════════════════════════════
PRODUITS PRINCIPAUX (prix à utiliser si mentionnés)
═══════════════════════════════════════
`
    coreProducts.forEach(p => {
      prompt += `- ${p.name} : ${p.price_ht} € HT / ${p.price_ttc} € TTC (TVA ${p.tva}%)${p.mdph_eligible ? ' — Finançable MDPH' : ''}\n`
      if (p.notes) prompt += `  Note : ${p.notes}\n`
    })
    prompt += '\n'
  }

  if (processes.length > 0) {
    prompt += `═══════════════════════════════════════
PROCESS INTERNES (référence si besoin)
═══════════════════════════════════════
`
    processes.slice(0, 4).forEach(p => {
      prompt += `${p.title} : ${p.steps.slice(0, 3).join(' → ')}${p.steps.length > 3 ? ' → …' : ''}\n`
    })
    prompt += '\n'
  }

  if (ed?.faq_tech) {
    prompt += `═══════════════════════════════════════
FAQ TECHNIQUE RAPIDE
═══════════════════════════════════════
${ed.faq_tech}
`
  }

  return prompt
}

export async function POST(req: NextRequest) {
  try {
    let description = ''

    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const rawText = await req.text()
      const cleanText = rawText
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
      const body = JSON.parse(cleanText)
      description = body.description || body.subject || ''
    } else {
      const formData = await req.formData()
      description = formData.get('description')?.toString() || formData.get('subject')?.toString() || ''
    }

    const cleanDescription = description.replace(/[\r\n\t]/g, ' ').trim()

    const [templates, products, processes, editorial] = await Promise.all([
      getTemplates(),
      getProducts(),
      getProcesses(),
      getEditorial(),
    ])

    const matched = matchTemplates(cleanDescription, templates)
    const systemPrompt = buildSystemPrompt(editorial, matched, products, processes)

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Voici le message du client (ticket Zendesk) :\n\n${cleanDescription}`,
      }],
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ reply }, { headers: CORS_HEADERS })

  } catch (error: any) {
    console.error('generate-reply error:', error)
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS_HEADERS })
  }
}
