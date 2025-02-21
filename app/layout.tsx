// RootLayout.tsx
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Providers } from './providers';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ClientMaintenanceBanner from '@/components/layout/ClientMaintenanceBanner';
import { Analytics } from '@vercel/analytics/next';
import { dehydrate, QueryClient } from '@tanstack/react-query';

// Import Swiper's CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ToastContainer from '@/components/Toast/ToastContainer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://freesize.vercel.app'),
  title: {
    default: 'AI Image Processing Tools for LORA Training',
    template: '%s | FreeSizeAI',
  },
  description:
    'Free AI-powered image preprocessing tools optimized for LORA training dataset preparation',
  keywords:
    'LORA training, AI image processing, image dataset preparation, upscaling for LORA, image uncropping, square conversion, LORA model training, AI fine-tuning',
  openGraph: {
    siteName: 'FreeSizeAI',
    type: 'website',
    url: 'https://freesize.vercel.app',
    title:
      'AI Image Processing Tools for LORA Training | Free Upscale, Uncrop & Square',
    description:
      'Prepare your LORA training dataset with our free AI tools. Upscale images for better quality, uncrop for composition, and convert to squares for consistent training. Perfect for preparing 20-50 images for LORA model training.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Image Processing Tools for LORA Training',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Image Processing for LORA Training',
    description:
      'Process your LORA training images with AI technology. Perfect for preparing 20-50 image datasets - completely free.',
    images: ['https://freesize.vercel.app/og-image.png'], // 절대 URL 사용
  },
  alternates: {
    canonical: 'https://freesize.vercel.app',
  },
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeFromCookie = (await cookies()).get('theme');
  const theme = themeFromCookie?.value || 'dark';

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/admin/maintenance');
      if (!res.ok) return null;
      return res.json();
    },
  });

  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased 
        bg-gray-100 dark:bg-[#141414] text-gray-900 dark:text-gray-100
        transition-colors duration-200`}
      >
        <Providers dehydratedState={dehydrate(queryClient)}>
          <div className="flex flex-col min-h-screen">
            <Navbar className="fixed top-0 left-0 right-0 z-[9999]" />
            <div className="fixed top-16  z-[9999] w-full ">
              <ClientMaintenanceBanner />
            </div>
            <main className="flex-grow pb-16 mt-16">
              {' '}
              <div className="container mx-auto">
                {children}
                <ToastContainer />
                <Analytics />
                <SpeedInsights />
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
