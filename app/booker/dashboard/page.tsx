'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getCurrentUser, getUserBookings, AuthUser } from '@/lib/supabaseClient';

export default function BookerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();

        // Redirect to login if not authenticated or not a booker
        if (!currentUser || currentUser.role !== 'booker') {
          router.push('/login');
          return;
        }

        setUser(currentUser);

        // Fetch user bookings
        const userBookings = await getUserBookings(currentUser.id, 'booker');
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
              <h1 className="text-3xl font-bold text-gray-900">बुकर पैनल / Booker Dashboard</h1>
              <p className="text-gray-600 mt-1">📱 +91-{user.phone.slice(-4)}</p>
            </div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-block px-4 py-2 rounded-lg font-semibold text-white bg-green-500"
            >
              ✓ सत्यापित / Verified
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Action CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-8 mb-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">🚗 नई बुकिंग / Book a Ride</h2>
              <p className="mt-2 opacity-90">
                तुरंत सवारी बुक करें या अपना राइड पोस्ट करें। / Book instantly or post your ride.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/direct-book">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition"
                >
                  तुरंत बुक करें / Direct Book
                </motion.button>
              </Link>
              <Link href="/post-ride">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-orange-700 text-white font-bold rounded-lg hover:bg-orange-800 transition"
                >
                  राइड पोस्ट करें / Post Ride
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Bookings Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 आपकी बुकिंग / Your Bookings</h2>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg mb-4">अभी तक कोई बुकिंग नहीं। / No bookings yet.</p>
              <Link href="/direct-book">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition inline-block"
                >
                  आपकी पहली बुकिंग करें / Make Your First Booking
                </motion.button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        📍 {booking.fromLocation} → {booking.toLocation}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">📏 {booking.distanceKm} km</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(booking.createdAt).toLocaleString('hi-IN')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4 ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {booking.status === 'confirmed' && '✓ पुष्टि / Confirmed'}
                      {booking.status === 'completed' && '✓ पूर्ण / Completed'}
                      {booking.status === 'pending' && '⏳ लंबित / Pending'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
