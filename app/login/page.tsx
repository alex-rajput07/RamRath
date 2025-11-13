'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { RoleSwitcher, UserRole } from '@/components/RoleSwitcher';
import { AuthOTPForm } from '@/components/AuthOTPForm';
import { DriverOnboardingForm, DriverOnboardingData } from '@/components/DriverOnboardingForm';
import { getSupabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('booker');
  const [currentStep, setCurrentStep] = useState<'role' | 'otp' | 'onboarding'>('role');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');

  const handleOTPSuccess = async (phoneNumber: string, otp: string) => {
    setIsLoading(true);
    setError('');

    try {
      const supabase = getSupabase();

      // Call signUp with OTP (Supabase auth)
      const { data, error: authError } = await supabase.auth.signUp({
        email: `${phoneNumber}@ramrath.local`,
        password: otp, // Simple approach: OTP as password (in production, use proper auth flow)
      });

      if (authError) throw authError;

      if (!data.user) throw new Error('User creation failed');

      // Create profile in database
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        phone: phoneNumber,
        role: selectedRole,
        verified: selectedRole === 'admin' ? true : selectedRole === 'booker', // Bookers auto-verified
        full_name: '',
        created_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      setPhone(phoneNumber);

      if (selectedRole === 'driver') {
        // Driver needs onboarding
        setCurrentStep('onboarding');
      } else {
        // Booker/Admin go to dashboard
        router.push(`/${selectedRole}/dashboard`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'लॉगिन विफल। / Login failed. कृपया पुनः प्रयास करें। / Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingSuccess = async (data: DriverOnboardingData) => {
    setIsLoading(true);
    setError('');

    try {
      const supabase = getSupabase();
      const user = (await supabase.auth.getUser()).data.user;

      if (!user) throw new Error('User not found');

      // Upload files to Supabase Storage
      const uploadFile = async (file: File, bucket: string, prefix: string) => {
        const fileName = `${user.id}/${prefix}-${Date.now()}`;
        const { error } = await supabase.storage.from(bucket).upload(fileName, file);
        if (error) throw error;
        return fileName;
      };

      const rcDocUrl = data.rcDocFile ? await uploadFile(data.rcDocFile, 'driver-docs', 'rc') : null;
      const idDocUrl = data.idDocFile ? await uploadFile(data.idDocFile, 'driver-docs', 'id') : null;
      const selfieUrl = data.selfieFile ? await uploadFile(data.selfieFile, 'driver-docs', 'selfie') : null;

      // Create driver profile
      const { error: driverError } = await supabase.from('drivers').insert({
        user_id: user.id,
        full_name: data.fullName,
        vehicle_type: data.vehicle,
        rc_doc_url: rcDocUrl,
        id_doc_url: idDocUrl,
        selfie_url: selfieUrl,
        verified: false,
        created_at: new Date().toISOString(),
      });

      if (driverError) throw driverError;

      // Log onboarding action
      await supabase.from('audit_logs').insert({
        action: 'DRIVER_ONBOARDED',
        user_id: user.id,
        details: { vehicle_type: data.vehicle },
        ip_address: 'client',
        created_at: new Date().toISOString(),
      });

      // Redirect to driver dashboard (pending verification)
      router.push('/driver/dashboard');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'ऑनबोर्डिंग विफल। / Onboarding failed. कृपया पुनः प्रयास करें। / Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">🏍️ Ram Rath</h1>
          <p className="text-lg text-gray-600">
            ग्रामीण सवारी साझा / Rural Ride Sharing Platform
          </p>
        </div>

        {/* Role Selector or Form */}
        {currentStep === 'role' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <RoleSwitcher selectedRole={selectedRole} onRoleChange={setSelectedRole} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentStep('otp')}
              className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors mt-6"
            >
              आगे बढ़ें / Next
            </motion.button>
          </div>
        )}

        {currentStep === 'otp' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <AuthOTPForm
              role={selectedRole}
              onSuccess={handleOTPSuccess}
              isLoading={isLoading}
            />
            <button
              onClick={() => {
                setCurrentStep('role');
                setError('');
              }}
              className="w-full py-2 text-gray-600 font-medium text-sm hover:text-gray-900 mt-4 border-t pt-4"
            >
              ← वापस / Back
            </button>
          </div>
        )}

        {currentStep === 'onboarding' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <DriverOnboardingForm
              phone={phone}
              onSuccess={handleOnboardingSuccess}
              isLoading={isLoading}
            />
            <button
              onClick={() => {
                setCurrentStep('otp');
                setError('');
              }}
              className="w-full py-2 text-gray-600 font-medium text-sm hover:text-gray-900 mt-4 border-t pt-4"
            >
              ← वापस / Back
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-100 border border-red-400 rounded-lg"
          >
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-xs text-gray-500 space-y-1">
          <p>🔐 आपके डेटा सुरक्षित है। / Your data is secure.</p>
          <p>📱 OTP आपके फ़ोन पर आएगा। / OTP will be sent to your phone.</p>
        </div>
      </motion.div>
    </div>
  );
}
