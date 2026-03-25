import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';

// Noto Sans TC / Noto Serif TC are defined as CSS variables in globals.css
// using system font stacks to avoid network dependency during Docker builds.

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
    <html lang="zh-TW" className={`${jetbrainsMono.variable}`}>
      <body>
        <AppShellProvider>
          <AppShell guideSections={guideSections}>{children}</AppShell>
        </AppShellProvider>
      </body>
    </html>
  );
}
