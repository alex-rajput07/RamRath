"use client";
import Link from 'next/link';
import React from 'react';

export default function Header() {
  return (
    <header className="p-4 border-b bg-white">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold">Ram Rath</Link>
        <nav className="flex gap-3">
          <Link href="/direct-book">Book</Link>
          <Link href="/post-ride">Post Ride</Link>
          <Link href="/driver/dashboard">Driver</Link>
          <Link href="/admin/panel">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
