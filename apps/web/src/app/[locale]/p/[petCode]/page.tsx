import React from 'react';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { Phone, Mail, Heart, AlertTriangle, MessageSquare, Send, Check } from 'lucide-react';
import { FinderForm } from './FinderForm';

export const runtime = 'edge';

interface PublicPetPageProps {
  params: Promise<{
    locale: string;
    petCode: string;
  }>;
  searchParams: Promise<{
    reported?: string;
  }>;
}

// Fetch pet data from API or fall back to mock data
async function getPetData(petCode: string) {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${API_URL}/api/pets/public/${petCode}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    if (res.ok) {
      const result = await res.json();
      return result.data;
    }
  } catch (e) {
    console.error('API connection failed, falling back to mock data for layout demo');
  }

  // Fallback mock data for visual demonstration
  if (petCode.startsWith('PET-')) {
    return {
      id: 'mock-id',
      petCode,
      name: 'Reksio',
      species: 'dog',
      breed: 'Golden Retriever',
      status: 'lost',
      profilePhotoUrl: null,
      finderNote: 'Bardzo przyjacielski pies. Boi się burzy. Proszę o natychmiastowy kontakt telefoniczny!',
      microchipNumber: '900115000123456',
      medicalInfo: {
        allergies: ['Kurczak'],
        diseases: ['Padaczka'],
        medications: ['Luminal 2x dziennie'],
      },
      visibilitySettings: {
        showName: true,
        showSpecies: true,
        showPhoto: true,
        showPhone: true,
        showEmail: true,
        showAddress: false,
        showMedicalInfo: true,
        showMicrochip: true,
        showFinderNote: true,
        showFoundButton: true,
      },
      owner: {
        phone: '+48 500 600 700',
        email: 'wlasciciel@example.com',
      },
    };
  }

  return null;
}

