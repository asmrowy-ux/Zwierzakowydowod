'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';

export const runtime = 'edge';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError(t('confirmPassword') + ' does not match');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the terms');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: name,
          email,
          password,
          locale: 'pl', // Default locale
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Registration failed');
      }

      // Store tokens
      localStorage.setItem('pet-id-token', result.data.accessToken);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pet-amber-50 to-pet-orange-50 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Paws */}
      <div className="absolute top-10 right-10 text-pet-amber-500/10 dark:text-slate-800/20 text-8xl pointer-events-none select-none">🐾</div>
      <div className="absolute bottom-10 left-10 text-pet-amber-500/10 dark:text-slate-800/20 text-8xl pointer-events-none select-none">🐾</div>

      <Card className="w-full max-w-md relative z-10 glass border border-slate-200/60 dark:border-slate-800/80 shadow-pet-lg p-8">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex w-12 h-12 rounded-full bg-gradient-to-tr from-pet-amber-500 to-pet-orange-500 items-center justify-center text-white text-2xl shadow-pet mb-4 hover:scale-105 transition-transform duration-300">
            🐾
          </Link>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-850 dark:text-white">
            {t('registerTitle')}
          </CardTitle>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            {t('registerSubtitle')}
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
            label={t('name')}
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label={t('email')}
            type="email"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label={t('password')}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label={t('confirmPassword')}
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="flex items-start gap-2 py-1">
            <input
              id="agreeTerms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-pet-amber-600 focus:ring-pet-amber-400 cursor-pointer"
              required
            />
            <label htmlFor="agreeTerms" className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer font-medium leading-normal select-none">
              {t('termsAgree')}
            </label>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {t('registerButton')}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {t('hasAccount')}{' '}
          <Link href="/login" className="text-pet-amber-600 dark:text-pet-amber-400 hover:underline font-bold">
            {t('signInLink')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
