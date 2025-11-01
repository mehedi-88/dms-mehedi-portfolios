import type { Metadata } from 'next';

import { Inter } from 'next/font/google';
import AnimatedCursor from '@/components/AnimatedCursor';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { RootLayoutClient } from '@/components/RootLayoutClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DMS Mehedi - AI-Powered Developer & Digital Strategist',
  description:
    'Portfolio of DMS Mehedi, an AI-powered developer, digital strategist, and creator specializing in Next.js, Firebase, and AI integration.',
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
    url: 'https://dms-mehedi.com',
    title: 'DMS Mehedi - AI-Powered Developer & Digital Strategist',
    description:
      'Portfolio of DMS Mehedi, an AI-powered developer, digital strategist, and creator.',
    siteName: 'DMS Mehedi Portfolio',
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
        <link rel="icon" href="/favicon.ico" />
        {/* JSON-LD for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'DMS Mehedi',
              url: 'https://dms-mehedi.com',
              image: 'https://dms-mehedi.com/og-image.jpg',
              jobTitle: 'AI-Powered Developer & Digital Strategist',
              sameAs: [
                'https://twitter.com/dmsmehedi',
                'https://linkedin.com/in/dmsmehedi',
                'https://github.com/dmsmehedi',
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
