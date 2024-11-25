import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BrainDump - AI-Powered Note Organization',
  description: 'Effortlessly organize your thoughts, tasks, and events with AI. Just type naturally and let BrainDump sort everything for you.',
  keywords: 'AI, notes, tasks, events, organization, productivity',
  authors: [{ name: 'Brian Mathwich' }],
  openGraph: {
    title: 'BrainDump - AI-Powered Note Organization',
    description: 'Effortlessly organize your thoughts, tasks, and events with AI',
    type: 'website',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
