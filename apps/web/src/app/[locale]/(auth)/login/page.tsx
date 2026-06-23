'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export const runtime = 'edge';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // API Login call placeholder
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Login failed');
      }

      // Store tokens
      localStorage.setItem('pet-id-token', result.data.accessToken);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pet-amber-50 to-pet-orange-50 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Paws in Background */}
      <div className="absolute top-10 left-10 text-pet-amber-500/10 dark:text-slate-800/20 text-8xl pointer-events-none select-none">🐾</div>
      <div className="absolute bottom-10 right-10 text-pet-amber-500/10 dark:text-slate-800/20 text-8xl pointer-events-none select-none">🐾</div>

      <Card className="w-full max-w-md relative z-10 glass border border-slate-200/60 dark:border-slate-800/80 shadow-pet-lg p-8">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex w-12 h-12 rounded-full bg-gradient-to-tr from-pet-amber-500 to-pet-orange-500 items-center justify-center text-white text-2xl shadow-pet mb-4 hover:scale-105 transition-transform duration-300">
            🐾
          </Link>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-850 dark:text-white">
            {t('loginTitle')}
          </CardTitle>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            {t('loginSubtitle')}
          </p>
        </CardHeader>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 flex items-start gap-2 text-red-650 dark:text-red-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('email')}
            type="email"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-display font-semibold text-pet-warm-700 dark:text-slate-300">
                {t('password')}
              </label>
              <Link
                href="#"
                className="text-xs text-pet-amber-600 dark:text-pet-amber-400 hover:underline font-semibold"
              >
                {t('forgotPassword')}
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {t('loginButton')}
          </Button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <span className="relative bg-white dark:bg-slate-800/90 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            {t('googleButton').split(' ')[0]} {t('googleButton').split(' ')[1] || 'OR'}
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
          type="button"
          onClick={() => {
            window.location.href = '/api/auth/google';
          }}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{t('googleButton')}</span>
        </Button>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {t('noAccount')}{' '}
          <Link href="/register" className="text-pet-amber-600 dark:text-pet-amber-400 hover:underline font-bold">
            {t('signUpLink')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
