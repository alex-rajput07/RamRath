import Link from 'next/link';
import React from 'react';

export default function HomePage() {
  return (
    <div>
      <section className="mt-8 grid gap-4">
        <h1 className="text-2xl font-semibold">Ram Rath / राम रथ</h1>
        <p className="text-sm text-gray-600">Rural-first ride matching. Low bandwidth friendly.</p>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Link href="/direct-book" className="bg-blue-600 text-white p-4 rounded shadow text-center">
            <div>Book a Car</div>
            <div className="text-sm">गाड़ी बुक करें</div>
          </Link>
          <Link href="/post-ride" className="bg-green-600 text-white p-4 rounded shadow text-center">
            <div>Post a Ride Request</div>
            <div className="text-sm">राइड पोस्ट करें</div>
          </Link>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-medium">Latest Ride Board / नई पोस्ट</h2>
        <p className="text-sm text-gray-500">Low-bandwidth list view below (maps optional)</p>
        <div className="mt-3 space-y-2">
          <div className="p-3 border rounded">No posts yet — try posting a ride.</div>
        </div>
      </section>
    </div>
  );
}
