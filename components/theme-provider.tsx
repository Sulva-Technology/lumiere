'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'theme';

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initialTheme = storedTheme ?? (mediaQuery.matches ? 'dark' : 'light');

    setTheme(initialTheme);
    applyTheme(initialTheme);

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (!savedTheme) {
        const nextTheme = event.matches ? 'dark' : 'light';
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      applyTheme(newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
