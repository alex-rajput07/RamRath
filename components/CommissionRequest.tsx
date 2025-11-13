"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';

type CommissionRequestProps = {
  driverId?: string;
  passengerId?: string;
};

export default function CommissionRequest({ driverId, passengerId }: CommissionRequestProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const UPI_ID = 'ramrath@ptyes';
  const UPI_NAME = 'AJ RamRath';
  const FIXED_AMOUNTS = [20, 50, 100];

  // Validate custom amount
  function validateAmount(amount: string): boolean {
    setError('');
    if (!amount) {
      setError('Please enter an amount');
      return false;
    }

    const num = Number(amount);
    if (isNaN(num)) {
      setError('Invalid amount');
      return false;
    }

    if (num < 20) {
      setError('Minimum amount is ₹ 20');
      return false;
    }

    if (num % 10 !== 0) {
      setError('Amount must be a multiple of 10 (20, 30, 40...)');
      return false;
    }

    return true;
  }

  // Open UPI intent link
  function openUPI(amount: number) {
    const intentLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=Ram%20Rath%20Support`;
    window.location.href = intentLink;
  }

  // Handle fixed amount button click
  function handleFixedAmount(amount: number) {
    setSelectedAmount(amount);
    setCustomAmount('');
    setError('');
    openUPI(amount);
  }

  // Handle custom amount submit
  function handleCustomAmount() {
    if (validateAmount(customAmount)) {
      const amount = Number(customAmount);
      setSelectedAmount(amount);
      openUPI(amount);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8 p-6 rounded-lg bg-yellow-50 border-2 border-yellow-300 shadow-lg"
    >
      {/* Heading */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🙏 Support Ram Rath</h2>
        <p className="text-sm text-gray-700 mb-2">
          Please contribute to keep this service running.
        </p>
        <p className="text-sm text-gray-600 italic">
          कृपया इस सेवा को चलाने में मदद करें — आपका योगदान मूल्यवान है।
        </p>
      </div>

      {/* Fixed Amount Buttons */}
      <div className="flex flex-wrap gap-3 justify-center mb-4">
        {FIXED_AMOUNTS.map((amount) => (
          <motion.button
            key={amount}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFixedAmount(amount)}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full shadow-md transition"
          >
            ₹ {amount}
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => document.getElementById('custom-input')?.focus()}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full shadow-md transition"
        >
          Custom
        </motion.button>
      </div>

      {/* Custom Amount Input */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="flex gap-2 w-full max-w-xs">
          <input
            id="custom-input"
            type="number"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setError('');
            }}
            placeholder="Enter amount (₹20+)"
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            min="20"
            step="10"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCustomAmount}
            disabled={!customAmount}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
          >
            Pay
          </motion.button>
        </div>
        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
      </div>

      {/* QR Code & UPI ID */}
      <div className="flex flex-col items-center gap-4 pt-4 border-t border-yellow-300">
        <div className="text-center">
          <p className="text-gray-700 font-semibold mb-3">Or scan QR code:</p>
          <img
            src="/assets/aj_upi_qr.svg"
            alt="UPI QR Code for ramrath@ptyes"
            className="w-48 h-48 rounded-lg border-2 border-gray-300 shadow-md"
          />
        </div>
        <div className="text-center">
          <p className="text-gray-600">UPI ID:</p>
          <p className="text-lg font-mono font-bold text-gray-900">{UPI_ID}</p>
        </div>
      </div>

      {/* Thank You Message */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>🙏 Thank you for supporting Ram Rath! / धन्यवाद!</p>
      </div>
    </motion.section>
  );
}
