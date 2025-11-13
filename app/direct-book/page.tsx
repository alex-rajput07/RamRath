"use client";
import React, { useState } from 'react';
import DriverCard from '../../components/DriverCard';

export default function DirectBook() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [distanceError, setDistanceError] = useState('');

  function validateDistance(value: number | null): boolean {
    setDistanceError('');
    if (value === null || value === undefined) {
      setDistanceError('Distance is required');
      return false;
    }
    if (value <= 0) {
      setDistanceError('Distance must be greater than 0 km');
      return false;
    }
    if (value > 1000) {
      setDistanceError('Distance cannot exceed 1000 km');
      return false;
    }
    return true;
  }

  async function bookNow() {
    if (!from || !to) return alert('Enter from and to locations');
    if (!validateDistance(distance)) return;
    
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_location: from,
          to_location: to,
          distance_km: distance,
          distance_source: 'manual'
        })
      });
      const json = await res.json();
      if (json?.id) {
        alert('Booking requested successfully!');
        setFrom('');
        setTo('');
        setDistance(null);
      } else {
        alert('Failed to create booking');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating booking');
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-2">Book a Car / गाड़ी बुक करें</h1>
      <div className="bg-gray-100 border border-gray-300 rounded p-3 mb-4 text-gray-600 text-sm">
        ℹ️ Map features are currently disabled. Please enter distance manually.
      </div>

      <div className="mt-4 grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">From / कहाँ से</label>
          <input
            aria-label="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Enter pickup location"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">To / कहाँ तक</label>
          <input
            aria-label="to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Enter destination"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Distance (km) / दूरी (किमी)</label>
          <input
            type="number"
            value={distance ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              setDistance(val);
              if (val !== null) validateDistance(val);
            }}
            placeholder="Enter approximate distance in kilometers"
            className={`w-full p-3 border rounded focus:outline-none focus:ring-2 ${
              distanceError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-indigo-500'
            }`}
            min="0.1"
            max="1000"
            step="0.1"
          />
          {distanceError && <p className="text-red-600 text-sm mt-1">{distanceError}</p>}
          <p className="text-gray-500 text-xs mt-2">
            💡 Enter approximate distance in kilometers. Final fare will be fixed on call. / कृपया दूरी किलोमीटर में दर्ज करें। अंतिम किराया कॉल पर तय होगा।
          </p>
        </div>

        <div className="mt-3">
          <h3 className="font-medium mb-3">Available Drivers / उपलब्ध ड्राइवर</h3>
          <DriverCard name="Ram Singh" phone="+911234567890" distanceKm={5.4} />
          <div className="mt-4">
            <button
              onClick={bookNow}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded font-semibold transition"
            >
              Book Now / अभी बुक करें
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
