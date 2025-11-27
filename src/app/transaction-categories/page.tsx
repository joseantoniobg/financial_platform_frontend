'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Categories } from '@/components/Categories';

export default function TransactionCategoriesPage() {

  return (
    <DashboardLayout>
      <Categories isClient={true} />
    </DashboardLayout>
  );
}
