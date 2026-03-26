import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '../styles/globals.css';

// Noto Sans TC / Noto Serif TC are defined as CSS variables in globals.css
// using system font stacks to avoid network dependency during Docker builds.
// JetBrains Mono is self-hosted in public/fonts/ to avoid network dependency at build time.

const jetbrainsMono = localFont({
  src: '../../public/fonts/JetBrainsMono.woff2',
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
import { getAiGuideSections } from '@/lib/content/ai-guide-loader';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const guideSections = await getGuideSections();
  const aiGuideSections = await getAiGuideSections();
  return (
    <html lang="zh-TW" className={`${jetbrainsMono.variable}`}>
      <body>
        <AppShellProvider>
          <AppShell guideSections={guideSections} aiGuideSections={aiGuideSections}>{children}</AppShell>
        </AppShellProvider>
      </body>
    </html>
  );
}
