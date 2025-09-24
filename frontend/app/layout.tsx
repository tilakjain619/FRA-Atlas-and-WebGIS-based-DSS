import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Land Governance Workflow System',
  description: 'Modern land governance workflow system with OCR, GIS mapping, AI detection, blockchain, and decision support systems.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}