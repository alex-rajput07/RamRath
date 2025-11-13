"use client";
import React from 'react';

export default function AdminPanel() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Admin Panel / एडमिन पैनल</h1>
      <div className="mt-4 space-y-3">
        <div className="p-3 border rounded">Pending verifications</div>
        <div className="p-3 border rounded">Audit logs</div>
        <div className="p-3 border rounded">Create booking (admin)</div>
      </div>
    </div>
  );
}
