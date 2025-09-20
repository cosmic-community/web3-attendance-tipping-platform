import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import CosmicBadge from '@/components/CosmicBadge'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Web3 Attendance & Tipping Platform',
  description: 'A comprehensive Web3 application for managing attendance sessions and facilitating ETH tipping through MetaMask integration.',
  keywords: ['Web3', 'Ethereum', 'MetaMask', 'Attendance', 'Tipping', 'Blockchain', 'DApp'],
  authors: [{ name: 'Web3 Platform Team' }],
  openGraph: {
    title: 'Web3 Attendance & Tipping Platform',
    description: 'Manage attendance sessions and send ETH tips with MetaMask integration',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Access environment variable on server side
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG as string

  return (
    <html lang="en">
      <head>
        {/* Console capture script for dashboard debugging */}
        <script src="/dashboard-console-capture.js" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
          {/* Pass bucket slug as prop to client component */}
          <CosmicBadge bucketSlug={bucketSlug} />
        </div>
      </body>
    </html>
  )
}