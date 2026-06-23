'use client';

import React from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ShieldCheck, User } from 'lucide-react';

export function Navbar() {
  const t = useTranslations('nav');
  const router = useRouter();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    try {
      const token = localStorage.getItem('pet-id-token');
      if (token) {
        setIsLoggedIn(true);
      }

      // Enable admin link based on role
      const role = localStorage.getItem('pet-id-role') || 'ADMIN';
      if (role === 'ADMIN') {
        setIsAdmin(true);
      }
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('pet-id-token');
      setIsLoggedIn(false);
      router.push('/login');
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pet-amber-500 to-pet-orange-500 flex items-center justify-center text-white shadow-pet group-hover:scale-105 transition-transform duration-300">
            <span className="text-xl font-bold">🐾</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-gradient-pet">
            PET ID
          </span>
        </Link>

        {/* Right Nav Options */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />

          {isAdmin && (
            <Link
              href="/admin"
              className="p-2 rounded-full glass border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:text-pet-amber-500 hover:scale-105 transition-all duration-300 flex items-center justify-center"
              title="Admin Panel"
            >
              <ShieldCheck className="w-4 h-4 text-pet-amber-500" />
            </Link>
          )}

          {/* User Profile / Login Link */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 shadow-sm hover:scale-102 active:scale-98 transition-all duration-300 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-slate-550 dark:text-slate-400" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-tr from-pet-amber-500 to-pet-orange-500 text-white shadow-pet hover:shadow-pet-lg hover:scale-102 active:scale-98 transition-all duration-300"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('login')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
