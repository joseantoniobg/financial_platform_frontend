'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Home,
  LogOut,
  Menu,
  Briefcase
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  userName: string;
}

export function Sidebar({ userName }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    window.location.href = '/login';
  };

  // Check if user has Administrador role
  const isAdmin = user?.roles?.some(role => role.name === 'Administrador');

  // Define menu items
  const allMenuItems = [
    { icon: Home, label: 'Dashboard', href: '/home', roles: ['all'] },
    { icon: Users, label: 'Usuários', href: '/users', roles: ['Administrador'] },
    { icon: Briefcase, label: 'Serviços', href: '/services', roles: ['Administrador'] },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    item.roles.includes('all') || (isAdmin && item.roles.includes('Administrador'))
  );

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg"
      >
        <Menu className="h-6 w-6 text-slate-700 dark:text-white" />
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full bg-white dark:bg-[#0D2744] border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 z-40
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                Plataforma
              </h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hidden lg:block"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 text-slate-700 dark:text-white" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-slate-700 dark:text-white" />
              )}
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            {!isCollapsed ? (
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white">
                  Olá, {userName}
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                  {user?.roles && user.roles.reduce((acc, role) => acc + role.name + ' ', '')}
                </p>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#B4F481] dark:bg-[#B4F481] flex items-center justify-center">
                <span className="text-[#0A1929] font-bold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${active 
                      ? 'bg-[#B4F481] text-[#0A1929] dark:bg-[#B4F481] dark:text-[#0A1929]' 
                      : 'text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-start'} mb-2`}>
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full
                text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Sair</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
