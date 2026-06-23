'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Select, Textarea } from '@/components/ui/Input';
import { ArrowLeft, ArrowRight, Save, Image, Check, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const runtime = 'edge';

export default function NewPetPage() {
  const t = useTranslations('pet');
  const tCommon = useTranslations('common');
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('unknown');
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [finderNote, setFinderNote] = useState('');

  // Visibility Checkboxes (Ptaszki)
  const [visibility, setVisibility] = useState({
    showName: true,
    showSpecies: true,
    showPhoto: true,
    showPhone: true,
    showEmail: false,
    showAddress: false,
    showMedicalInfo: true,
    showMicrochip: false,
    showFinderNote: true,
    showFoundButton: true,
  });

  const handleVisibilityChange = (key: keyof typeof visibility) => {
    setVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In production: POST /api/pets
      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pet-id-token') || ''}`,
        },
        body: JSON.stringify({
          name,
          species,
          breed,
          birthDate: birthDate ? new Date(birthDate).toISOString() : null,
          gender,
          weight: weight ? parseFloat(weight) : null,
          color,
          microchipNumber,
          finderNote,
          visibilitySettings: visibility,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to save pet');
      }

      router.push('/dashboard');
    } catch (err) {
      alert('Error creating pet. Redirecting to dashboard...');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative z-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="p-2">
          <Link href="/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">
            {t('stepBasicInfo')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create a secure identifier profile for your pet.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-pet-amber-500 to-pet-orange-500 h-full transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Step Info */}
      <div className="flex justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 px-1">
        <span className={step >= 1 ? 'text-pet-amber-500 dark:text-pet-amber-400' : ''}>
          {t('stepBasicInfo')}
        </span>
        <span className={step >= 2 ? 'text-pet-amber-500 dark:text-pet-amber-400' : ''}>
          {t('stepPhotos')}
        </span>
        <span className={step >= 3 ? 'text-pet-amber-500 dark:text-pet-amber-400' : ''}>
          {t('stepVisibility')}
        </span>
      </div>

      {/* Form Card */}
      <Card className="glass p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label={t('name')}
                placeholder="Reksio"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label={t('species')}
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  options={[
                    { value: 'dog', label: t('dog') },
                    { value: 'cat', label: t('cat') },
                    { value: 'bird', label: t('bird') },
                    { value: 'rabbit', label: t('rabbit') },
                    { value: 'other', label: t('other') },
                  ]}
                />

                <Input
                  label={t('breed')}
                  placeholder="Golden Retriever"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('birthDate')}
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />

                <Select
                  label={t('gender')}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  options={[
                    { value: 'male', label: t('male') },
                    { value: 'female', label: t('female') },
                    { value: 'unknown', label: 'Unknown' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('weight') + ' (kg)'}
                  type="number"
                  step="0.1"
                  placeholder="12.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />

                <Input
                  label={t('color')}
                  placeholder="Gold/Cream"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>

              <Input
                label="Microchip Number"
                placeholder="900115000123456"
                value={microchipNumber}
                onChange={(e) => setMicrochipNumber(e.target.value)}
              />
            </div>
          )}

          {/* Step 2: Photo Upload Area */}
          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-sm font-display font-semibold text-pet-warm-700 dark:text-slate-300">
                {t('photo')}
              </label>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pet-amber-500 transition-colors duration-300 bg-white/30 dark:bg-slate-900/30">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
                  <Image className="w-5 h-5 text-slate-500" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                  {t('dragPhoto')}
                </p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
              </div>

              <Textarea
                label="Finder Note / Message (instructions for someone who finds your pet)"
                placeholder="He is very friendly but afraid of storms. Please call my number immediately!"
                value={finderNote}
                onChange={(e) => setFinderNote(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {/* Step 3: Visibility Flags (Ptaszki) & Preview */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white">
                  {t('visibilityTitle')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t('visibilityDesc')}
                </p>
              </div>

              {/* Checkbox Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg select-none">
                  <input
                    type="checkbox"
                    checked={visibility.showName}
                    onChange={() => handleVisibilityChange('showName')}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-pet-amber-600 focus:ring-pet-amber-400"
                  />
                  <span className="text-xs font-semibold text-slate-750 dark:text-slate-300">Show Name</span>
                </label>

                <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg select-none">
                  <input
                    type="checkbox"
                    checked={visibility.showPhone}
                    onChange={() => handleVisibilityChange('showPhone')}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-pet-amber-600 focus:ring-pet-amber-400"
                  />
                  <span className="text-xs font-semibold text-slate-750 dark:text-slate-300">{t('showPhone')}</span>
                </label>

                <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg select-none">
                  <input
                    type="checkbox"
                    checked={visibility.showEmail}
                    onChange={() => handleVisibilityChange('showEmail')}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-pet-amber-600 focus:ring-pet-amber-400"
                  />
                  <span className="text-xs font-semibold text-slate-750 dark:text-slate-300">{t('showEmail')}</span>
                </label>

                <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg select-none">
                  <input
                    type="checkbox"
                    checked={visibility.showAddress}
                    onChange={() => handleVisibilityChange('showAddress')}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-pet-amber-600 focus:ring-pet-amber-400"
                  />
                  <span className="text-xs font-semibold text-slate-750 dark:text-slate-300">{t('showAddress')}</span>
                </label>

                <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg select-none">
                  <input
                    type="checkbox"
                    checked={visibility.showMedicalInfo}
                    onChange={() => handleVisibilityChange('showMedicalInfo')}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-pet-amber-600 focus:ring-pet-amber-400"
                  />
                  <span className="text-xs font-semibold text-slate-750 dark:text-slate-300">{t('showMedical')}</span>
                </label>

                <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg select-none">
                  <input
                    type="checkbox"
                    checked={visibility.showFinderNote}
                    onChange={() => handleVisibilityChange('showFinderNote')}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-pet-amber-600 focus:ring-pet-amber-400"
                  />
                  <span className="text-xs font-semibold text-slate-750 dark:text-slate-300">Show Instructions</span>
                </label>
              </div>

              {/* Public Preview Overlay */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Live Preview of Public Page
                </h4>
                
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/40 p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-display text-lg font-bold text-slate-850 dark:text-white">
                        {visibility.showName ? (name || 'Pet Name') : '🐾 PROTECTED PROFILE'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                        {breed || species}
                      </p>
                    </div>
                    <Badge variant="lost">LOST</Badge>
                  </div>

                  {visibility.showFinderNote && finderNote && (
                    <div className="p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      📢 {finderNote}
                    </div>
                  )}

                  <div className="space-y-2 text-xs">
                    {visibility.showPhone && (
                      <p className="text-slate-600 dark:text-slate-400 font-semibold">
                        📞 Phone: <span className="text-slate-800 dark:text-white font-bold">+48 123 456 789</span>
                      </p>
                    )}
                    {visibility.showEmail && (
                      <p className="text-slate-600 dark:text-slate-400 font-semibold">
                        ✉️ Email: <span className="text-slate-800 dark:text-white font-bold">owner@mail.com</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200/40 dark:border-slate-800/40">
            <Button
              variant="outline"
              type="button"
              onClick={handlePrevStep}
              className={step === 1 ? 'invisible' : ''}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              {tCommon('back')}
            </Button>

            {step < 3 ? (
              <Button
                variant="primary"
                type="button"
                onClick={handleNextStep}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                {tCommon('next')}
              </Button>
            ) : (
              <Button
                variant="secondary"
                type="submit"
                isLoading={isLoading}
                icon={<Save className="w-4 h-4" />}
              >
                {tCommon('save')}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
