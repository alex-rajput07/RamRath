"use client";
import React, { useState } from 'react';
import RidePostCard from '../../components/RidePostCard';

export default function PostRide() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [offer, setOffer] = useState<number | null>(null);
  const [contact, setContact] = useState('');
  const [posts, setPosts] = useState<any[]>([]);

  async function postRide() {
    const body = { from_location: from, to_location: to, distance_km: distance, offer_amount: offer, contact };
    const res = await fetch('/api/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, is_post: true }) });
    const json = await res.json();
    if (json?.id) {
      setPosts([json, ...posts]);
    }
  }

  function onReply(post: any) {
    // driver reply action stub
    alert('Reply to post: ' + post.id);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Post a Ride Request / राइड पोस्ट करें</h1>
      <div className="mt-4 grid gap-2">
        <input value={from} onChange={(e)=>setFrom(e.target.value)} placeholder="From" className="p-2 border rounded" />
        <input value={to} onChange={(e)=>setTo(e.target.value)} placeholder="To" className="p-2 border rounded" />
        <input type="number" value={distance ?? ''} onChange={(e)=>setDistance(Number(e.target.value))} placeholder="Distance (km)" className="p-2 border rounded" />
        <input type="number" value={offer ?? ''} onChange={(e)=>setOffer(Number(e.target.value))} placeholder="Offer amount (₹)" className="p-2 border rounded" />
        <input value={contact} onChange={(e)=>setContact(e.target.value)} placeholder="Contact phone" className="p-2 border rounded" />
        <button onClick={postRide} className="bg-indigo-600 text-white p-2 rounded">Post Ride / पोस्ट करें</button>
      </div>

      <section className="mt-6">
        <h2 className="font-medium">Ride Board / राइड बोर्ड</h2>
        <div className="mt-3 space-y-2">
          {posts.length === 0 && <div className="p-3 border rounded text-gray-500">No posts yet</div>}
          {posts.map(p => (
            <RidePostCard key={p.id} post={p} onReply={onReply} />
          ))}
        </div>
      </section>
    </div>
  );
}
