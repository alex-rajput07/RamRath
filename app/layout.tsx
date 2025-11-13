import './globals.css';
import React from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'RamRath'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="p-4 max-w-4xl mx-auto">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
