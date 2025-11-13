"use client";
import React from 'react';

export default function RidePostCard({ post, onReply }: any) {
  return (
    <div className="p-3 border rounded">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">{post.from_location} → {post.to_location}</div>
          <div className="text-sm text-gray-600">{post.distance_km ? `${post.distance_km} km` : 'Distance: manual'}</div>
        </div>
        <div className="flex gap-2">
          <a href={`tel:${post.contact}`} className="text-sm bg-blue-600 text-white px-2 py-1 rounded">Call</a>
          <button onClick={() => onReply(post)} className="text-sm bg-green-600 text-white px-2 py-1 rounded">Reply</button>
        </div>
      </div>
    </div>
  );
}
