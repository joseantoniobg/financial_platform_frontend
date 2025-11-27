import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  expandableMenus: Record<string, boolean>;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setExpandableMenus: (menuId: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      expandableMenus: {
        lancamentos: true,
        perfil: true,
      },
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'dark' ? 'light' : 'dark' 
      })),
      setTheme: (theme: Theme) => set({ theme }),
      setExpandableMenus: (menuId: string) => set((state) => ({
        expandableMenus: {
          ...state.expandableMenus,
          [menuId]: !state.expandableMenus[menuId],
        }
      })),
    }),
    {
      name: 'theme-storage',
    }
  )
);
