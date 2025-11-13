'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import CommissionRequest from '@/components/CommissionRequest';
import { getCurrentUser, getUserBookings, getDriverProfile, AuthUser } from '@/lib/supabaseClient';

export default function DriverDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [driverProfile, setDriverProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCommission, setShowCommission] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();

        // Redirect to login if not authenticated or not a driver
        if (!currentUser || currentUser.role !== 'driver') {
          router.push('/login');
          return;
        }

        setUser(currentUser);

        // Fetch driver profile
        const profile = await getDriverProfile(currentUser.id);
        setDriverProfile(profile);

        // Fetch user bookings
        const userBookings = await getUserBookings(currentUser.id, 'driver');
        setBookings(userBookings);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {driverProfile?.fullName || 'ड्राइवर / Driver'}
              </h1>
              <p className="text-gray-600 mt-1">📱 +91-{user.phone.slice(-4)}</p>
            </div>
            <div className="text-right">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className={`inline-block px-4 py-2 rounded-lg font-semibold text-white ${
                  user.verified ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              >
                {user.verified ? '✓ सत्यापित / Verified' : '⏳ सत्यापन प्रतीक्षा / Pending'}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Verification Banner */}
        {!user.verified && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
          >
            <p className="text-yellow-800 font-medium">
              ⏳ आपके दस्तावेज़ की समीक्षा की जा रही है। / Your documents are under review.
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              सत्यापन के बाद आप बुकिंग स्वीकार कर सकेंगे। / You&apos;ll be able to accept bookings once verified.
            </p>
          </motion.div>
        )}

        {/* Driver Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">🚙 वाहन विवरण / Vehicle Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">वाहन प्रकार / Vehicle Type</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {driverProfile?.vehicleType === 'auto' && 'ऑटो / Auto'}
                {driverProfile?.vehicleType === 'bike' && 'बाइक / Bike'}
                {driverProfile?.vehicleType === 'car' && 'कार / Car'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">पंजीकरण तारीख / Registration Date</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {new Date(user.createdAt).toLocaleDateString('hi-IN')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bookings Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 आपकी बुकिंग / Your Bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              कोई बुकिंग नहीं। / No bookings yet.
            </p>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{booking.fromLocation} → {booking.toLocation}</p>
                      <p className="text-sm text-gray-600 mt-1">📍 {booking.distanceKm} km</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(booking.createdAt).toLocaleString('hi-IN')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {booking.status === 'confirmed' && '✓ पुष्टि / Confirmed'}
                      {booking.status === 'completed' && '✓ पूर्ण / Completed'}
                      {booking.status === 'pending' && '⏳ लंबित / Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Commission Request Demo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <button
            onClick={() => setShowCommission(!showCommission)}
            className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            {showCommission ? '✕ छुपाएं / Hide' : '🙏 सहायता करें / Support Ram Rath'}
          </button>
        </motion.div>

        {showCommission && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <CommissionRequest driverId={user.id} passengerId="" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
