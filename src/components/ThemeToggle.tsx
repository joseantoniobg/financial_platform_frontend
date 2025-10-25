'use client';

import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 w-full px-3 py-2 hover:cursor-pointer rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group"
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Trocar para modo claro' : 'Trocar para modo escuro'}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-5 w-5 text-yellow-400" />
          <span className="text-sm font-medium text-foreground dark:text-white">Modo Claro</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 text-[gray]" />
          <span className="text-sm font-medium text-foreground dark:text-white">Modo Escuro</span>
        </>
      )}
    </button>
  );
}
