import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Archivo } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { CartRoot } from '@/components/cart-root'

const GOOGLE_ADS_TAG_ID = 'AW-18380861171'

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
  verification: {
    google: 'google3d07fcfaa24182ff',
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
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PKMK886J"
            height="0"
            width="0"
            title="Google Tag Manager"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PKMK886J');
          `}
        </Script>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_TAG_ID}`} strategy="afterInteractive" />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_TAG_ID}');
          `}
        </Script>
        <Script id="apollo-website-tracker" strategy="afterInteractive">
          {`
            (function initApollo() {
              // Keep one tracker per document, including client-side navigation.
              if (window.__solumApolloTrackerRequested || document.getElementById('apollo-tracker-sdk')) return;
              window.__solumApolloTrackerRequested = true;

              try {
                var nonce = Math.random().toString(36).substring(7);
                var script = document.createElement('script');
                script.id = 'apollo-tracker-sdk';
                script.src = 'https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=' + nonce;
                script.async = true;
                script.defer = true;
                script.onload = function () {
                  try {
                    if (window.trackingFunctions && typeof window.trackingFunctions.onLoad === 'function') {
                      window.trackingFunctions.onLoad({ appId: '6aeba946f9572f001c0585a9' });
                    }
                  } catch (error) {
                    console.warn('Apollo website tracker could not initialise.', error);
                  }
                };
                script.onerror = function () {
                  console.warn('Apollo website tracker could not be loaded.');
                };
                document.head.appendChild(script);
              } catch (error) {
                console.warn('Apollo website tracker is unavailable.', error);
              }
            })();
          `}
        </Script>
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
