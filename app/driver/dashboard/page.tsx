"use client";
import React, { useState } from 'react';
import CommissionRequest from '@/components/CommissionRequest';

export default function DriverDashboard() {
  const [showCommission, setShowCommission] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Driver Dashboard / ड्राइवर पैनल</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-blue-50">
          <p>Verification status: <strong>Not verified</strong></p>
        </div>
        
        <div className="p-4 border rounded-lg bg-gray-50">
          <p className="font-semibold">Upload documents (ID, RC, Selfie)</p>
          <p className="text-sm text-gray-600 mt-2">Form placeholder - awaiting implementation</p>
        </div>
        
        <div className="p-4 border rounded-lg bg-green-50">
          <p className="font-semibold mb-3">📋 Sample Booking Confirmation</p>
          <div className="text-sm text-gray-700 space-y-1">
            <p>✓ Booking ID: booking-12345</p>
            <p>✓ Passenger: +91 9876543210</p>
            <p>✓ Route: Mumbai Central → Bandra Station</p>
            <p>✓ Distance: 15 km (manual)</p>
          </div>
          <button
            onClick={() => setShowCommission(!showCommission)}
            className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
          >
            {showCommission ? 'Hide Commission' : 'Show Commission Request'}
          </button>
        </div>

        {showCommission && (
          <CommissionRequest driverId="driver-sample-123" passengerId="passenger-sample-456" />
        )}

        <div className="p-4 border rounded-lg bg-yellow-50">
          <p className="font-semibold">Pending bookings</p>
          <p className="text-sm text-gray-600 mt-2">Will appear here once driver is verified</p>
        </div>
      </div>
    </div>
  );
}
