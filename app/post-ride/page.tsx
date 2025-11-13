"use client";
import React, { useState } from 'react';
import RidePostCard from '../../components/RidePostCard';

export default function PostRide() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [distanceError, setDistanceError] = useState('');
  const [offer, setOffer] = useState<number | null>(null);
  const [contact, setContact] = useState('');
  const [posts, setPosts] = useState<any[]>([]);

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

  async function postRide() {
    if (!from || !to) return alert('Enter from and to locations');
    if (!validateDistance(distance)) return;
    if (!offer || offer <= 0) return alert('Enter a valid offer amount');
    if (!contact) return alert('Enter your contact number');

    const body = {
      from_location: from,
      to_location: to,
      distance_km: distance,
      distance_source: 'manual',
      offer_amount: offer,
      contact
    };
    
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, is_post: true })
      });
      const json = await res.json();
      if (json?.id) {
        setPosts([json, ...posts]);
        setFrom('');
        setTo('');
        setDistance(null);
        setOffer(null);
        setContact('');
        alert('Ride posted successfully!');
      } else {
        alert('Failed to post ride');
      }
    } catch (err) {
      console.error(err);
      alert('Error posting ride');
    }
  }

  function onReply(post: any) {
    alert('Reply to post: ' + post.id);
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-2">Post a Ride Request / राइड पोस्ट करें</h1>
      <div className="bg-gray-100 border border-gray-300 rounded p-3 mb-4 text-gray-600 text-sm">
        ℹ️ Map features are currently disabled. Please enter distance manually.
      </div>

      <div className="mt-4 grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">From / कहाँ से</label>
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Enter pickup location"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">To / कहाँ तक</label>
          <input
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

        <div>
          <label className="block text-sm font-medium mb-1">Offer Amount (₹) / ऑफर राशि</label>
          <input
            type="number"
            value={offer ?? ''}
            onChange={(e) => setOffer(e.target.value ? Number(e.target.value) : null)}
            placeholder="Your offer amount in rupees"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="10"
            step="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contact Phone / संपर्क नंबर</label>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Your contact number"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={postRide}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded font-semibold transition"
        >
          Post Ride / पोस्ट करें
        </button>
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Ride Board / राइड बोर्ड</h2>
        <div className="space-y-3">
          {posts.length === 0 && (
            <div className="p-4 border rounded text-gray-500 text-center">
              No posts yet. Be the first to post a ride! / अभी कोई पोस्ट नहीं है।
            </div>
          )}
          {posts.map((p) => (
            <RidePostCard key={p.id} post={p} onReply={onReply} />
          ))}
        </div>
      </section>
    </div>
  );
}
