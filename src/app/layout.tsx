import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: 'MBST',
  description: 'Mobile phone catalogue',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
