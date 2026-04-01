import { extractText, extractPropertyText } from '@/lib/notion-sync'

describe('extractText', () => {
  it('converts heading_1 block to markdown h1', () => {
    const block = {
      type: 'heading_1',
      heading_1: { rich_text: [{ plain_text: 'Mon titre' }] },
    }
    expect(extractText(block)).toBe('# Mon titre')
  })

  it('converts heading_2 block to markdown h2', () => {
    const block = {
      type: 'heading_2',
      heading_2: { rich_text: [{ plain_text: 'Sous-titre' }] },
    }
    expect(extractText(block)).toBe('## Sous-titre')
  })

  it('converts bulleted_list_item to markdown list', () => {
    const block = {
      type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ plain_text: 'Point 1' }] },
    }
    expect(extractText(block)).toBe('- Point 1')
  })

  it('returns paragraph text as-is', () => {
    const block = {
      type: 'paragraph',
      paragraph: { rich_text: [{ plain_text: 'Du texte normal' }] },
    }
    expect(extractText(block)).toBe('Du texte normal')
  })

  it('returns empty string for unknown block type', () => {
    const block = { type: 'unsupported', unsupported: {} }
    expect(extractText(block)).toBe('')
  })

  it('returns empty string when rich_text is missing', () => {
    const block = { type: 'paragraph', paragraph: {} }
    expect(extractText(block)).toBe('')
  })
})

describe('extractPropertyText', () => {
  it('extracts rich_text property', () => {
    const prop = {
      type: 'rich_text',
      rich_text: [{ plain_text: 'Hello' }, { plain_text: ' world' }],
    }
    expect(extractPropertyText(prop)).toBe('Hello world')
  })

  it('extracts select property name', () => {
    const prop = { type: 'select', select: { name: 'Option A' } }
    expect(extractPropertyText(prop)).toBe('Option A')
  })

  it('converts checkbox true to Oui', () => {
    const prop = { type: 'checkbox', checkbox: true }
    expect(extractPropertyText(prop)).toBe('Oui')
  })

  it('converts checkbox false to Non', () => {
    const prop = { type: 'checkbox', checkbox: false }
    expect(extractPropertyText(prop)).toBe('Non')
  })

  it('returns empty string for null prop', () => {
    expect(extractPropertyText(null)).toBe('')
  })

  it('returns empty string for unknown prop type', () => {
    const prop = { type: 'formula', formula: {} }
    expect(extractPropertyText(prop)).toBe('')
  })
})
