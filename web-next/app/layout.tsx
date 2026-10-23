import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';
import Providers from '@/components/Providers';
import PwaRegistrar from '@/components/PwaRegistrar';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo';

const manrope = localFont({
  src: './fonts/manrope.woff2',
  weight: '200 800',
  variable: '--font-body',
  display: 'swap',
});

const spaceGrotesk = localFont({
  src: './fonts/space-grotesk.woff2',
  weight: '300 700',
  variable: '--font-display',
  display: 'swap',
});

const sora = localFont({
  src: './fonts/sora.woff2',
  weight: '100 800',
  variable: '--font-sora',
  display: 'swap',
});

const oswald = localFont({
  src: './fonts/oswald.woff2',
  weight: '200 700',
  variable: '--font-oswald',
  display: 'swap',
});

const merriweather = localFont({
  src: './fonts/merriweather-400.woff2',
  weight: '400 700',
  variable: '--font-editorial',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'MH Personal Trainer | Treinos e gestão fitness',
    template: '%s | MH Personal Trainer',
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/icon-192.png'],
    apple: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: 'MH Personal Trainer | Plataforma fitness completa',
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: absoluteUrl('/icon-512.png'),
        width: 512,
        height: 512,
        alt: 'MH Personal Trainer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MH Personal Trainer | Plataforma fitness completa',
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl('/icon-512.png')],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport = {
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-br"
      className={`${manrope.variable} ${spaceGrotesk.variable} ${sora.variable} ${oswald.variable} ${merriweather.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('mh-theme');var theme=(t==='dark'||t==='light')?t:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;}catch(e){}})();`}
        </Script>
        <PwaRegistrar />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
