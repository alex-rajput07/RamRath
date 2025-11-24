'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { RoleSwitcher, UserRole } from '@/components/RoleSwitcher';
import { AuthOTPForm } from '@/components/AuthOTPForm';
import { DriverOnboardingForm, DriverOnboardingData } from '@/components/DriverOnboardingForm';
import { getSupabase } from '@/lib/supabaseClient';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    (searchParams.get('role') as UserRole) || 'booker'
  );
  const [currentStep, setCurrentStep] = useState<'role' | 'otp' | 'onboarding' | 'admin-login'>(
    selectedRole === 'admin' ? 'admin-login' : 'role'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');

  // Admin email + password login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleAdminLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const supabase = getSupabase();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (authError) throw authError;

      if (!data.user) throw new Error('Admin login failed');

      // Verify user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access only');
      }

      // Log admin login
      await supabase.from('audit_logs').insert({
        action: 'ADMIN_LOGIN',
        user_id: data.user.id,
        details: { email: adminEmail },
        ip_address: 'client',
        created_at: new Date().toISOString(),
      });

      router.push('/admin/panel');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Admin login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSuccess = async (phoneNumber: string, otp: string) => {
    setIsLoading(true);
    setError('');

    // Block admin signup
    if (selectedRole === 'admin') {
      setError('Admin accounts cannot be created through signup. Please use your system-provided login.');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();

      // Call signUp with OTP (Supabase auth)
      const { data, error: authError } = await supabase.auth.signUp({
        email: `${phoneNumber}@ramrath.local`,
        password: otp,
      });

      if (authError) throw authError;

      if (!data.user) throw new Error('User creation failed');

      // Create profile in database
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        phone: phoneNumber,
        role: selectedRole,
        verified: selectedRole === 'booker', // Bookers auto-verified, Drivers require admin approval
        full_name: '',
        created_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      // Log signup action
      await supabase.from('audit_logs').insert({
        action: 'USER_SIGNUP',
        user_id: data.user.id,
        details: { role: selectedRole, phone: phoneNumber },
        ip_address: 'client',
        created_at: new Date().toISOString(),
      });

      setPhone(phoneNumber);

      if (selectedRole === 'driver') {
        // Driver needs onboarding
        setCurrentStep('onboarding');
      } else {
        // Booker goes to dashboard
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

  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    if (newRole === 'admin') {
      setCurrentStep('admin-login');
    } else {
      setCurrentStep('role');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 p-4 py-12 md:py-20">
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
        {(currentStep === 'role' || currentStep === 'admin-login') && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <RoleSwitcher selectedRole={selectedRole} onRoleChange={handleRoleChange} />

            {/* Admin Login Form */}
            {currentStep === 'admin-login' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200"
              >
                <p className="text-sm text-blue-900 mb-4 font-semibold">
                  ⚙️ Admin accounts cannot be created here. Please use your system-provided login.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      📧 Email
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => {
                        setAdminEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="admin@example.com"
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white text-base font-medium placeholder-gray-400 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      🔐 Password
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white text-base font-medium placeholder-gray-400 disabled:bg-gray-100"
                    />
                  </div>

                  <motion.button
                    onClick={handleAdminLogin}
                    disabled={isLoading || !adminEmail || !adminPassword}
                    whileHover={!isLoading && adminEmail && adminPassword ? { scale: 1.02 } : {}}
                    whileTap={!isLoading && adminEmail && adminPassword ? { scale: 0.98 } : {}}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-base hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        लॉगिन हो रहे हैं... / Logging in...
                      </>
                    ) : (
                      '🔓 Admin Login'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Booker/Driver Next Button */}
            {currentStep === 'role' && selectedRole !== 'admin' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep('otp')}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all mt-6"
              >
                आगे बढ़ें / Next →
              </motion.button>
            )}
          </div>
        )}

        {currentStep === 'otp' && selectedRole !== 'admin' && (
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

        {currentStep === 'onboarding' && selectedRole === 'driver' && (
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
