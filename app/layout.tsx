// RootLayout.tsx
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = (await cookies()).get('theme');

  return (
    <html lang="en" className={theme?.value === 'dark' ? 'dark' : ''}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased
  bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100
  transition-colors duration-200`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
