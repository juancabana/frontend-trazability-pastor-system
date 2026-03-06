'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (role === 'pastor') {
      router.replace('/pastor');
    }
  }, [isAuthenticated, role, router]);

  if (!isAuthenticated || role !== 'admin') return null;

  return <AdminLayout>{children}</AdminLayout>;
}
