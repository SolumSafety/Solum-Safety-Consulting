import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Archivo } from 'next/font/google'
import './globals.css'
import { CartRoot } from '@/components/cart-root'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Solum Safety Consulting | WHS & OHS Consultants Australia',
  description:
    'Solum Safety Consulting provides expert workplace health and safety services across Australia, including WHS audits, safety management systems, risk assessments, training and incident investigation.',
  generator: 'v0.app',
  metadataBase: new URL('https://www.solumsafetyconsulting.com.au'),
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-dark-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-icon.png',
  },
  keywords: [
    'WHS consultant',
    'OHS consultant',
    'workplace health and safety',
    'safety audits',
    'safety management systems',
    'risk assessment',
    'Australia',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Solum Safety Consulting | WHS & OHS Consultants Australia',
    description:
      'Expert workplace health and safety consulting across Australia. Audits, management systems, risk assessments, training, and incident investigation.',
    url: 'https://www.solumsafetyconsulting.com.au',
    siteName: 'Solum Safety Consulting',
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solum Safety Consulting | WHS & OHS Consultants Australia',
    description:
      'Expert workplace health and safety consulting across Australia. Audits, management systems, risk assessments, templates, and gap analysis.',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#2c3829',
}

const siteUrl = 'https://www.solumsafetyconsulting.com.au'

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService',
      '@id': `${siteUrl}/#organization`,
      name: 'Solum Safety Consulting',
      description:
        'Practical workplace health and safety (WHS) consulting for Australian organisations, including gap analysis, safety management systems and licensed WHS templates.',
      url: siteUrl,
      email: 'info@solumsafetyconsulting.com.au',
      image: `${siteUrl}/opengraph-image`,
      logo: `${siteUrl}/icon.svg`,
      slogan: 'Building Safety from the Ground Up.',
      areaServed: { '@type': 'Country', name: 'Australia' },
      address: { '@type': 'PostalAddress', addressCountry: 'AU' },
      knowsAbout: [
        'Workplace Health and Safety',
        'WHS Gap Analysis',
        'Safety Management Systems',
        'ISO 45001',
        'Risk Assessment',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Solum Safety Consulting',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en-AU',
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-AU" className={`light ${archivo.variable} bg-background`}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <CartRoot>{children}</CartRoot>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
