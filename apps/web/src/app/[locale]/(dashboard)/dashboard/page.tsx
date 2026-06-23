'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, QrCode, Edit2, Eye, Trash2, Calendar, MapPin, Settings } from 'lucide-react';

export const runtime = 'edge';

interface Pet {
  id: string;
  petCode: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'other';
  breed: string;
  status: 'home' | 'walking' | 'lost';
  profilePhotoUrl: string | null;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tPet = useTranslations('pet');
  const [userName, setUserName] = useState('Jan Kowalski');
  
  // Mock data for initial pets
  const [pets, setPets] = useState<Pet[]>([
    {
      id: '1',
      petCode: 'PET-A1F92B',
      name: 'Reksio',
      species: 'dog',
      breed: 'Golden Retriever',
      status: 'home',
      profilePhotoUrl: null,
    },
    {
      id: '2',
      petCode: 'PET-Z8Y3X1',
      name: 'Luna',
      species: 'cat',
      breed: 'Brytyjski',
      status: 'lost',
      profilePhotoUrl: null,
    },
  ]);

  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Load actual user or state in production
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('pet-id-token');
      // Here you would normally decode the token or fetch user profile from API.
      // We will fall back to mock data but allow future API connection.
    } catch (e) {}
  }, []);

  const handleStatusChange = (petId: string, nextStatus: 'home' | 'walking' | 'lost') => {
    setPets((prev) =>
      prev.map((pet) => (pet.id === petId ? { ...pet, status: nextStatus } : pet))
    );
    // In production, trigger fetch `/api/pets/${petId}/status` with body: { status: nextStatus }
  };

  const handleDeletePet = (petId: string) => {
    if (confirm('Are you sure you want to delete this pet?')) {
      setPets((prev) => prev.filter((p) => p.id !== petId));
    }
  };

  const openQrModal = (pet: Pet) => {
    setSelectedPet(pet);
    setIsQrModalOpen(true);
  };

  const getPublicProfileUrl = (petCode: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/p/${petCode}`;
    }
    return `/p/${petCode}`;
  };

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

        <Button asChild>
          <Link href="/pets/new" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('addPet')}
          </Link>
        </Button>
      </div>

      {/* Grid */}
      {pets.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-4">
            🐾
          </div>
          <h3 className="font-display text-xl font-bold text-slate-800 dark:text-white mb-2">
            {t('noPets')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-6">
            {t('noPetsDesc')}
          </p>
          <Button asChild>
            <Link href="/pets/new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('addPet')}
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => {
            const publicUrl = getPublicProfileUrl(pet.petCode);
            
            return (
              <Card key={pet.id} className="hover-card flex flex-col justify-between overflow-hidden relative group p-6">
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <Badge variant={pet.status}>
                    {tPet(pet.status)}
                  </Badge>
                </div>

                <div className="flex gap-4">
                  {/* Photo Thumbnail */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pet-amber-100 to-pet-orange-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-3xl shadow-sm shrink-0 border border-slate-200/50 dark:border-slate-700/50">
                    {pet.species === 'dog' ? '🐶' : pet.species === 'cat' ? '🐱' : '🐾'}
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
                        {tPet(s)}
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
