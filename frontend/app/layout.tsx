import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'

export const metadata: Metadata = {
  title: 'FRA DSS - Forest Rights Act Decision Support System',
  description: 'Modern Forest Rights Act decision support system with OCR, GIS mapping, AI detection, blockchain, and DSS capabilities.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}