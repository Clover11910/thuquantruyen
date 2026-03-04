'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/login');
      else if (user.role !== 'admin') router.push('/library');
    }
  }, [user, loading, router]);

  if (loading) return <LoadingSpinner text="Đang xác thực..." />;
  if (!user || user.role !== 'admin') return null;

  return children;
}