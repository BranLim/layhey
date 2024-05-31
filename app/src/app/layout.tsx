import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/app/providers';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Box } from '@chakra-ui/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Layhey',
  description:
    'A simple-to-use budgeting app that focuses on how your money flows',
};

export default function RootLayout({
  modal,
  children,
}: Readonly<{
  modal: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <Providers>
          <Box height='100vh' overflow='hidden'>
            <Header />
            <div>{modal}</div>
            {children}
            <Footer />
          </Box>
        </Providers>
      </body>
    </html>
  );
}
