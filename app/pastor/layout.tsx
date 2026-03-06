'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PastorLayout } from '@/components/PastorLayout';

export default function PastorRootLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (role === 'admin') {
      router.replace('/admin');
    }
  }, [isAuthenticated, role, router]);

  if (!isAuthenticated || role !== 'pastor') return null;

  return <PastorLayout>{children}</PastorLayout>;
}
