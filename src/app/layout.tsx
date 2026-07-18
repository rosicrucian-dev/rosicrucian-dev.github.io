import type { Metadata } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'

import './globals.css'

// Self-hosted in the static export (no runtime request to Google), exposed
// to Tailwind as the `--font-display` / `--font-sans` theme variables that
// globals.css points the font families at.
const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const description =
  'A community of developers building open source projects for the aquarian age.'

export const metadata: Metadata = {
  metadataBase: new URL('https://rosicrucian.dev'),
  title: 'Rosicrucian Developers',
  description,
  openGraph: {
    title: 'Rosicrucian Developers',
    description,
    url: 'https://rosicrucian.dev',
    siteName: 'Rosicrucian Developers',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  )
}
