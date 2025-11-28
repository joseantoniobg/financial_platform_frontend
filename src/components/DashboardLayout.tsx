'use client';

import { useAuthStore } from '@/store/authStore';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore();

  return (
    <div className="flex min-h-screen bg-background transition-colors">
      <Sidebar userName={user?.name || ''}>
        {children}
      </Sidebar>
    </div>
  );
}
