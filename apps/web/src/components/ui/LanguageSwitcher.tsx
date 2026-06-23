'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-slate-200/80 dark:border-slate-700/60 shadow-sm focus-within:ring-2 focus-within:ring-pet-amber-400 transition-all duration-300">
      <Globe className="w-4 h-4 text-pet-amber-500 dark:text-pet-amber-400 animate-spin-slow" />
      
      <select
        value={currentLocale}
        onChange={handleLanguageChange}
        className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 border-none outline-none cursor-pointer pr-1"
      >
        {languages.map((lang) => (
          <option
            key={lang.code}
            value={lang.code}
            className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          >
            {lang.flag} {lang.name.substring(0, 3).toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
