import { Client } from '@notionhq/client'
import fs from 'fs'
import path from 'path'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

// Exported for unit testing
export function extractText(block: Record<string, unknown>): string {
  const type = block.type as string
  const content = block[type] as Record<string, unknown> | undefined
  if (!content) return ''
  const richText = content.rich_text as Array<{ plain_text: string }> | undefined
  const text = richText?.map((t) => t.plain_text).join('') ?? ''
  switch (type) {
    case 'heading_1': return `# ${text}`
    case 'heading_2': return `## ${text}`
    case 'heading_3': return `### ${text}`
    case 'bulleted_list_item': return `- ${text}`
    case 'numbered_list_item': return `1. ${text}`
    case 'paragraph': return text
    case 'code': return `\`\`\`\n${text}\n\`\`\``
    default: return text
  }
}

// Exported for unit testing
export function extractPropertyText(prop: Record<string, unknown> | null): string {
  if (!prop) return ''
  switch (prop.type as string) {
    case 'rich_text': {
      const rt = prop.rich_text as Array<{ plain_text: string }> | undefined
      return rt?.map((t) => t.plain_text).join('') ?? ''
    }
    case 'select': {
      const sel = prop.select as { name?: string } | null
      return sel?.name ?? ''
    }
    case 'checkbox':
      return (prop.checkbox as boolean) ? 'Oui' : 'Non'
    case 'number':
      return (prop.number as number | null)?.toString() ?? ''
    default:
      return ''
  }
}

async function fetchPageContent(pageId: string): Promise<string> {
  const blocks = await notion.blocks.children.list({ block_id: pageId, page_size: 100 })
  let content = ''
  for (const block of blocks.results) {
    content += extractText(block as Record<string, unknown>) + '\n'
  }
  return content
}

async function fetchDatabaseContent(databaseId: string): Promise<string> {
  const response = await notion.databases.query({ database_id: databaseId, page_size: 100 })
  let content = ''
  for (const page of response.results) {
    const props = (page as Record<string, unknown> & { properties: Record<string, unknown> }).properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Notion SDK returns untyped property values
    const titleProp = props['Nom produit'] ?? props['Question / Sujet']
    const titleVal = titleProp as any
    const title: string = titleVal?.title?.[0]?.plain_text ?? 'Sans titre'
    content += `## ${title}\n`
    for (const [key, val] of Object.entries(props)) {
      const text = extractPropertyText(val as Record<string, unknown>)
      if (text) content += `**${key}** : ${text}\n`
    }
    content += '\n'
  }
  return content
}

export async function syncNotionToMarkdown(): Promise<void> {
  const knowledgeDir = path.join(process.cwd(), 'knowledge')
  if (!fs.existsSync(knowledgeDir)) fs.mkdirSync(knowledgeDir)

  const pages = [
    { file: 'process_devis_mdph.md', id: '3342ec2d-8476-8182-880d-f7bf8b7142f0' },
    { file: 'ligne_editoriale.md',   id: '3342ec2d-8476-81b6-97cc-ef16496f9fb7' },
    { file: 'macros_zendesk.md',     id: '3342ec2d-8476-810d-a025-c5544b58127a' },
  ]

  const databases = [
    { file: 'produits.md',   id: 'd4b19e9dbf3441349e74fc33fe5d285c' },
    { file: 'faq_emails.md', id: 'cc1d5e13dd9f44d09df9dfdce7a4db16' },
  ]

  for (const p of pages) {
    try {
      const content = await fetchPageContent(p.id)
      fs.writeFileSync(path.join(knowledgeDir, p.file), content, 'utf-8')
      console.log(`✅ Synced ${p.file}`)
    } catch (err) {
      console.error(`❌ Failed to sync ${p.file}:`, err)
    }
  }

  for (const db of databases) {
    try {
      const content = await fetchDatabaseContent(db.id)
      fs.writeFileSync(path.join(knowledgeDir, db.file), content, 'utf-8')
      console.log(`✅ Synced ${db.file}`)
    } catch (err) {
      console.error(`❌ Failed to sync ${db.file}:`, err)
    }
  }

  fs.writeFileSync(path.join(knowledgeDir, '_last_sync.txt'), new Date().toISOString(), 'utf-8')
  console.log('🔄 Sync Notion terminée')
}
