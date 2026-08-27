import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EasyHssab — SaaS Comptable Marocain',
  description: 'Comptabilité, TVA et fiscalité pour PME marocaines.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
