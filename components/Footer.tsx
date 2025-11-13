"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-4 border-t bg-white text-sm text-gray-700"
    >
      <div className="max-w-4xl mx-auto text-center">
        Made By AJ <img src="/assets/badge.png" alt="badge" className="w-5 inline-block ml-1" />
      </div>
    </motion.footer>
  );
}
