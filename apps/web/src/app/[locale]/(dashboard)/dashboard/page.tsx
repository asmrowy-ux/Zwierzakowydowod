'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, QrCode, Edit2, Eye, Trash2, Calendar, MapPin, Settings } from 'lucide-react';
import { useLocale } from 'next-intl';

export const runtime = 'edge';

interface Pet {
  id: string;
  petCode: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  status: 'home' | 'walking' | 'lost';
  profilePhotoUrl: string | null;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tPet = useTranslations('pet');
  const tStatus = useTranslations('status');
  const router = useRouter();
  const locale = useLocale();
  
  const [userName, setUserName] = useState('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('pet-id-token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // 1. Fetch User Profile Info
        const userRes = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Authorization': `Bearer ${token}`,
          },
        });

        if (!userRes.ok) {
          throw new Error('Unauthorized or invalid token');
        }

        const userData = await userRes.json();
        setUserName(userData.data.user.displayName);

        // 2. Fetch User Pets
        const petsRes = await fetch('/api/pets', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Authorization': `Bearer ${token}`,
          },
        });

        if (petsRes.ok) {
          const petsData = await petsRes.json();
          setPets(petsData.data.pets);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        localStorage.removeItem('pet-id-token');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleStatusChange = async (petId: string, nextStatus: 'home' | 'walking' | 'lost') => {
    const token = localStorage.getItem('pet-id-token');
    if (!token) return;

    // Optimistic update
    setPets((prev) =>
      prev.map((pet) => (pet.id === petId ? { ...pet, status: nextStatus } : pet))
    );

    try {
      const res = await fetch(`/api/pets/${petId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error('Failed to save status update:', err);
      alert('Error updating status on server. Reverting...');
      
      // Revert status from server
      const petsRes = await fetch('/api/pets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Authorization': `Bearer ${token}`,
        },
      });
      if (petsRes.ok) {
        const petsData = await petsRes.json();
        setPets(petsData.data.pets);
      }
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego pupila?')) {
      return;
    }

    const token = localStorage.getItem('pet-id-token');
    if (!token) return;

    try {
      const res = await fetch(`/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete pet');
      }

      setPets((prev) => prev.filter((p) => p.id !== petId));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Nie udało się usunąć pupila.');
    }
  };

  const openQrModal = (pet: Pet) => {
    setSelectedPet(pet);
    setIsQrModalOpen(true);
  };

  const getPublicProfileUrl = (petCode: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/${locale}/p/${petCode}`;
    }
    return `/${locale}/p/${petCode}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center relative z-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pet-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800 dark:text-white">
            {t('welcome', { name: userName })}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('welcomeSubtitle')}
          </p>
        </div>

        <Button asChild className="shadow-pet flex items-center gap-2">
          <Link href="/pets/new">
            <Plus className="w-5 h-5" />
            <span>{t('addPet')}</span>
          </Link>
        </Button>
      </div>

      {/* Grid of Pets */}
      {pets.length === 0 ? (
        <Card className="glass p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-pet-amber-50 dark:bg-slate-800 flex items-center justify-center text-4xl mx-auto shadow-inner">
            🐶
          </div>
          <div>
            <CardTitle>{t('noPets')}</CardTitle>
            <CardDescription className="mt-1">
              {t('noPetsDesc')}
            </CardDescription>
          </div>
          <Button asChild className="w-full">
            <Link href="/pets/new">
              {t('addPet')}
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {pets.map((pet) => {
            const publicUrl = getPublicProfileUrl(pet.petCode);
            
            return (
              <Card key={pet.id} className="hover-card flex flex-col justify-between overflow-hidden relative group p-6">
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <Badge variant={pet.status}>
                    {tStatus(pet.status)}
                  </Badge>
                </div>

                <div className="flex gap-4">
                  {/* Photo Thumbnail */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pet-amber-100 to-pet-orange-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-3xl shadow-sm shrink-0 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden relative">
                    {pet.profilePhotoUrl ? (
                      <img src={pet.profilePhotoUrl} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      pet.species === 'dog' ? '🐶' : pet.species === 'cat' ? '🐱' : '🐾'
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      {pet.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      {pet.breed || tPet(pet.species)}
                    </p>
                    <p className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono font-bold tracking-tight inline-block border border-slate-200/60 dark:border-slate-700/50">
                      {pet.petCode}
                    </p>
                  </div>
                </div>

                {/* Status Toggle Quick Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/40 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Status:
                  </span>
                  <div className="flex gap-1.5">
                    {(['home', 'walking', 'lost'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(pet.id, s)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all duration-300 border ${
                          pet.status === s
                            ? s === 'home'
                              ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800/40'
                              : s === 'walking'
                              ? 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-750 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800/40'
                              : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800/40'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {tStatus(s)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/40 flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openQrModal(pet)}
                      icon={<QrCode className="w-3.5 h-3.5" />}
                    >
                      QR
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      icon={<Eye className="w-3.5 h-3.5" />}
                    >
                      <Link href={`/p/${pet.petCode}`}>
                        Profile
                      </Link>
                    </Button>
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-pet-amber-500"
                      asChild
                    >
                      <Link href={`/pets/${pet.id}/edit`}>
                        <Edit2 className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 hover:text-red-650"
                      onClick={() => handleDeletePet(pet.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedPet && (
        <Modal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          title={`${t('viewQr')} — ${selectedPet.name}`}
          footer={
            <Button onClick={() => setIsQrModalOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-md">
              <QRCodeSVG
                value={getPublicProfileUrl(selectedPet.petCode)}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed font-semibold">
              Scan this QR code to visit the public profile of <strong className="text-slate-800 dark:text-white">{selectedPet.name}</strong> ({selectedPet.petCode}).
            </p>
            <span className="text-[10px] font-mono select-all bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
              {getPublicProfileUrl(selectedPet.petCode)}
            </span>
          </div>
        </Modal>
      )}
    </div>
  );
}
