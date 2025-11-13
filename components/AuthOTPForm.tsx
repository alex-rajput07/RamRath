'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export interface AuthOTPFormProps {
  role: 'booker' | 'driver' | 'admin';
  onSuccess: (phone: string, otp: string) => Promise<void>;
  isLoading?: boolean;
}

export function AuthOTPForm({ role, onSuccess, isLoading = false }: AuthOTPFormProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const validatePhone = (p: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(p.replace(/\D/g, ''));
  };

  const handleSendOTP = async () => {
    setError('');
    const cleanPhone = phone.replace(/\D/g, '');

    if (!validatePhone(cleanPhone)) {
      setError('कृपया सही 10-अंकीय फ़ोन नंबर दर्ज करें। / Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      // Simulate OTP send (in production, call /api/auth/send-otp)
      setSuccessMessage('✓ OTP भेज दिया गया। / OTP sent successfully.');
      setStep('otp');
      setResendCountdown(60);
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('फ़ोन नंबर भेजने में विफल। / Failed to send OTP.');
    }
  };

  const handleVerifyOTP = async () => {
    setError('');

    if (!otp || otp.length !== 6) {
      setError('कृपया 6-अंकीय OTP दर्ज करें। / Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      await onSuccess(phone, otp);
      setSuccessMessage('✓ सफल लॉगिन! / Login successful!');
    } catch (err) {
      setError('OTP सत्यापन विफल। / OTP verification failed.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {role === 'booker' && 'बुकर लॉगिन / Booker Login'}
          {role === 'driver' && 'ड्राइवर लॉगिन / Driver Login'}
          {role === 'admin' && 'एडमिन लॉगिन / Admin Login'}
        </h3>

        {step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                फ़ोन नंबर / Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(cleaned);
                  setError('');
                }}
                placeholder="9876543210"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
            {successMessage && <p className="text-green-600 text-sm font-medium">{successMessage}</p>}

            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              onClick={handleSendOTP}
              disabled={isLoading || phone.length < 10}
              className="w-full py-2 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'भेज रहे हैं... / Sending...' : 'OTP भेजें / Send OTP'}
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              OTP भेजा गया: +91-{phone.slice(-4)} / OTP sent to: +91-{phone.slice(-4)}
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                6-अंकीय OTP / 6-digit OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(cleaned);
                  setError('');
                }}
                placeholder="000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-2xl tracking-widest font-mono"
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
            {successMessage && <p className="text-green-600 text-sm font-medium">{successMessage}</p>}

            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.length < 6}
              className="w-full py-2 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'सत्यापन... / Verifying...' : 'सत्यापित करें / Verify OTP'}
            </motion.button>

            <button
              onClick={() => {
                setStep('phone');
                setError('');
                setSuccessMessage('');
              }}
              disabled={resendCountdown > 0 || isLoading}
              className="w-full py-2 text-orange-500 font-medium text-sm hover:underline disabled:opacity-50"
            >
              {resendCountdown > 0
                ? `फिर से भेजें: ${resendCountdown}s / Resend in: ${resendCountdown}s`
                : 'नया OTP भेजें / Resend OTP'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
