'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getCurrentUser, getSupabase, AuthUser } from '@/lib/supabaseClient';

interface PendingDriver {
  id: string;
  userId: string;
  fullName: string;
  vehicleType: string;
  rcDocUrl: string | null;
  idDocUrl: string | null;
  selfieUrl: string | null;
  verified: boolean;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  userId: string;
  details: Record<string, any>;
  ipAddress: string;
  createdAt: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pendingDrivers, setPendingDrivers] = useState<PendingDriver[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();

        // Redirect to login if not authenticated or not an admin
        if (!currentUser || currentUser.role !== 'admin') {
          router.push('/login');
          return;
        }

        setUser(currentUser);

        // Fetch pending drivers
        const supabase = getSupabase();
        const { data: drivers } = await supabase
          .from('drivers')
          .select('*')
          .eq('verified', false)
          .order('created_at', { ascending: true });

        if (drivers) {
          setPendingDrivers(
            drivers.map((d) => ({
              id: d.id,
              userId: d.user_id,
              fullName: d.full_name,
              vehicleType: d.vehicle_type,
              rcDocUrl: d.rc_doc_url,
              idDocUrl: d.id_doc_url,
              selfieUrl: d.selfie_url,
              verified: d.verified,
              createdAt: d.created_at,
            }))
          );
        }

        // Fetch recent audit logs
        const { data: logs } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (logs) {
          setAuditLogs(logs);
        }
      } catch (error) {
        console.error('Failed to load admin panel:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleApproveDriver = async (driverId: string) => {
    try {
      const supabase = getSupabase();

      // Update driver verified status
      const { error } = await supabase
        .from('drivers')
        .update({ verified: true })
        .eq('id', driverId);

      if (error) throw error;

      // Log action
      await supabase.from('audit_logs').insert({
        action: 'DRIVER_VERIFIED',
        user_id: user?.id || '',
        details: { driver_id: driverId },
        ip_address: 'admin',
        created_at: new Date().toISOString(),
      });

      // Remove from pending list
      setPendingDrivers(pendingDrivers.filter((d) => d.id !== driverId));
      setSelectedDriver(null);
    } catch (error) {
      console.error('Failed to approve driver:', error);
      alert('Failed to approve driver.');
    }
  };

  const handleRejectDriver = async (driverId: string) => {
    try {
      const supabase = getSupabase();

      // Log rejection
      await supabase.from('audit_logs').insert({
        action: 'DRIVER_REJECTED',
        user_id: user?.id || '',
        details: { driver_id: driverId, reason: rejectionReason },
        ip_address: 'admin',
        created_at: new Date().toISOString(),
      });

      // Remove from pending list
      setPendingDrivers(pendingDrivers.filter((d) => d.id !== driverId));
      setSelectedDriver(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to reject driver:', error);
      alert('Failed to reject driver.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">लोड हो रहा है... / Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">⚙️ एडमिन पैनल / Admin Panel</h1>
              <p className="text-gray-600 mt-1">📱 +91-{user.phone.slice(-4)}</p>
            </div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-block px-4 py-2 rounded-lg font-semibold text-white bg-red-500"
            >
              🔐 Admin
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 lg:col-span-1"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">📊 सारांश / Summary</h2>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 text-sm font-medium">प्रतीक्षा में ड्राइवर / Pending Drivers</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingDrivers.length}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm font-medium">हाल की गतिविधियां / Recent Activities</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{auditLogs.length}</p>
              </div>
            </div>
          </motion.div>

          {/* Pending Drivers & Approval */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">🔍 लंबित ड्राइवर / Pending Drivers</h2>

            {pendingDrivers.length === 0 ? (
              <p className="text-gray-600 text-center py-8">सभी ड्राइवर सत्यापित हैं। / All drivers verified.</p>
            ) : (
              <div className="space-y-3">
                {pendingDrivers.map((driver) => (
                  <motion.div
                    key={driver.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      selectedDriver === driver.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-400'
                    }`}
                    onClick={() => setSelectedDriver(selectedDriver === driver.id ? null : driver.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{driver.fullName}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {driver.vehicleType === 'auto' && '🚗 ऑटो'}
                          {driver.vehicleType === 'bike' && '🏍️ बाइक'}
                          {driver.vehicleType === 'car' && '🚙 कार'}
                          {' '} | {new Date(driver.createdAt).toLocaleDateString('hi-IN')}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        ⏳ लंबित / Pending
                      </span>
                    </div>

                    {/* Approval Panel */}
                    {selectedDriver === driver.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-gray-200 space-y-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">📄 दस्तावेज़ / Documents</p>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p>✓ RC: {driver.rcDocUrl ? 'अपलोड' : '❌'} / {driver.rcDocUrl ? 'Uploaded' : 'Missing'}</p>
                            <p>✓ ID: {driver.idDocUrl ? 'अपलोड' : '❌'} / {driver.idDocUrl ? 'Uploaded' : 'Missing'}</p>
                            <p>✓ Selfie: {driver.selfieUrl ? 'अपलोड' : '❌'} / {driver.selfieUrl ? 'Uploaded' : 'Missing'}</p>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">
                            अस्वीकृति कारण (यदि आवश्यक हो) / Rejection Reason (if needed)
                          </label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="समस्या विवरण / Describe the issue..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            rows={2}
                          />
                        </div>

                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleApproveDriver(driver.id)}
                            className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition text-sm"
                          >
                            ✓ स्वीकृत करें / Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleRejectDriver(driver.id)}
                            className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition text-sm"
                          >
                            ✕ अस्वीकार / Reject
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Audit Logs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6 mt-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">📋 गतिविधि लॉग / Activity Logs</h2>
          {auditLogs.length === 0 ? (
            <p className="text-gray-600 text-center py-8">कोई गतिविधि नहीं। / No activity yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">क्रिया / Action</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">समय / Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">विवरण / Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{log.action}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(log.createdAt).toLocaleString('hi-IN')}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {JSON.stringify(log.details).substring(0, 50)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
