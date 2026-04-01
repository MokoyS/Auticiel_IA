import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Assistant Auticiel',
  description: 'Assistant interne Auticiel — support produits et process',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
