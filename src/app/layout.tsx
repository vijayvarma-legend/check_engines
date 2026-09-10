import type { Metadata, Viewport } from 'next';
import { Sora, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sans = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Check Engines — Precision. Performance. Protection.',
  description:
    'Complete automotive care, diagnostics and detailing in Hyderabad. An interactive 3D demo experience for Check Engines.',
  applicationName: 'Check Engines',
  openGraph: {
    title: 'Check Engines — Precision. Performance. Protection.',
    description:
      'Complete automotive care, diagnostics and detailing in Hyderabad.',
    type: 'website',
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#08090b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
