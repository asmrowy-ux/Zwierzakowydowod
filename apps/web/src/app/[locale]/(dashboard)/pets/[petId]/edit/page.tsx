'use client';

import React, { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Select, Textarea } from '@/components/ui/Input';
import { ArrowLeft, ArrowRight, Save, Image as ImageIcon, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const runtime = 'edge';

interface EditPetPageProps {
  params: Promise<{
    locale: string;
    petId: string;
  }>;
}

export default function EditPetPage({ params }: EditPetPageProps) {
  const t = useTranslations('pet');
  const tCommon = useTranslations('common');
  const router = useRouter();
  
  // Resolve params once
  const resolvedParams = use(params);
  const petId = resolvedParams.petId;

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPet, setIsLoadingPet] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

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
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Visibility Checkboxes
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

  useEffect(() => {
    let cancelled = false;

    const fetchPetData = async () => {
      const token = localStorage.getItem('pet-id-token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`/api/pets/${petId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Nie udało się pobrać danych zwierzaka');
        }

        const result = await res.json();
        const pet = result.data.pet;

        if (cancelled) return;

        setName(pet.name || '');
        setSpecies(pet.species || 'dog');
        setBreed(pet.breed || '');
        if (pet.birthDate) {
          const d = new Date(pet.birthDate);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          setBirthDate(`${year}-${month}-${day}`);
        }
        setGender(pet.gender || 'unknown');
        setWeight(pet.weight ? String(pet.weight) : '');
        setColor(pet.color || '');
        setMicrochipNumber(pet.microchipNumber || '');
        setFinderNote(pet.finderNote || '');
        setProfilePhotoUrl(pet.profilePhotoUrl || null);

        if (pet.visibilitySettings) {
          setVisibility((prev) => ({
            ...prev,
            ...pet.visibilitySettings,
          }));
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Error fetching pet data:', err);
          setLoadError(err.message || 'Błąd podczas pobierania danych');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPet(false);
        }
      }
    };

    fetchPetData();
    return () => { cancelled = true; };
  }, [petId, router]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert('Plik jest zbyt duży. Maksymalny rozmiar to 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const img = new window.Image();
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 400;
              const MAX_HEIGHT = 400;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                setProfilePhotoUrl(dataUrl);
              }
            } catch (err: any) {
              console.error('Canvas processing error:', err);
              alert('Błąd przetwarzania obrazu: ' + err.message);
            }
          };
          img.onerror = () => {
            alert('Nie udało się wczytać pliku graficznego.');
          };
          img.src = event.target?.result as string;
        } catch (err: any) {
          console.error('Reader onload error:', err);
        }
      };
      reader.onerror = () => {
        alert('Błąd odczytu pliku z dysku.');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Photo select error:', err);
      alert('Wystąpił błąd podczas wyboru zdjęcia: ' + err.message);
    }
  };

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
    setSaveSuccess(false);

    const token = localStorage.getItem('pet-id-token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          species,
          breed: breed || null,
          birthDate: birthDate ? new Date(birthDate).toISOString() : null,
          gender,
          weight: weight ? parseFloat(weight) : null,
          color: color || null,
          microchipNumber: microchipNumber || null,
          finderNote: finderNote || null,
          profilePhotoUrl,
          visibilitySettings: visibility,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Nie udało się zaktualizować danych');
      }

      setSaveSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Błąd podczas zapisywania.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPet) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center relative z-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pet-amber-500"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center relative z-10">
        <Card className="glass p-8 max-w-md mx-auto text-center space-y-4">
          <div className="text-4xl">😿</div>
          <h2 className="font-display text-xl font-bold text-slate-800 dark:text-white">
            Błąd ładowania
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{loadError}</p>
          <Button asChild>
            <Link href="/dashboard">Powrót do pulpitu</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 relative z-10 animate-fade-in">
      {/* Save Success */}
      {saveSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-2xl flex items-center gap-3 text-green-800 dark:text-green-300 font-semibold text-sm">
          ✅ Dane zostały zapisane! Przekierowywanie...
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="p-2">
          <Link href="/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-800 dark:text-white truncate">
            Edycja: {name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Zaktualizuj dane i ustawienia widoczności swojego zwierzaka.
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
      <Card className="glass p-4 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                    { value: 'unknown', label: 'Nieznana' },
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
                  placeholder="Złoty/Kremowy"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>

              <Input
                label="Numer mikroczipa"
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
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pet-amber-500 transition-colors duration-300 bg-white/30 dark:bg-slate-900/30 overflow-hidden min-h-[180px]"
              >
                {profilePhotoUrl ? (
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-sm mx-auto">
                    <img src={profilePhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProfilePhotoUrl(null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-md transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
                      <ImageIcon className="w-5 h-5 text-slate-500" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                      {t('dragPhoto')}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG do 5MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              <Textarea
                label="Notatka dla znalazcy (instrukcje dla osoby, która znajdzie Twojego pupila)"
                placeholder="Jest bardzo przyjazny, ale boi się burzy. Proszę natychmiast zadzwonić!"
                value={finderNote}
                onChange={(e) => setFinderNote(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {/* Step 3: Visibility Flags & Preview */}
          {step === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white">
                  {t('visibilityTitle')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t('visibilityDesc')}
                </p>
              </div>

              {/* Checkbox Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 bg-white/40 dark:bg-slate-900/40 p-3 sm:p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                {[
                  { key: 'showName' as const, label: 'Pokaż imię' },
                  { key: 'showPhone' as const, label: t('showPhone') },
                  { key: 'showEmail' as const, label: t('showEmail') },
                  { key: 'showAddress' as const, label: t('showAddress') },
                  { key: 'showMedicalInfo' as const, label: t('showMedical') },
                  { key: 'showFinderNote' as const, label: 'Pokaż notatkę' },
                  { key: 'showMicrochip' as const, label: 'Pokaż mikroczip' },
                  { key: 'showFoundButton' as const, label: 'Pokaż przycisk "Znalazłem"' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg select-none">
                    <input
                      type="checkbox"
                      checked={visibility[key]}
                      onChange={() => handleVisibilityChange(key)}
                      className="h-4 w-4 rounded border-slate-300 text-pet-amber-600 focus:ring-pet-amber-400 accent-amber-500"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
                  </label>
                ))}
              </div>

              {/* Public Preview Overlay */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Podgląd profilu publicznego
                </h4>
                
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 p-4 sm:p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h4 className="font-display text-lg font-bold text-slate-800 dark:text-white truncate">
                        {visibility.showName ? (name || 'Imię pupila') : '🐾 PROFIL CHRONIONY'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                        {breed || species}
                      </p>
                    </div>
                    <Badge variant="home">W domu</Badge>
                  </div>

                  {visibility.showFinderNote && finderNote && (
                    <div className="p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      📢 {finderNote}
                    </div>
                  )}

                  <div className="space-y-2 text-xs">
                    {visibility.showPhone && (
                      <p className="text-slate-600 dark:text-slate-400 font-semibold">
                        📞 Telefon: <span className="text-slate-800 dark:text-white font-bold">+48 *** *** ***</span>
                      </p>
                    )}
                    {visibility.showEmail && (
                      <p className="text-slate-600 dark:text-slate-400 font-semibold">
                        ✉️ Email: <span className="text-slate-800 dark:text-white font-bold">***@mail.com</span>
                      </p>
                    )}
                  </div>

                  {visibility.showFoundButton && (
                    <div className="p-3 bg-pet-orange-50 dark:bg-pet-orange-950/20 border border-pet-orange-200 dark:border-pet-orange-800/30 rounded-xl text-center">
                      <span className="text-xs font-bold text-pet-orange-600 dark:text-pet-orange-400">
                        🔍 Znalazłem tego pupila!
                      </span>
                    </div>
                  )}
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
