// ============================================
// 🐾 PET ID — Shared TypeScript Types
// ============================================

// --- User ---
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  phone: string | null;
  locale: Locale;
  authProvider: AuthProvider;
  role: string;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export type Locale = 'pl' | 'uk' | 'en' | 'es';
export type AuthProvider = 'local' | 'google' | 'apple';

export interface UserSettings {
  darkMode?: boolean;
  notifications?: boolean;
  locationSharing?: boolean;
  privacyMode?: PrivacyMode;
}

export type PrivacyMode = 'visible' | 'friends_only' | 'blurred' | 'hidden';

// --- Pet ---
export interface Pet {
  id: string;
  ownerId: string;
  petCode: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  birthDate: string | null;
  gender: PetGender | null;
  weight: number | null;
  color: string | null;
  microchipNumber: string | null;
  status: PetStatus;
  customEmoji: string | null;
  medicalInfo: MedicalInfo;
  visibilitySettings: VisibilitySettings;
  themeSettings: ThemeSettings;
  finderNote: string | null;
  profilePhotoUrl: string | null;
  backgroundUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other';
export type PetGender = 'male' | 'female' | 'unknown';
export type PetStatus = 'home' | 'walking' | 'lost';

export interface MedicalInfo {
  allergies?: string[];
  diseases?: string[];
  medications?: string[];
  bloodType?: string;
  neutered?: boolean;
  notes?: string;
}

export interface VisibilitySettings {
  showName?: boolean;
  showSpecies?: boolean;
  showPhoto?: boolean;
  showGallery?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showAddress?: boolean;
  showMedicalInfo?: boolean;
  showMicrochip?: boolean;
  showFinderNote?: boolean;
  showFoundButton?: boolean;
  showAge?: boolean;
}

export const DEFAULT_VISIBILITY: VisibilitySettings = {
  showName: true,
  showSpecies: true,
  showPhoto: true,
  showGallery: false,
  showPhone: true,
  showEmail: false,
  showAddress: false,
  showMedicalInfo: true,
  showMicrochip: false,
  showFinderNote: true,
  showFoundButton: true,
  showAge: true,
};

export interface ThemeSettings {
  colorScheme?: string;
  avatarFrame?: 'circle' | 'square' | 'paw' | 'ears';
  backgroundPattern?: string;
  accentColor?: string;
}

// --- Pet Photo ---
export interface PetPhoto {
  id: string;
  petId: string;
  url: string;
  album: string | null;
  caption: string | null;
  isFavorite: boolean;
  sortOrder: number;
  createdAt: string;
}

// --- Pet Note ---
export interface PetNote {
  id: string;
  petId: string;
  title: string;
  content: string;
  category: NoteCategory;
  isPinned: boolean;
  attachments: NoteAttachment[];
  createdAt: string;
  updatedAt: string;
}

export type NoteCategory = 'health' | 'behavior' | 'diet' | 'training' | 'general';

export interface NoteAttachment {
  url: string;
  type: 'image' | 'pdf';
  name: string;
}

// --- Calendar Event ---
export interface CalendarEvent {
  id: string;
  petId: string;
  title: string;
  description: string | null;
  eventType: EventType;
  eventDate: string;
  recurrence: Recurrence;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  clinicName: string | null;
  vetName: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type EventType = 'vet_visit' | 'vaccination' | 'medication' | 'deworming' | 'grooming' | 'other';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

// --- Friendship ---
export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
  // Populated
  requester?: User;
  addressee?: User;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

// --- Pet Location ---
export interface PetLocation {
  id: string;
  petId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  source: LocationSource;
  recordedAt: string;
}

export type LocationSource = 'gps_tracker' | 'manual' | 'phone';

// --- Found Report ---
export interface FoundReport {
  id: string;
  petId: string;
  finderName: string | null;
  finderPhone: string | null;
  finderEmail: string | null;
  latitude: number | null;
  longitude: number | null;
  message: string | null;
  isRead: boolean;
  createdAt: string;
}

// --- API Response Types ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// --- Public Profile (filtered by visibility) ---
export interface PublicPetProfile {
  petCode: string;
  name?: string;
  species?: string;
  breed?: string;
  age?: string;
  profilePhotoUrl?: string;
  gallery?: PetPhoto[];
  ownerPhone?: string;
  ownerEmail?: string;
  medicalInfo?: MedicalInfo;
  microchipNumber?: string;
  finderNote?: string;
  status: PetStatus;
  showFoundButton: boolean;
}
