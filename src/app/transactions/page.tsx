'use client';

import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Transactions } from '@/components/Transactions';

export default function TransactionsPage() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
       {user && <Transactions user={user} showSubTitle={true} />}
    </DashboardLayout>
  );
}
