import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ship-toolkit | AI-Native Deployment Automation for Claude Code',
  description: 'Ship 10x faster with automated assets, SEO, performance optimization, and deployment. Built for Claude Code users. 3-4 hours → 3-5 minutes.',
  keywords: ['deployment', 'automation', 'claude code', 'seo', 'performance', 'lighthouse', 'vercel', 'netlify'],
  authors: [{ name: 'René DeAnda', url: 'https://renedeanda.com' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'ship-toolkit | Ship 10x Faster with Claude Code',
    description: 'Automate your web deployment workflow. Assets, SEO, performance, and deployment in one command.',
    type: 'website',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'ship-toolkit - AI-Native Deployment Automation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ship-toolkit | Ship 10x Faster with Claude Code',
    description: 'Automate your web deployment workflow. 3-4 hours → 3-5 minutes.',
    images: ['/og-image.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="scanlines crt-effect">{children}</body>
    </html>
  )
}
