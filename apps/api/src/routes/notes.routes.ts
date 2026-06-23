import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createNoteSchema, updateNoteSchema } from '../validators/note.validators';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler';

const router = Router({ mergeParams: true });

/**
 * Verify the user has access to the pet.
 */
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

// ─── GET /pets/:petId/notes ──────────────────────────────────────
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const petId = req.params.petId as string;
      await verifyPetAccess(petId, req.user!.id);

      const { search, category, page = '1', limit = '20' } = req.query;

      const where: Record<string, unknown> = { petId };

      if (category && typeof category === 'string') {
        where.category = category;
      }

      if (search && typeof search === 'string') {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ];
      }

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [notes, total] = await Promise.all([
        prisma.petNote.findMany({
          where,
          orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
          skip,
          take: limitNum,
        }),
        prisma.petNote.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          notes,
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

// ─── POST /pets/:petId/notes ─────────────────────────────────────
router.post(
  '/',
  authenticate,
  validateBody(createNoteSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const petId = req.params.petId as string;
      await verifyPetAccess(petId, req.user!.id);

      const note = await prisma.petNote.create({
        data: {
          petId,
          title: req.body.title,
          content: req.body.content,
          category: req.body.category || 'general',
          isPinned: req.body.isPinned || false,
          attachments: req.body.attachments || [],
        },
      });

      res.status(201).json({
        success: true,
        data: { note },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── PUT /pets/:petId/notes/:noteId ──────────────────────────────
router.put(
  '/:noteId',
  authenticate,
  validateBody(updateNoteSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const petId = req.params.petId as string;
      const noteId = req.params.noteId as string;
      await verifyPetAccess(petId, req.user!.id);

      // Verify note belongs to pet
      const existingNote = await prisma.petNote.findFirst({
        where: { id: noteId, petId },
      });

      if (!existingNote) {
        throw new NotFoundError('Note');
      }

      const updateData: Record<string, unknown> = {};
      const allowedFields = ['title', 'content', 'category', 'isPinned', 'attachments'];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      const note = await prisma.petNote.update({
        where: { id: noteId },
        data: updateData,
      });

      res.json({
        success: true,
        data: { note },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── DELETE /pets/:petId/notes/:noteId ───────────────────────────
router.delete(
  '/:noteId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const petId = req.params.petId as string;
      const noteId = req.params.noteId as string;
      const { isOwner } = await verifyPetAccess(petId, req.user!.id);

      if (!isOwner) {
        throw new ForbiddenError('Only the owner can delete notes');
      }

      const existingNote = await prisma.petNote.findFirst({
        where: { id: noteId, petId },
      });

      if (!existingNote) {
        throw new NotFoundError('Note');
      }

      await prisma.petNote.delete({
        where: { id: noteId },
      });

      res.json({
        success: true,
        data: { message: 'Note deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── PUT /pets/:petId/notes/:noteId/pin ──────────────────────────
router.put(
  '/:noteId/pin',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const petId = req.params.petId as string;
      const noteId = req.params.noteId as string;
      await verifyPetAccess(petId, req.user!.id);

      const existingNote = await prisma.petNote.findFirst({
        where: { id: noteId, petId },
      });

      if (!existingNote) {
        throw new NotFoundError('Note');
      }

      const note = await prisma.petNote.update({
        where: { id: noteId },
        data: { isPinned: !existingNote.isPinned },
      });

      res.json({
        success: true,
        data: { note },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
