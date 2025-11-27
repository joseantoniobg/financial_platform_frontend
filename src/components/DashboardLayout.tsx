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
      <Sidebar userName={user?.name || ''} />
      <main className="flex-1 lg:ml-64 transition-all duration-300">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
