import type { Metadata } from 'next';
import { Caveat, Permanent_Marker, Inter } from 'next/font/google';
import './globals.css';

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
});

const permanentMarker = Permanent_Marker({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-permanent-marker',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ToastOps - Notifications with Personality',
  description: 'A platform to build custom, AI-generated toasts for your company site.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${caveat.variable} ${permanentMarker.variable} ${inter.variable}`}>
      <body className="font-inter bg-[#fdfbf7] text-gray-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
