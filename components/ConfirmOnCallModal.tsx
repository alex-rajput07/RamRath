'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmOnCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (fareFixed: number) => Promise<void>;
  driverName: string;
  distance: number;
  from: string;
  to: string;
}

export function ConfirmOnCallModal({
  isOpen,
  onClose,
  onConfirm,
  driverName,
  distance,
  from,
  to,
}: ConfirmOnCallModalProps) {
  const [fareFixed, setFareFixed] = useState<number>(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!fareFixed || fareFixed <= 0) {
      setError('कृपया किराया दर्ज करें / Please enter fare amount');
      return;
    }

    setIsConfirming(true);
    setError('');

    try {
      await onConfirm(fareFixed);
      setFareFixed(0);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'पुष्टि विफल / Confirmation failed. कृपया पुनः प्रयास करें / Please try again.'
      );
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                कॉल पर पुष्टि करें / Confirm on Call
              </h2>
              <button
                onClick={onClose}
                disabled={isConfirming}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Trip Details */}
            <div className="mb-6 space-y-3 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">ड्राइवर / Driver:</span> {driverName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">से / From:</span> {from}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">को / To:</span> {to}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">दूरी / Distance:</span> {distance.toFixed(1)} km
              </p>
            </div>

            {/* Fare Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                किराया (₹) / Fare (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={fareFixed || ''}
                onChange={(e) => {
                  setFareFixed(parseInt(e.target.value) || 0);
                  setError('');
                }}
                placeholder="राशि दर्ज करें / Enter amount"
                min="0"
                step="10"
                disabled={isConfirming}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
              />
            </div>

            {/* Error Message */}
            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isConfirming}
                className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                रद्द करें / Cancel
              </button>
              <motion.button
                onClick={handleConfirm}
                disabled={isConfirming}
                whileHover={!isConfirming ? { scale: 1.02 } : {}}
                whileTap={!isConfirming ? { scale: 0.98 } : {}}
                className="flex-1 rounded-lg bg-green-600 py-2 font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {isConfirming ? 'पुष्टि हो रही है... / Confirming...' : 'पुष्टि करें / Confirm'}
              </motion.button>
            </div>

            {/* Info Text */}
            <p className="mt-4 text-xs text-gray-500">
              आप ड्राइवर से बात करने के बाद किराया दर्ज करें। / Enter fare after discussing with driver.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
