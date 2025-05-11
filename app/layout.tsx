import './globals.css';
import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import { ThemeProviderWrapper } from '@/components/theme-provider-wrapper';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { AirQualityProvider } from '@/context/AirQualityContext';

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif']
});

export const metadata: Metadata = {
  title: 'Air Quality Monitoring System',
  description: 'Real-time air quality monitoring and analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={ibmPlexSans.className}>
        <ThemeProviderWrapper>
          <AirQualityProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main>{children}</main>
            </div>
            <Toaster />
          </AirQualityProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}