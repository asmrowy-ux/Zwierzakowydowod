import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { AppError, NotFoundError, ForbiddenError } from '../middleware/errorHandler';

const router = Router();

// ─── POST /locations ─────────────────────────────────────────────
// Update a pet's location
router.post(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { petId, latitude, longitude, accuracy, source } = req.body;

      if (!petId || typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw new AppError('petId, latitude, and longitude are required', 400, 'VALIDATION_ERROR');
      }

      // Verify ownership or caretaker access
      const pet = await prisma.pet.findUnique({
        where: { id: petId },
        include: {
          caretakers: { where: { userId }, select: { role: true } },
        },
      });

      if (!pet) {
        throw new NotFoundError('Pet');
      }

      if (pet.ownerId !== userId && pet.caretakers.length === 0) {
        throw new ForbiddenError('You do not have access to this pet');
      }

      const location = await prisma.petLocation.create({
        data: {
          petId,
          latitude,
          longitude,
          accuracy: accuracy || null,
          source: source || 'gps',
        },
      });

      res.status(201).json({
        success: true,
        data: { location },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── GET /locations/friends ──────────────────────────────────────
// Get friends' pets' latest locations (respects privacy)
router.get(
  '/friends',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Get all accepted friendships
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: userId, status: 'accepted' },
            { addresseeId: userId, status: 'accepted' },
          ],
        },
        select: {
          requesterId: true,
          addresseeId: true,
        },
      });

      // Extract friend user IDs
      const friendIds = friendships.map((f) =>
        f.requesterId === userId ? f.addresseeId : f.requesterId
      );

      if (friendIds.length === 0) {
        res.json({
          success: true,
          data: { locations: [] },
        });
        return;
      }

      // Get friends' pets that are currently walking or lost (privacy-aware)
      const friendPets = await prisma.pet.findMany({
        where: {
          ownerId: { in: friendIds },
          status: { in: ['walking', 'lost'] },
        },
        select: {
          id: true,
          name: true,
          species: true,
          petCode: true,
          status: true,
          customEmoji: true,
          profilePhotoUrl: true,
          owner: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
      });

      if (friendPets.length === 0) {
        res.json({
          success: true,
          data: { locations: [] },
        });
        return;
      }

      // Get latest location for each pet
      const petIds = friendPets.map((p) => p.id);

      // Use a raw approach: get the most recent location for each pet
      const locations = await Promise.all(
        petIds.map(async (petId) => {
          const latest = await prisma.petLocation.findFirst({
            where: { petId },
            orderBy: { recordedAt: 'desc' },
          });
          return latest;
        })
      );

      // Combine pet info with locations
      const result = friendPets
        .map((pet) => {
          const loc = locations.find((l) => l?.petId === pet.id);
          if (!loc) return null;
          return {
            pet: {
              id: pet.id,
              name: pet.name,
              species: pet.species,
              petCode: pet.petCode,
              status: pet.status,
              customEmoji: pet.customEmoji,
              profilePhotoUrl: pet.profilePhotoUrl,
              owner: pet.owner,
            },
            location: {
              latitude: loc.latitude,
              longitude: loc.longitude,
              accuracy: loc.accuracy,
              recordedAt: loc.recordedAt,
            },
          };
        })
        .filter(Boolean);

      res.json({
        success: true,
        data: { locations: result },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
