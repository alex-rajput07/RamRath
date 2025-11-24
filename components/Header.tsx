'use client';

import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-all">
              🚗
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg leading-tight">Ram Rath</div>
              <div className="text-xs text-gray-500 font-medium">राम रथ</div>
            </div>
          </Link>
        </motion.div>

        {/* Nav Links */}
        <nav className="flex items-center gap-2 sm:gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="hidden sm:flex items-center gap-1"
          >
            {[
              { href: '/direct-book', label: 'Book' },
              { href: '/post-ride', label: 'Post' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                {link.label}
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="h-6 w-px bg-gray-200/50 hidden sm:block"
          />

          {[
            { href: '/login', label: 'Login' },
            { href: '/driver/dashboard', label: 'Driver' },
            { href: '/admin/panel', label: 'Admin' },
          ].map((link) => (
            <motion.div key={link.href} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Link
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>
      </div>
    </header>
  );
}
