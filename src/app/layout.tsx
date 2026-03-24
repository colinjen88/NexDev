import type { Metadata } from 'next';
import { Noto_Serif_TC, Noto_Sans_TC, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';

const notoSerif = Noto_Serif_TC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-serif-tc',
  display: 'swap',
});

const notoSans = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '學習型知識工作台',
  description: 'Learning Knowledge Workspace',
};

import { AppShellProvider } from '@/components/layout/AppShellProvider';
import { AppShell } from '@/components/layout/AppShell';
import { getGuideSections } from '@/lib/content/guide-loader';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const guideSections = await getGuideSections();
  return (
    <html lang="zh-TW" className={`${notoSerif.variable} ${notoSans.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AppShellProvider>
          <AppShell guideSections={guideSections}>{children}</AppShell>
        </AppShellProvider>
      </body>
    </html>
  );
}
