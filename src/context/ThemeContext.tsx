'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { sound } from '@/lib/sound';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ceylon_theme') as Theme;
      if (stored === 'dark' || stored === 'light') {
        setThemeState(stored);
        applyTheme(stored);
      } else {
        applyTheme('dark');
      }
    } catch (_e) {
      applyTheme('dark');
    }
    setMounted(true);
  }, []);

  const applyTheme = (t: Theme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;
      root.classList.remove('dark', 'light');
      root.classList.add(t);
      root.setAttribute('data-theme', t);
      if (body) {
        body.classList.remove('dark', 'light');
        body.classList.add(t);
        body.setAttribute('data-theme', t);
      }
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    try {
      localStorage.setItem('ceylon_theme', newTheme);
    } catch (_e) {}
  };

  const toggleTheme = () => {
    sound.playClick();
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
