import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  createPetSchema,
  updatePetSchema,
  updateVisibilitySchema,
  updateStatusSchema,
} from '../validators/pet.validators';
import { generatePetCode } from '../utils/petCode';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler';

const router = Router();

/**
 * Check if user is the owner or a caretaker of the pet.
 */
async function verifyPetAccess(petId: string, userId: string): Promise<any> {
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: {
      caretakers: { where: { userId }, select: { role: true } },
    },
  });

  if (!pet) {
    throw new NotFoundError('Pet');
  }

  const isOwner = pet.ownerId === userId;
  const caretaker = pet.caretakers[0];
  const isCaretaker = !!caretaker;

  if (!isOwner && !isCaretaker) {
    throw new ForbiddenError('You do not have access to this pet');
  }

  return { pet, isOwner, isCaretaker, caretakerRole: caretaker?.role };
}

// ─── GET / ───────────────────────────────────────────────────────
// List user's pets (owned + caretaking)
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const [ownedPets, caretakerPets] = await Promise.all([
        prisma.pet.findMany({
          where: { ownerId: userId },
          include: {
            _count: { select: { photos: true, notes: true, events: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.petCaretaker.findMany({
          where: { userId },
          include: {
            pet: {
              include: {
                _count: { select: { photos: true, notes: true, events: true } },
              },
            },
          },
        }),
      ]);

      const pets = [
        ...ownedPets.map((p) => ({ ...p, role: 'owner' as const })),
        ...caretakerPets.map((ct) => ({ ...ct.pet, role: ct.role })),
      ];

      res.json({
        success: true,
        data: { pets, total: pets.length },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST / ──────────────────────────────────────────────────────
// Create a new pet
router.post(
  '/',
  authenticate,
  validateBody(createPetSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const petCode = await generatePetCode();

      const pet = await prisma.pet.create({
        data: {
          ownerId: userId,
          petCode,
          name: req.body.name,
          species: req.body.species,
          breed: req.body.breed || null,
          birthDate: req.body.birthDate ? new Date(req.body.birthDate) : null,
          gender: req.body.gender || null,
          weight: req.body.weight || null,
          color: req.body.color || null,
          microchipNumber: req.body.microchipNumber || null,
          customEmoji: req.body.customEmoji || null,
          finderNote: req.body.finderNote || null,
          medicalInfo: req.body.medicalInfo || {},
          profilePhotoUrl: req.body.profilePhotoUrl || null,
          backgroundUrl: req.body.backgroundUrl || null,
          visibilitySettings: req.body.visibilitySettings || undefined,
        },
      });

      res.status(201).json({
        success: true,
        data: { pet },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── GET /:petId ─────────────────────────────────────────────────
// Get pet details (auth required, owner or caretaker)
router.get(
  '/:petId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pet } = await verifyPetAccess(req.params.petId as string, req.user!.id);

      const fullPet = await prisma.pet.findUnique({
        where: { id: pet.id },
        include: {
          owner: {
            select: { id: true, displayName: true, avatarUrl: true, email: true, phone: true },
          },
          photos: { orderBy: { sortOrder: 'asc' }, take: 20 },
          caretakers: {
            include: {
              user: { select: { id: true, displayName: true, avatarUrl: true } },
            },
          },
          _count: {
            select: { photos: true, notes: true, events: true, foundReports: true },
          },
        },
      });

      res.json({
        success: true,
        data: { pet: fullPet },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── PUT /:petId ─────────────────────────────────────────────────
// Update pet details
router.put(
  '/:petId',
  authenticate,
  validateBody(updatePetSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isOwner } = await verifyPetAccess(req.params.petId as string, req.user!.id);

      if (!isOwner) {
        throw new ForbiddenError('Only the owner can update pet details');
      }

      const updateData: Record<string, unknown> = {};
      const allowedFields = [
        'name', 'species', 'breed', 'gender', 'weight', 'color',
        'microchipNumber', 'customEmoji', 'finderNote', 'medicalInfo',
        'profilePhotoUrl', 'backgroundUrl', 'visibilitySettings',
      ];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      if (req.body.birthDate !== undefined) {
        updateData.birthDate = req.body.birthDate ? new Date(req.body.birthDate) : null;
      }

      const pet = await prisma.pet.update({
        where: { id: req.params.petId as string },
        data: updateData,
      });

      res.json({
        success: true,
        data: { pet },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── DELETE /:petId ──────────────────────────────────────────────
// Delete pet (owner only)
router.delete(
  '/:petId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isOwner } = await verifyPetAccess(req.params.petId as string, req.user!.id);

      if (!isOwner) {
        throw new ForbiddenError('Only the owner can delete a pet');
      }

      await prisma.pet.delete({
        where: { id: req.params.petId as string },
      });

      res.json({
        success: true,
        data: { message: 'Pet deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── GET /public/:petCode ────────────────────────────────────────
// Public pet profile (NO auth required)
router.get(
  '/public/:petCode',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { petCode } = req.params;

      const pet = await prisma.pet.findUnique({
        where: { petCode: petCode as string },
        include: {
          owner: {
            select: { displayName: true, email: true, phone: true, avatarUrl: true },
          },
          photos: {
            where: { isFavorite: true },
            orderBy: { sortOrder: 'asc' },
            take: 5,
          },
        },
      });

      if (!pet) {
        throw new NotFoundError('Pet');
      }

      // Apply visibility settings
      const visibility = (pet.visibilitySettings || {}) as Record<string, boolean>;
      const isVisible = (key: string) => {
        const mapping: Record<string, string> = {
          name: 'showName',
          species: 'showSpecies',
          breed: 'showBreed',
          color: 'showColor',
          microchip: 'showMicrochip',
          photo: 'showPhoto',
          finderNote: 'showFinderNote',
          ownerEmail: 'showEmail',
          ownerPhone: 'showPhone',
          medicalInfo: 'showMedicalInfo',
        };
        const feKey = mapping[key] || `show${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        return visibility[key] !== false && visibility[feKey] !== false;
      };

      const publicPet: Record<string, unknown> = {
        petCode: pet.petCode,
        status: pet.status,
        customEmoji: pet.customEmoji,
        finderNote: isVisible('finderNote') ? pet.finderNote : null,
        themeSettings: pet.themeSettings,
        profilePhotoUrl: isVisible('photo') ? pet.profilePhotoUrl : null,
        backgroundUrl: pet.backgroundUrl,
      };

      if (isVisible('name')) publicPet.name = pet.name;
      if (isVisible('species')) publicPet.species = pet.species;
      if (isVisible('breed')) publicPet.breed = pet.breed;
      if (isVisible('color')) publicPet.color = pet.color;
      if (isVisible('microchip')) publicPet.microchipNumber = pet.microchipNumber;
      if (isVisible('photo')) publicPet.photos = (pet as any).photos;

      const ownerInfo: Record<string, unknown> = {
        displayName: (pet as any).owner.displayName,
        avatarUrl: (pet as any).owner.avatarUrl,
      };
      if (isVisible('ownerEmail')) ownerInfo.email = (pet as any).owner.email;
      if (isVisible('ownerPhone')) ownerInfo.phone = (pet as any).owner.phone;

      publicPet.owner = ownerInfo;

      res.json({
        success: true,
        data: { pet: publicPet },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── PUT /:petId/visibility ──────────────────────────────────────
// Update visibility settings
router.put(
  '/:petId/visibility',
  authenticate,
  validateBody(updateVisibilitySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pet, isOwner } = await verifyPetAccess(req.params.petId as string, req.user!.id);

      if (!isOwner) {
        throw new ForbiddenError('Only the owner can update visibility settings');
      }

      const currentVisibility = (pet.visibilitySettings || {}) as Record<string, boolean>;
      const newVisibility = { ...currentVisibility, ...req.body };

      const updated = await prisma.pet.update({
        where: { id: req.params.petId as string },
        data: { visibilitySettings: newVisibility },
        select: { id: true, visibilitySettings: true },
      });

      res.json({
        success: true,
        data: { visibility: updated.visibilitySettings },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── PUT /:petId/status ──────────────────────────────────────────
// Update pet status (home/walking/lost)
router.put(
  '/:petId/status',
  authenticate,
  validateBody(updateStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isOwner } = await verifyPetAccess(req.params.petId as string, req.user!.id);

      if (!isOwner) {
        throw new ForbiddenError('Only the owner can update pet status');
      }

      const pet = await prisma.pet.update({
        where: { id: req.params.petId as string },
        data: { status: req.body.status },
        select: { id: true, name: true, status: true, petCode: true },
      });

      res.json({
        success: true,
        data: { pet },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
