"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserTransactionTypesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the merged categories page
    router.replace('/transaction-categories');
  }, [router]);

  return null;
}
