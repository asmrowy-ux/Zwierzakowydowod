'use client';

import React from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ShieldCheck, User, LogOut } from 'lucide-react';

export function Navbar() {
  const t = useTranslations('nav');
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userName, setUserName] = React.useState('');

  React.useEffect(() => {
    // Check token on mount and on storage changes
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('pet-id-token');
        setIsLoggedIn(!!token);
      } catch (e) {}
    };

    checkAuth();

    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener('storage', checkAuth);
    
    // Also re-check on focus (in case login happened in same tab)
    const onFocus = () => checkAuth();
    window.addEventListener('focus', onFocus);

    // If logged in, fetch user name
    const fetchUserName = async () => {
      const token = localStorage.getItem('pet-id-token');
      if (!token) return;
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUserName(data.data?.user?.displayName || '');
        }
      } catch (e) {}
    };

    if (localStorage.getItem('pet-id-token')) {
      fetchUserName();
    }

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('pet-id-token');
      localStorage.removeItem('pet-id-role');
      setIsLoggedIn(false);
      setUserName('');
      router.push('/login');
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand Logo — always goes to dashboard if logged in */}
        <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-pet-amber-500 to-pet-orange-500 flex items-center justify-center text-white shadow-pet group-hover:scale-105 transition-transform duration-300">
            <span className="text-lg sm:text-xl font-bold">🐾</span>
          </div>
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-gradient-pet">
            PET ID
          </span>
        </Link>

        {/* Right Nav Options */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <LanguageSwitcher />
          <ThemeToggle />

          {/* User Profile / Login Link */}
          {isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              {/* User name (hidden on small screens) */}
              {userName && (
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-pet-amber-50 dark:bg-slate-800 text-pet-amber-700 dark:text-pet-amber-400 border border-pet-amber-200/60 dark:border-slate-700 hover:bg-pet-amber-100 dark:hover:bg-slate-750 transition-all duration-300"
                >
                  <User className="w-3 h-3" />
                  {userName.split(' ')[0]}
                </Link>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-4 rounded-full text-xs font-semibold bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/20 text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 shadow-sm hover:scale-102 active:scale-98 transition-all duration-300 cursor-pointer"
                title={t('logout')}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 rounded-full text-xs font-semibold bg-gradient-to-tr from-pet-amber-500 to-pet-orange-500 text-white shadow-pet hover:shadow-pet-lg hover:scale-102 active:scale-98 transition-all duration-300"
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
