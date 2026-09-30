import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { LoadingBar } from '@/components/layout/LoadingBar';
import { Navbar } from '@/components/layout/Navbar';
import { CartProvider } from '@/context/CartContext';
import { NavigationProgressProvider } from '@/context/NavigationProgressContext';
import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: 'MBST',
  description: 'Mobile phone catalogue',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <NavigationProgressProvider>
            <Navbar />
            <LoadingBar />
            <main>{children}</main>
          </NavigationProgressProvider>
        </CartProvider>
      </body>
    </html>
  );
}
