"use client";
import React from 'react';

type Props = {
  name: string;
  phone: string;
  distanceKm?: number;
};

export default function DriverCard({ name, phone, distanceKm }: Props) {
  return (
    <div className="p-3 border rounded flex items-center justify-between">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-gray-600">{distanceKm ? `${distanceKm.toFixed(1)} km away` : '—'}</div>
      </div>
      <div className="flex gap-2">
        <a href={`tel:${phone}`} className="bg-blue-600 text-white px-3 py-1 rounded" aria-label={`Call ${name}`}>
          Call
        </a>
      </div>
    </div>
  );
}
