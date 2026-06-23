import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler';

const router = Router({ mergeParams: true });

async function verifyPetAccess(petId: string, userId: string) {
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: {
      caretakers: { where: { userId }, select: { role: true } },
    },
  });

  if (!pet) throw new NotFoundError('Pet');

  const isOwner = pet.ownerId === userId;
  const isCaretaker = pet.caretakers.length > 0;

  if (!isOwner && !isCaretaker) {
    throw new ForbiddenError('You do not have access to this pet');
  }

  return { pet, isOwner };
}

// ─── GET /pets/:petId/photos ─────────────────────────────────────
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const petId = req.params.petId as string;
      await verifyPetAccess(petId, req.user!.id);

      const { album, favorites, page = '1', limit = '50' } = req.query;

      const where: Record<string, unknown> = { petId };

      if (album && typeof album === 'string') {
        where.album = album;
      }

      if (favorites === 'true') {
        where.isFavorite = true;
      }

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(200, Math.max(1, parseInt(limit as string, 10) || 50));
      const skip = (pageNum - 1) * limitNum;

      const [photos, total] = await Promise.all([
        prisma.petPhoto.findMany({
          where,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          skip,
          take: limitNum,
        }),
        prisma.petPhoto.count({ where }),
      ]);

      // Get distinct albums for filtering
      const albums = await prisma.petPhoto.findMany({
        where: { petId },
        select: { album: true },
        distinct: ['album'],
      });

      res.json({
        success: true,
        data: {
          photos,
          albums: albums.map((a) => a.album).filter(Boolean),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST /pets/:petId/photos ────────────────────────────────────
// Upload photo metadata (actual file upload handled by frontend to cloud storage)
router.post(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const petId = req.params.petId as string;
      await verifyPetAccess(petId, req.user!.id);

      const { url, album, caption, isFavorite, sortOrder } = req.body;

      if (!url || typeof url !== 'string') {
        throw new ForbiddenError('Photo URL is required');
      }

      // Get max sort order for the pet
      const maxSort = await prisma.petPhoto.aggregate({
        where: { petId },
        _max: { sortOrder: true },
      });

      const photo = await prisma.petPhoto.create({
        data: {
          petId,
          url,
          album: album || null,
          caption: caption || null,
          isFavorite: isFavorite || false,
          sortOrder: sortOrder ?? ((maxSort?._max?.sortOrder || 0) + 1),
        },
      });

      res.status(201).json({
        success: true,
        data: { photo },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── DELETE /pets/:petId/photos/:photoId ─────────────────────────
router.delete(
  '/:photoId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const petId = req.params.petId as string;
      const photoId = req.params.photoId as string;
      const { isOwner } = await verifyPetAccess(petId, req.user!.id);

      if (!isOwner) {
        throw new ForbiddenError('Only the owner can delete photos');
      }

      const existingPhoto = await prisma.petPhoto.findFirst({
        where: { id: photoId, petId },
      });

      if (!existingPhoto) {
        throw new NotFoundError('Photo');
      }

      await prisma.petPhoto.delete({
        where: { id: photoId },
      });

      res.json({
        success: true,
        data: { message: 'Photo deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── PUT /pets/:petId/photos/:photoId/favorite ──────────────────
router.put(
  '/:photoId/favorite',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const petId = req.params.petId as string;
      const photoId = req.params.photoId as string;
      await verifyPetAccess(petId, req.user!.id);

      const existingPhoto = await prisma.petPhoto.findFirst({
        where: { id: photoId, petId },
      });

      if (!existingPhoto) {
        throw new NotFoundError('Photo');
      }

      const photo = await prisma.petPhoto.update({
        where: { id: photoId },
        data: { isFavorite: !existingPhoto.isFavorite },
      });

      res.json({
        success: true,
        data: { photo },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
