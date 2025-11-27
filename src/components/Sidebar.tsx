'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  Home,
  LogOut,
  Menu,
  Briefcase,
  UserCog,
  MapPin,
  Tag,
  Receipt,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  Wallet,
  FileText,
  User,
  UserCog2,
  CoinsIcon,
  Target
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from './ThemeToggle';
import { useThemeStore } from '@/store/themeStore';

interface SidebarProps {
  userName?: string;
}

export function Sidebar({ userName }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { expandableMenus: expandedMenus, setExpandableMenus: setExpandedMenus } = useThemeStore();
  const pathname = usePathname();
  const searchParams = useSearchParams()

  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    window.location.href = '/login';
  };

  const userRoleNames = user?.roles?.map(role => role.name) ?? [];

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(menuId);
  };

  const allMenuItems = [
    { icon: Home, label: 'Dashboard', href: '/home', roles: ['all'] },
    { icon: Users, label: 'Usuários', href: '/users', roles: ['Administrador'] },
    { icon: UserCheck, label: 'Clientes', href: '/clientes', roles: ['Administrador', 'Consultor'] },
    { icon: Briefcase, label: 'Serviços', href: '/services', roles: ['Administrador', 'Consultor'] },
    { icon: UserCog, label: 'Atribuições', href: '/client-assignments', roles: ['Administrador', 'Consultor'] },
    { icon: MapPin, label: 'Localidades', href: '/locations', roles: ['Administrador', 'Consultor'] },
  ];

  const clientExpandableMenus = [
    {
      id: 'lancamentos',
      icon: FileText,
      label: 'Lançamentos',
      roles: ['Cliente'],
      items: [
        { icon: Target, label: 'Meus Objetivos', href: `/clientes/${user?.sub}?module=planejamento` },
        { icon: Wallet, label: 'Carteiras', href: '/carteiras' },
        { icon: Tag, label: 'Categorias', href: '/transaction-categories' },
        { icon: Receipt, label: 'Transações', href: '/transactions' },
      ],
    },
    {
      id: 'perfil',
      icon: User,
      label: 'Perfil',
      roles: ['Cliente'],
      items: [
        { icon: UserCog2, label: 'Meus Dados', href: `/clientes/${user?.sub}?module=dados-cadastrais` },
        { icon: CoinsIcon, label: 'Meu Patrimônio', href: `/clientes/${user?.sub}?module=patrimonio` },
        { icon: TrendingUp, label: 'Perfil de Investidor', href: '/perfil-investidor' },
        { icon: ShieldCheck, label: 'Conformidade (PLD/CPFT + PEP)', href: '/conformidade' },
      ],
    },
  ];

  const menuItems = allMenuItems.filter(item => 
    item.roles.includes('all') || item.roles.some(role => userRoleNames.includes(role))
  );

  const expandableMenus = clientExpandableMenus.filter(menu =>
    menu.roles.some(role => userRoleNames.includes(role))
  );

  const isActive = (href: string) => `${pathname}${searchParams.toString() !== "" ? '?' + searchParams.toString() : ''}` === href;

  return (
    <Suspense fallback={<div>Carregando...</div>}>
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
          fixed left-0 top-0 h-full bg-[hsl(var(--nav-background))] border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 z-40
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-[hsl(var(--app-border))] flex items-center justify-between">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-[hsl(var(--nav-foreground))]">
                Plataforma
              </h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-[hsl(var(--hover))] transition-colors hidden lg:block"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 text-[hsl(var(--nav-foreground))]" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-[hsl(var(--nav-foreground))]" />
              )}
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-[hsl(var(--app-border))]">
            {!isCollapsed ? (
              <div>
                <p className="text-sm font-medium text-[hsl(var(--nav-foreground))]">
                  Olá, {userName}
                </p>
                <p className="text-xs text-[hsl(var(--nav-foreground))] mt-1">
                  {user?.roles && user.roles.reduce((acc, role) => acc + role.name + ' ', '')}
                </p>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--nav-foreground))] flex items-center justify-center">
                <span className="text-[hsl(var(--nav-background))] font-bold text-sm">
                  {userName && userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {/* Regular menu items */}
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
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--nav-foreground))]' 
                      : 'text-[hsl(var(--nav-foreground))] hover:bg-[hsl(var(--hover))]'
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

            {/* Expandable menus for Cliente */}
            {!isCollapsed && expandableMenus.map((menu) => {
              const MenuIcon = menu.icon;
              const isExpanded = expandedMenus[menu.id];
              const hasActiveItem = menu.items.some(item => isActive(item.href));
              
              return (
                <div key={menu.id}>
                  <button
                    onClick={() => toggleMenu(menu.id)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full
                      ${hasActiveItem
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--nav-foreground))]'
                        : 'text-[hsl(var(--nav-foreground))] hover:bg-[hsl(var(--hover))]'
                      }
                    `}
                  >
                    <MenuIcon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium flex-1 text-left">{menu.label}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  <div
                    className={`
                      overflow-hidden transition-all duration-300 ease-in-out
                      bg-[hsl(var(--nav-foreground))]/10 rounded-lg
                      ${isExpanded ? 'p-2 m-2 space-y-1 max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    {menu.items.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isActive(item.href);
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm
                            ${active
                              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--nav-foreground))]'
                              : 'text-[hsl(var(--nav-foreground))] hover:bg-[hsl(var(--hover))]'
                            }
                          `}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <ItemIcon className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Collapsed expandable menu items - show as flat list */}
            {isCollapsed && expandableMenus.flatMap(menu => menu.items).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors justify-center
                    ${active 
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--nav-foreground))]' 
                      : 'text-[hsl(var(--nav-foreground))] hover:bg-[hsl(var(--hover))]'
                    }
                  `}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
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
    </Suspense>
  );
}
