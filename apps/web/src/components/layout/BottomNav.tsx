'use client';

import React from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Home, Map, Plus, Calendar, Settings } from 'lucide-react';
import { clsx } from 'clsx';

export function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  // Helper to determine if item is active
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/pets');
    }
    return pathname === path || pathname.startsWith(path);
  };

  const navItems = [
    { label: t('home'), icon: Home, href: '/dashboard' },
    { label: t('map'), icon: Map, href: '/map' },
    { label: 'add', icon: Plus, href: '/pets/new', isCenter: true },
    { label: t('calendar'), icon: Calendar, href: '/calendar' },
    { label: t('settings'), icon: Settings, href: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-strong border-t border-slate-200/80 dark:border-slate-800/80 shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto relative px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          if (item.isCenter) {
            return (
              <div key="center-button" className="relative -top-4 z-50">
                <Link
                  href={item.href}
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-pet-amber-500 to-pet-orange-500 text-white flex items-center justify-center shadow-pet-lg hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-pet-cream dark:border-slate-900"
                  aria-label="Add Pet"
                >
                  <Plus className="w-6 h-6" />
                </Link>
              </div>
            );
          }

          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-all duration-300',
                active
                  ? 'text-pet-amber-500 dark:text-pet-amber-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              )}
            >
              <Icon className={clsx('w-5 h-5 mb-0.5', active && 'scale-110')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
