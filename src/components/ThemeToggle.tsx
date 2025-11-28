'use client';

import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { Button } from './ui/button';

export function ThemeToggle({ isCollapsed }: { isCollapsed: boolean }) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Trocar para modo claro' : 'Trocar para modo escuro'}
      className='flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full overflow-hidden'
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-5 w-5 text-yellow-400" />
          {!isCollapsed && <span className="text-sm font-medium text-[hsl(var(--nav-foreground))]">Trocar para Modo Claro</span>}
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 text-[gray]" />
          {!isCollapsed && <span className="text-sm font-medium text-[hsl(var(--nav-foreground))]">Trocar para Modo Escuro</span>}
        </>
      )}
    </Button>
  );
}