export default async function PublicPetPage({ params, searchParams }: PublicPetPageProps) {
  const { locale, petCode } = await params;
  const { reported } = await searchParams;
  
  const pet = await getPetData(petCode);
  if (!pet) {
    notFound();
  }

  // Load translations manually in Server Component
  const messages = (await getMessages()) as any;
  const t = (key: string) => {
    const keys = key.split('.');
    let value = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const isLost = pet.status === 'lost';
  const showReportedSuccess = reported === 'success';

  return (
    <div className="min-h-screen bg-gradient-to-b from-pet-cream to-slate-100 dark:from-slate-900 dark:to-slate-950 pb-16">
      {/* Top Banner */}
      <div className="w-full bg-gradient-to-r from-pet-amber-500 to-pet-orange-500 text-white text-center py-3 px-4 font-display font-bold text-sm shadow-sm flex items-center justify-center gap-2">
        <span>🐾</span>
        {t('common.appName')} — {t('common.tagline')}
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6 space-y-6">
        {/* Success Banner */}
        {showReportedSuccess && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-2xl flex items-center gap-3 text-green-800 dark:text-green-300 font-semibold text-sm animate-scale-in">
            <Check className="w-5 h-5 text-green-500 shrink-0" />
            <div>
              <p>{t('common.success')}</p>
              <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                Właściciel został powiadomiony. Dziękujemy za zgłoszenie!
              </p>
            </div>
          </div>
        )}

        {/* Pet Card Header */}
        <Card className="glass overflow-hidden p-6 relative">
          <div className="absolute top-6 right-6">
            <Badge variant={pet.status}>
              {t(`status.${pet.status}`)}
            </Badge>
          </div>

          <div className="flex gap-4 items-center">
            {/* Visual Profile */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-pet-amber-100 to-pet-orange-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-4xl shadow-sm shrink-0 border border-slate-200/50 dark:border-slate-700/50">
              {pet.species === 'dog' ? '🐶' : pet.species === 'cat' ? '🐱' : '🐾'}
            </div>

            <div className="space-y-1">
              <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">
                {pet.visibilitySettings.showName ? pet.name : '🐾 PROTECTED PROFILE'}
              </h1>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {pet.breed || t(`pet.${pet.species}`)}
              </p>
              <p className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono font-bold tracking-tight inline-block border border-slate-200/60 dark:border-slate-700/50">
                {pet.petCode}
              </p>
            </div>
          </div>
        </Card>

        {/* Finder Message Note */}
        {pet.visibilitySettings.showFinderNote && pet.finderNote && (
          <Card className="border border-red-200/60 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10 p-6 space-y-3">
            <h3 className="font-display font-bold text-red-650 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t('publicProfile.finderNote')}
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
              &ldquo;{pet.finderNote}&rdquo;
            </p>
          </Card>
        )}

        {/* Owner Contact */}
        <Card className="glass p-6 space-y-4">
          <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm">
            {t('publicProfile.contactOwner')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pet.visibilitySettings.showPhone && pet.owner.phone && (
              <a
                href={`tel:${pet.owner.phone}`}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-pet-amber-50 dark:bg-slate-800 text-pet-amber-700 dark:text-pet-amber-400 border border-pet-amber-200/60 dark:border-slate-700 hover:scale-102 transition-transform duration-300 font-semibold text-sm"
              >
                <Phone className="w-4 h-4" />
                {t('publicProfile.call')}
              </a>
            )}

            {pet.visibilitySettings.showEmail && pet.owner.email && (
              <a
                href={`mailto:${pet.owner.email}`}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-pet-teal-50 dark:bg-slate-800 text-pet-teal-700 dark:text-pet-teal-400 border border-pet-teal-200/60 dark:border-slate-700 hover:scale-102 transition-transform duration-300 font-semibold text-sm"
              >
                <Mail className="w-4 h-4" />
                {t('publicProfile.sendEmail')}
              </a>
            )}
          </div>
        </Card>

        {/* Medical Info Section */}
        {pet.visibilitySettings.showMedicalInfo && pet.medicalInfo && (
          <Card className="glass p-6 space-y-4">
            <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <Heart className="w-4.5 h-4.5 text-red-500" />
              {t('publicProfile.medicalInfo')}
            </h3>

            <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {pet.medicalInfo.allergies && pet.medicalInfo.allergies.length > 0 && (
                <div className="pt-2 flex justify-between gap-4">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {t('publicProfile.allergies')}:
                  </span>
                  <span className="text-slate-800 dark:text-white font-bold text-right">
                    {pet.medicalInfo.allergies.join(', ')}
                  </span>
                </div>
              )}

              {pet.medicalInfo.medications && pet.medicalInfo.medications.length > 0 && (
                <div className="pt-2 flex justify-between gap-4">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {t('publicProfile.medications')}:
                  </span>
                  <span className="text-slate-800 dark:text-white font-bold text-right">
                    {pet.medicalInfo.medications.join(', ')}
                  </span>
                </div>
              )}

              {pet.microchipNumber && pet.visibilitySettings.showMicrochip && (
                <div className="pt-2 flex justify-between gap-4">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    Microchip:
                  </span>
                  <span className="text-slate-800 dark:text-white font-mono font-bold">
                    {pet.microchipNumber}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* "I Found This Pet!" Location Report Submission Form */}
        {pet.visibilitySettings.showFoundButton && (
          <Card className="border border-pet-orange-200 bg-white/60 dark:bg-slate-900/60 p-6 space-y-4">
            <div className="text-center sm:text-left">
              <h3 className="font-display font-bold text-pet-orange-600 dark:text-pet-orange-400 text-lg">
                {t('publicProfile.foundButton')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('publicProfile.foundDesc')}
              </p>
            </div>

            {/* Form Component (handles GPS logic on client-side) */}
            <FinderForm petCode={pet.petCode} />
          </Card>
        )}
      </div>
    </div>
  );
}
