import fs from 'fs'
import path from 'path'

const KEYWORD_MAP: Record<string, string[]> = {
  'produit|pack|amikeo|tablette|mobilité|confort|prix|ht|ttc|licence|coque|bandoulière|samsung':
    ['produits.md'],
  'mdph|devis|financement|pch|formulaire|dossier|commission':
    ['process_devis_mdph.md', 'faq_emails.md'],
  'commande|paiement|virement|livraison|colissimo|chronopost|david|etiquette|expédition':
    ['process_devis_mdph.md'],
  'sav|garantie|cassée|réparation|retour|défectueux':
    ['process_devis_mdph.md', 'macros_zendesk.md'],
  'cloud|connexion|compte|mot de passe|synchronisation|sync':
    ['cloud_applications.md', 'macros_zendesk.md'],
  'voice|app|application|launcher|gestionnaire|talkback|accessibilité|mise à jour|bug':
    ['macros_zendesk.md', 'cloud_applications.md'],
  'email|réponse|mail|template|macro':
    ['faq_emails.md', 'macros_zendesk.md', 'ligne_editoriale.md'],
  'renouvellement|abonnement|résiliation':
    ['faq_emails.md', 'macros_zendesk.md'],
  'facture|acquittée|cheikh|comptabilité':
    ['faq_emails.md'],
  'ton|style|signature|rédaction|employé|interne':
    ['ligne_editoriale.md'],
}

// Exported for unit testing
export function getMatchedFiles(question: string): string[] {
  const q = question.toLowerCase()
  const matched = new Set<string>(['ligne_editoriale.md'])

  for (const [keywords, files] of Object.entries(KEYWORD_MAP)) {
    if (keywords.split('|').some((kw) => q.includes(kw))) {
      files.forEach((f) => matched.add(f))
    }
  }

  if (matched.size <= 1) {
    matched.add('faq_emails.md')
    matched.add('process_devis_mdph.md')
  }

  return [...matched]
}

export function getRelevantContext(
  question: string,
  knowledgeDir: string = path.join(process.cwd(), 'knowledge'),
): string {
  const files = getMatchedFiles(question)
  let context = ''

  for (const filename of files) {
    const filepath = path.join(knowledgeDir, filename)
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, 'utf-8')
      context += `\n\n=== ${filename} ===\n${content.slice(0, 2000)}`
    }
  }

  return context.trim()
}
