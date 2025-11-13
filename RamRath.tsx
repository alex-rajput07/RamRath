"use client";
import React, { useState } from 'react';
import DriverCard from '../../components/DriverCard';

export default function DirectBook() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [manual, setManual] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [distanceSource, setDistanceSource] = useState<'google'|'manual'|'haversine'|null>(null);

  async function estimate() {
    if (!from || !to) return alert('Enter from and to');
    const res = await fetch('/api/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to })
    });
    const json = await res.json();
    if (json.error) {
      setManual(true);
      setDistance(null);
      setDistanceSource('manual');
    } else {
      setDistance(json.distance_km);
      setDistanceSource('google');
    }
  }

  function bookNow() {
    // create booking with status requested
    fetch('/api/book', { method: 'POST', body: JSON.stringify({ from, to, distance_km: distance, distance_source: distanceSource }) });
    alert('Booking requested');
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Book a Car / गाड़ी बुक करें</h1>
      <div className="mt-4 grid gap-2">
        <input aria-label="from" value={from} onChange={(e)=>setFrom(e.target.value)} placeholder="From / कहाँ से" className="p-2 border rounded" />
        <input aria-label="to" value={to} onChange={(e)=>setTo(e.target.value)} placeholder="To / कहाँ तक" className="p-2 border rounded" />
        <label className="flex items-center gap-2"><input type="checkbox" checked={manual} onChange={(e)=>setManual(e.target.checked)} /> Manual distance</label>
        {!manual && <button onClick={estimate} className="bg-indigo-600 text-white p-2 rounded">Estimate Distance / दूरी बताओ</button>}
        {manual && <input type="number" value={distance ?? ''} onChange={(e)=>setDistance(Number(e.target.value))} placeholder="Distance (km)" className="p-2 border rounded" />}
        <div className="mt-3">
          <h3 className="font-medium">Available Drivers</h3>
          <DriverCard name="Ram Singh" phone="+911234567890" distanceKm={5.4} />
          <div className="mt-2">
            <button onClick={bookNow} className="bg-green-600 text-white px-4 py-2 rounded">Book Now / अभी बुक करें</button>
          </div>
        </div>
      </div>
    </div>
  );
}
