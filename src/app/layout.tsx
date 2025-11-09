import type { Metadata } from 'next';

import { Inter } from 'next/font/google';
import AnimatedCursor from '@/components/AnimatedCursor';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { RootLayoutClient } from '@/components/RootLayoutClient';
import { Analytics } from "@vercel/analytics/next"
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DMS Mehedi - AI-Powered Best Digital Marketer in Bangladesh & Ai-Web Developer ',
  description:
    'DMS Mehedi, an AI-powered developer, digital strategist, AI-Powered Best Digital Marketer in Bangladesh & Ai-Web Developer.',
    
  keywords: [
    'AI Developer',
    'Digital Strategist',
    'Next.js',
    'Firebase',
    'Web Development',
    'Digital Marketing',
  ],
  authors: [{ name: 'DMS Mehedi' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dms-mehedi.vercel.app',
    title: 'DMS Mehedi - AI-Powered Developer & Digital Strategist',
    description:
      'DMS Mehedi, an AI-powered developer, Digital Strategist, and Best Digital Marketer in Bangladesh.',
    siteName: 'DMS Mehedi Digital Marketing Expertise',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f5f7fa" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
  <link rel="icon" href="/logo-dms-mehedi.png" type="image/png" />
      <meta name="google-site-verification" content="j_TnDFzjVMUkRKAqJ1ymzDeuakvCAwg6BrJATuUHTFw" />
        {/* JSON-LD for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'DMS Mehedi',
              url: 'https://dms-mehedi.vercel.app',
              image: 'https://dms-mehedi.vercel.app/og-image.jpg',
              jobTitle: 'AI-Powered Developer & Digital Strategist',
              sameAs: [
                'https://x.com/dms_mehedi',
                'https://www.linkedin.com/in/dms-mehedi-digital-marketing-expert-bangladesh/',
                'https://github.com/mehedi-88',
              ],
            }),
          }}
        />
      </head>
      <RootLayoutClient>
        {children}
        <AnimatedCursor />
      </RootLayoutClient>
    </html>
  );
}
