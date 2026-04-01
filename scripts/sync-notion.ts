import { syncNotionToMarkdown } from '../lib/notion-sync'

async function main() {
  console.log('🔄 Démarrage sync Notion...')
  await syncNotionToMarkdown()
  console.log('✅ Sync terminée')
  process.exit(0)
}

main().catch((err: unknown) => {
  console.error('❌ Erreur sync:', err)
  process.exit(1)
})
