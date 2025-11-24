'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-16 border-t border-gray-200/50 bg-gradient-to-b from-white to-gray-50/50 py-8 px-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </a>
            <a href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
              Login
            </a>
            <a href="mailto:contact@ramrath.local" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </a>
          </div>

          {/* Branding */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">Made with ❤️ by</span>
            <div className="flex items-center gap-1 bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-200">
              <span className="font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">AJ</span>
              <img 
                src="/assets/badge.png" 
                alt="Made by AJ" 
                className="w-5 h-5 object-contain" 
              />
            </div>
          </div>

          {/* Year */}
          <div className="text-xs text-gray-500">
            © {new Date().getFullYear()} Ram Rath. All rights reserved.
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
