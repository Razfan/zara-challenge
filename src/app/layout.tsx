import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { CartProvider } from '@/context/CartContext';
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
          <Navbar />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
