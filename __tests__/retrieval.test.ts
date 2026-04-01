import path from 'path'
import fs from 'fs'
import { getRelevantContext, getMatchedFiles } from '@/lib/retrieval'

const FAKE_KNOWLEDGE_DIR = path.join(__dirname, 'fixtures', 'knowledge')

beforeAll(() => {
  fs.mkdirSync(FAKE_KNOWLEDGE_DIR, { recursive: true })
  fs.writeFileSync(path.join(FAKE_KNOWLEDGE_DIR, 'produits.md'), 'Contenu produits AMIKEO', 'utf-8')
  fs.writeFileSync(path.join(FAKE_KNOWLEDGE_DIR, 'faq_emails.md'), 'Contenu FAQ emails', 'utf-8')
  fs.writeFileSync(path.join(FAKE_KNOWLEDGE_DIR, 'ligne_editoriale.md'), 'Ton Auticiel', 'utf-8')
  fs.writeFileSync(path.join(FAKE_KNOWLEDGE_DIR, 'process_devis_mdph.md'), 'Process MDPH', 'utf-8')
  fs.writeFileSync(path.join(FAKE_KNOWLEDGE_DIR, 'macros_zendesk.md'), 'Macros Zendesk', 'utf-8')
})

afterAll(() => {
  fs.rmSync(path.join(__dirname, 'fixtures'), { recursive: true, force: true })
})

describe('getMatchedFiles', () => {
  it('always includes ligne_editoriale.md', () => {
    const files = getMatchedFiles('foo bar baz')
    expect(files).toContain('ligne_editoriale.md')
  })

  it('matches produits.md for "prix" keyword', () => {
    const files = getMatchedFiles('quel est le prix du Pack Mobilité')
    expect(files).toContain('produits.md')
  })

  it('matches process_devis_mdph.md for "mdph" keyword', () => {
    const files = getMatchedFiles('comment traiter un devis mdph')
    expect(files).toContain('process_devis_mdph.md')
  })

  it('matches macros_zendesk.md for "email" keyword', () => {
    const files = getMatchedFiles("rédige une réponse email pour un client")
    expect(files).toContain('macros_zendesk.md')
  })

  it('falls back to faq_emails.md and process_devis_mdph.md for unknown question', () => {
    const files = getMatchedFiles('quelque chose de totalement inconnu xyzxyz')
    expect(files).toContain('faq_emails.md')
    expect(files).toContain('process_devis_mdph.md')
  })

  it('returns no duplicates', () => {
    const files = getMatchedFiles('prix tablette mdph commande')
    const unique = [...new Set(files)]
    expect(files.length).toBe(unique.length)
  })
})

describe('getRelevantContext', () => {
  it('returns a non-empty string', () => {
    const ctx = getRelevantContext('prix tablette', FAKE_KNOWLEDGE_DIR)
    expect(typeof ctx).toBe('string')
    expect(ctx.length).toBeGreaterThan(0)
  })

  it('includes file section headers', () => {
    const ctx = getRelevantContext('prix tablette', FAKE_KNOWLEDGE_DIR)
    expect(ctx).toMatch(/=== .+ ===/)
  })

  it('limits each file to 2000 characters', () => {
    const bigContent = 'x'.repeat(5000)
    fs.writeFileSync(path.join(FAKE_KNOWLEDGE_DIR, 'ligne_editoriale.md'), bigContent, 'utf-8')
    const ctx = getRelevantContext('quelque chose', FAKE_KNOWLEDGE_DIR)
    const sections = ctx.split(/=== .+ ===/)
    for (const section of sections.slice(1)) {
      expect(section.trim().length).toBeLessThanOrEqual(2000 + 5)
    }
    fs.writeFileSync(path.join(FAKE_KNOWLEDGE_DIR, 'ligne_editoriale.md'), 'Ton Auticiel', 'utf-8')
  })
})
