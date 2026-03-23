import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ARORA.SYS — Utsav Arora Portfolio',
  description:
    'Utsav Arora — CS @ Purdue, Machine Intelligence. ' +
    'A real terminal portfolio. Type help to get started.',
  keywords: ['Utsav Arora', 'portfolio', 'Purdue', 'CS', 'ML', 'AI', 'engineer'],
  authors: [{ name: 'Utsav Arora' }],
  openGraph: {
    title: 'ARORA.SYS — Utsav Arora Portfolio',
    description: 'A real terminal. A real portfolio. Type help.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ARORA.SYS — Utsav Arora Portfolio',
    description: 'A real terminal. A real portfolio. Type help.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ height: '100%', margin: 0, padding: 0, overflow: 'hidden', background: '#060401' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#060401" />
      </head>
      <body style={{ background: '#060401', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
