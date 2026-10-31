import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0F17' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'REWOIX — The Corporate Experience Simulator',
    template: '%s | REWOIX',
  },
  description:
    'Stop learning projects. Start experiencing work. Master real-world Data Analytics, Business Intelligence, and AI/ML through simulated enterprise workplaces, messy schemas, and stakeholder pushback.',
  keywords: [
    'Corporate Experience Simulator',
    'Data Analytics Simulation',
    'Business Intelligence Projects',
    'Enterprise SQL Sandbox',
    'dbt and Snowflake Portfolio',
    'AI/ML Career Switcher',
    'Verifiable Certificates',
  ],
  authors: [{ name: 'REWOIX Team' }],
  creator: 'REWOIX Inc.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rewoix.com',
    title: 'REWOIX — The Corporate Experience Simulator',
    description:
      'Real-world projects. Real business problems. Real industry thinking. The active workplace simulator for Data Analytics & AI.',
    siteName: 'REWOIX',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'REWOIX — The Corporate Experience Simulator',
    description:
      'Stop learning projects. Start experiencing work. Master enterprise Data Analytics & AI with real production scenarios.',
    creator: '@rewoix',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-400 transition-colors duration-300">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
