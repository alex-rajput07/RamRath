'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

export interface DriverOnboardingFormProps {
  phone: string;
  onSuccess: (data: DriverOnboardingData) => Promise<void>;
  isLoading?: boolean;
}

export interface DriverOnboardingData {
  fullName: string;
  vehicle: string;
  rcDocFile: File | null;
  idDocFile: File | null;
  selfieFile: File | null;
}

export function DriverOnboardingForm({
  phone,
  onSuccess,
  isLoading = false,
}: DriverOnboardingFormProps) {
  const [formData, setFormData] = useState<DriverOnboardingData>({
    fullName: '',
    vehicle: 'auto',
    rcDocFile: null,
    idDocFile: null,
    selfieFile: null,
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const rcInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    field: 'rcDocFile' | 'idDocFile' | 'selfieFile',
    file: File | null
  ) => {
    if (file && file.size > 5 * 1024 * 1024) {
      setError('फ़ाइल 5 MB से कम होनी चाहिए। / File must be under 5 MB.');
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: file }));
    setError('');
  };

  const handleSubmit = async () => {
    setError('');

    if (!formData.fullName.trim()) {
      setError('कृपया पूरा नाम दर्ज करें। / Please enter your full name.');
      return;
    }

    if (!formData.rcDocFile) {
      setError('कृपया RC दस्तावेज़ अपलोड करें। / Please upload RC document.');
      return;
    }

    if (!formData.idDocFile) {
      setError('कृपया ID दस्तावेज़ अपलोड करें। / Please upload ID document.');
      return;
    }

    if (!formData.selfieFile) {
      setError('कृपया सेल्फी अपलोड करें। / Please upload a selfie.');
      return;
    }

    try {
      await onSuccess(formData);
      setSuccessMessage('✓ आवेदन सबमिट! / Application submitted!');
    } catch (err) {
      setError('फ़ॉर्म सबमिट करने में विफल। / Failed to submit form.');
    }
  };

  const renderFileButton = (
    label: string,
    field: 'rcDocFile' | 'idDocFile' | 'selfieFile',
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    const fileName = formData[field]?.name || null;
    return (
      <div key={field}>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
          className="hidden"
          disabled={isLoading}
        />
        <motion.button
          type="button"
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className={`w-full px-4 py-2 border-2 rounded-md text-center font-medium transition-colors ${
            fileName
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-orange-400'
          } disabled:opacity-50`}
        >
          {fileName ? `✓ ${fileName}` : '📎 अपलोड करें / Upload'}
        </motion.button>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          ड्राइवर ऑनबोर्डिंग / Driver Onboarding
        </h3>
        <p className="text-sm text-gray-600 mb-4">फोन: +91-{phone.slice(-4)}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              पूरा नाम / Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value });
                setError('');
              }}
              placeholder="राज कुमार / Raj Kumar"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              वाहन प्रकार / Vehicle Type
            </label>
            <select
              value={formData.vehicle}
              onChange={(e) => {
                setFormData({ ...formData, vehicle: e.target.value });
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={isLoading}
            >
              <option value="auto">ऑटो / Auto</option>
              <option value="bike">बाइक / Bike</option>
              <option value="car">कार / Car</option>
            </select>
          </div>

          {renderFileButton('RC दस्तावेज़ / RC Document', 'rcDocFile', rcInputRef)}
          {renderFileButton('ID दस्तावेज़ / ID Document', 'idDocFile', idInputRef)}
          {renderFileButton('सेल्फी (चेहरा स्पष्ट) / Selfie', 'selfieFile', selfieInputRef)}

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
          {successMessage && <p className="text-green-600 text-sm font-medium">{successMessage}</p>}

          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-2 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'जमा... / Submitting...' : 'जमा करें / Submit'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
