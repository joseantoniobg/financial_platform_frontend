'use client';

import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/DashboardLayout';
import { HomeInfo } from '@/components/HomeInfo';

export default function HomePage() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      {user && <HomeInfo user={user} showWelcomeMessage={true} />}
    </DashboardLayout>
  );
}
