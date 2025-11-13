"use client";
import React from 'react';

export default function DriverDashboard() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Driver Dashboard / ड्राइवर पैनल</h1>
      <div className="mt-4 space-y-3">
        <div className="p-3 border rounded">Verification status: <strong>Not verified</strong></div>
        <div className="p-3 border rounded">Upload documents (ID, RC, Selfie) - form placeholder</div>
        <div className="p-3 border rounded">Pending bookings will appear here</div>
      </div>
    </div>
  );
}
