export function buildZendeskAuthHeader(email: string, apiToken: string): string {
  const credentials = Buffer.from(`${email}/token:${apiToken}`).toString('base64')
  return `Basic ${credentials}`
}

export function sanitizeText(value: string | null | undefined): string {
  if (value == null) return ''
  return value
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isAssignTicket(subject: string): boolean {
  return /assign/i.test(subject)
}
