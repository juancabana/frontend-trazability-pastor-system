import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { APP_METADATA } from '@/constants/app';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: APP_METADATA.TITLE_DEFAULT,
    template: APP_METADATA.TITLE_TEMPLATE,
  },
  description: APP_METADATA.DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-gray-50`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
