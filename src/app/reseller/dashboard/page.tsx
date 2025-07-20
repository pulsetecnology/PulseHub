'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNextAuth } from '@/hooks/useNextAuth';

export default function ResellerDashboard() {
  const router = useRouter();
  const { user } = useNextAuth();

  useEffect(() => {
    // Redirecionar para a página de produtos
    router.push('/reseller/products');
  }, [router]);

  return null;
}