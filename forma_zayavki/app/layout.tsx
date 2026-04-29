import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['cyrillic', 'latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Записаться на консультацию | Екатерина Яхонтова — Аутсорс-CFO',
  description:
    'Заполните анкету — и мы свяжемся с вами в течение 24 часов, чтобы назначить бесплатную консультацию по финансовому управлению бизнесом.',
  openGraph: {
    title: 'Консультация по финансам бизнеса',
    description: 'Аутсорс-CFO Екатерина Яхонтова — бесплатная первичная консультация',
    locale: 'ru_RU',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
