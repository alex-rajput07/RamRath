"use client";
import { useEffect } from 'react';
import Lottie from 'lottie-react';
import logo from '../../public/assets/logo.json';
import { useRouter } from 'next/navigation';

export default function Splash() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.replace('/'), 1000);
    return () => clearTimeout(t);
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-40 h-40">
        <Lottie animationData={logo} loop={false} />
      </div>
    </div>
  );
}
