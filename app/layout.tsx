import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Assistant Auticiel',
  description: 'Assistant interne Auticiel — support produits et process',
  icons: { icon: '/auticiel_logo.jpeg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className={`h-full ${inter.className}`}>{children}</body>
    </html>
  )
}
