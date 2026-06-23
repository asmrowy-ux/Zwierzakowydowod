'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Scan, Map, Calendar, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export const runtime = 'edge';

export default function LandingPage() {
  const tCommon = useTranslations('common');
  const tLanding = useTranslations('landing');
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem('pet-id-token');
      if (token) {
        router.replace('/dashboard');
      }
    } catch (e) {}
  }, [router]);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden paw-bg">
      {/* CSS-Only Floating Paw Particles */}
      <div className="floating-paws" aria-hidden="true">
        <span>🐾</span>
        <span>🐾</span>
        <span>🐾</span>
        <span>🐾</span>
        <span>🐾</span>
        <span>🐾</span>
        <span>🐾</span>
        <span>🐾</span>
      </div>

      <Navbar />

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-slate-200/80 dark:border-slate-800/80 mb-6 animate-float">
            <span className="flex h-2 w-2 rounded-full bg-pet-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide uppercase">
              {tCommon('tagline')}
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            <span className="text-gradient-pet block sm:inline">{tLanding('heroTitle')}</span>
          </h1>
          
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {tLanding('heroSubtitle')}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/register" className="flex items-center gap-2">
                {tLanding('ctaGetStarted')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="#how-it-works">{tLanding('ctaLearnMore')}</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/40 dark:border-slate-800/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="hover-card flex flex-col items-center text-center p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-pet-amber-100 dark:bg-pet-amber-950/40 flex items-center justify-center text-pet-amber-600 dark:text-pet-amber-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Scan className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-800 dark:text-white mb-3">
                {tLanding('featureNfc')}
              </h3>
              <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed">
                {tLanding('featureNfcDesc')}
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="hover-card flex flex-col items-center text-center p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-pet-teal-100 dark:bg-pet-teal-950/40 flex items-center justify-center text-pet-teal-600 dark:text-pet-teal-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-800 dark:text-white mb-3">
                {tLanding('featureMap')}
              </h3>
              <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed">
                {tLanding('featureMapDesc')}
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="hover-card flex flex-col items-center text-center p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-pet-orange-100 dark:bg-pet-orange-950/40 flex items-center justify-center text-pet-orange-600 dark:text-pet-orange-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-800 dark:text-white mb-3">
                {tLanding('featureCalendar')}
              </h3>
              <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed">
                {tLanding('featureCalendarDesc')}
              </p>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-slate-50 dark:bg-slate-900/40 py-20 border-y border-slate-200/40 dark:border-slate-800/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white text-center mb-16">
              {tLanding('howItWorksTitle')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-12 h-12 rounded-full bg-pet-amber-500 text-white font-bold flex items-center justify-center text-lg shadow-pet mb-6">
                  1
                </div>
                <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white mb-2">
                  {tLanding('step1Title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-350 text-sm max-w-xs">
                  {tLanding('step1Desc')}
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-12 h-12 rounded-full bg-pet-teal-505 bg-pet-teal-500 text-white font-bold flex items-center justify-center text-lg shadow-pet-teal mb-6">
                  2
                </div>
                <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white mb-2">
                  {tLanding('step2Title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-350 text-sm max-w-xs">
                  {tLanding('step2Desc')}
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-12 h-12 rounded-full bg-pet-orange-500 text-white font-bold flex items-center justify-center text-lg shadow-md mb-6">
                  3
                </div>
                <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white mb-2">
                  {tLanding('step3Title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-350 text-sm max-w-xs">
                  {tLanding('step3Desc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="font-display text-2xl font-bold text-slate-950 dark:text-white mb-12">
            {tLanding('statsTitle')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <p className="font-display text-4xl font-extrabold text-pet-amber-500">10,000+</p>
              <p className="text-slate-650 dark:text-slate-400 text-sm mt-2">{tLanding('statsPets')}</p>
            </div>
            <div>
              <p className="font-display text-4xl font-extrabold text-pet-teal-500">50,000+</p>
              <p className="text-slate-650 dark:text-slate-400 text-sm mt-2">{tLanding('statsScans')}</p>
            </div>
            <div>
              <p className="font-display text-4xl font-extrabold text-pet-orange-500">2,400+</p>
              <p className="text-slate-650 dark:text-slate-400 text-sm mt-2">{tLanding('statsFound')}</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/40 dark:border-slate-800/40 bg-white dark:bg-slate-950 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="font-display font-extrabold text-slate-800 dark:text-white text-sm">
              PET ID
            </span>
            <span className="text-slate-400 dark:text-slate-600 text-xs">|</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              {tLanding('footerTagline')}
            </span>
          </div>

          <div className="flex gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link href="#" className="hover:text-pet-amber-500 transition-colors">
              {tLanding('footerPrivacy')}
            </Link>
            <Link href="#" className="hover:text-pet-amber-500 transition-colors">
              {tLanding('footerTerms')}
            </Link>
            <Link href="#" className="hover:text-pet-amber-500 transition-colors">
              {tLanding('footerContact')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
