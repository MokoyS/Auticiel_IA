import { buildZendeskAuthHeader, sanitizeText, isAssignTicket } from '@/lib/zendesk'

describe('buildZendeskAuthHeader', () => {
  it('returns Basic base64(email/token:apiToken)', () => {
    const header = buildZendeskAuthHeader('user@test.com', 'mytoken')
    const expected = 'Basic ' + Buffer.from('user@test.com/token:mytoken').toString('base64')
    expect(header).toBe(expected)
  })
})

describe('sanitizeText', () => {
  it('removes control characters', () => {
    expect(sanitizeText('hello\x00world')).toBe('hello world')
    expect(sanitizeText('hello\x1Fworld')).toBe('hello world')
    expect(sanitizeText('hello\x7Fworld')).toBe('hello world')
  })

  it('replaces newlines and tabs with spaces', () => {
    expect(sanitizeText('line1\nline2')).toBe('line1 line2')
    expect(sanitizeText('col1\tcol2')).toBe('col1 col2')
  })

  it('returns empty string for null/undefined', () => {
    expect(sanitizeText(null)).toBe('')
    expect(sanitizeText(undefined)).toBe('')
  })

  it('trims result', () => {
    expect(sanitizeText('  hello  ')).toBe('hello')
  })
})

describe('isAssignTicket', () => {
  it('returns true when subject contains "assign" (case-insensitive)', () => {
    expect(isAssignTicket('Assign to team')).toBe(true)
    expect(isAssignTicket('ASSIGNMENT needed')).toBe(true)
    expect(isAssignTicket('please assign')).toBe(true)
  })

  it('returns false when subject does not contain "assign"', () => {
    expect(isAssignTicket('Broken tablet')).toBe(false)
    expect(isAssignTicket('')).toBe(false)
  })
})
