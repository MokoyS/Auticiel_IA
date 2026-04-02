import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const SYSTEM_PROMPT_TEMPLATE = `Tu es l'assistant interne d'Auticiel, une startup qui développe des applications pour personnes handicapées (suite AMIKEO).

Tu assistes UNIQUEMENT les employés d'Auticiel — pas les clients. Tu réponds en français, de façon directe et professionnelle.

Tes rôles :
- Répondre aux questions sur les produits, prix, process internes
- Aider à rédiger des réponses emails aux clients (en respectant la ligne éditoriale Auticiel)
- Expliquer les process : devis MDPH, commandes, SAV, livraisons, cloud
- Donner les bonnes procédures techniques pour le support

Règles importantes :
- Tu utilises UNIQUEMENT les informations de la base de connaissance fournie
- Si tu ne sais pas, tu dis "Je ne trouve pas cette information dans la base — vérifie dans Notion ou demande à l'équipe"
- Tu ne réponds jamais directement à un client — tu aides les employés à formuler des réponses
- Ton ton est direct, concis, professionnel

Base de connaissance disponible :
{CONTEXT}`

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function askClaude(
  messages: ChatMessage[],
  context: string,
): Promise<string> {
  const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{CONTEXT}', context)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  })

  const block = response.content[0]
  return block.type === 'text' ? block.text : ''
}
