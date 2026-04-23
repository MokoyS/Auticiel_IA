import { kv } from '@vercel/kv'

export type ClientType = 'B2C' | 'B2B' | 'Les deux'
export type Frequency = 'Très fréquent' | 'Fréquent' | 'Occasionnel'
export type Priority = 'Coeur métier' | 'Secondaire' | 'Rare'

export interface Template {
  id: string
  title: string
  category: string
  keywords: string[]
  client_type: ClientType
  frequency: Frequency
  action_required: boolean
  template: string
  notes: string
}

export interface Product {
  id: string
  name: string
  code: string
  category: string
  price_ht: number
  price_ttc: number
  tva: number
  mdph_eligible: boolean
  description: string
  notes: string
  priority: Priority
}

export interface Process {
  id: string
  title: string
  trigger: string
  steps: string[]
  notes: string
}

export interface Editorial {
  tone: string
  signature: string
  structure: string[]
  rules_never: string[]
  faq_tech: string
  team: { name: string; role: string }[]
  resources: { label: string; url: string }[]
}

export async function getTemplates(): Promise<Template[]> {
  return (await kv.get<Template[]>('templates')) ?? []
}

export async function setTemplates(data: Template[]): Promise<void> {
  await kv.set('templates', data)
}

export async function getProducts(): Promise<Product[]> {
  return (await kv.get<Product[]>('products')) ?? []
}

export async function setProducts(data: Product[]): Promise<void> {
  await kv.set('products', data)
}

export async function getProcesses(): Promise<Process[]> {
  return (await kv.get<Process[]>('processes')) ?? []
}

export async function setProcesses(data: Process[]): Promise<void> {
  await kv.set('processes', data)
}

export async function getEditorial(): Promise<Editorial | null> {
  return kv.get<Editorial>('editorial')
}

export async function setEditorial(data: Editorial): Promise<void> {
  await kv.set('editorial', data)
}
