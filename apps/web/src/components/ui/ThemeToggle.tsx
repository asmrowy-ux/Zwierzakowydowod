'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Detect theme on mount
    const root = window.document.documentElement;
    const isDark = root.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    
    if (nextTheme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('pet-id-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('pet-id-theme', 'light');
    }
    
    setTheme(nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full glass border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:text-pet-amber-500 dark:hover:text-pet-amber-400 shadow-sm hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pet-amber-400"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 transition-transform duration-500 hover:rotate-12" />
      ) : (
        <Sun className="w-4 h-4 transition-transform duration-500 hover:rotate-45" />
      )}
    </button>
  );
}
