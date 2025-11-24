'use client';

import { useSearchParams, redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  // Block admin signup - redirect to login
  useEffect(() => {
    if (role === 'admin') {
      redirect('/login?role=admin');
    }
  }, [role]);

  // Default redirect for non-admin
  redirect('/login?tab=signup');
}

