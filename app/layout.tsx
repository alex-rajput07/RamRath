import './globals.css';
import React from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'RamRath',
  description: 'Rural mobility platform with zero Google Maps dependency',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 flex flex-col">
        <Header />
        <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
