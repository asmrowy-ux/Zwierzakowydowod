import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createEventSchema, updateEventSchema } from '../validators/calendar.validators';
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

// ─── GET /pets/:petId/events ─────────────────────────────────────
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const petId = req.params.petId as string;
      await verifyPetAccess(petId, req.user!.id);

      const { startDate, endDate, eventType, page = '1', limit = '50' } = req.query;

      const where: Record<string, unknown> = { petId };

      if (eventType && typeof eventType === 'string') {
        where.eventType = eventType;
      }

      // Date range filter
      if (startDate || endDate) {
        const dateFilter: Record<string, Date> = {};
        if (startDate && typeof startDate === 'string') {
          dateFilter.gte = new Date(startDate);
        }
        if (endDate && typeof endDate === 'string') {
          dateFilter.lte = new Date(endDate);
        }
        where.eventDate = dateFilter;
      }

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(200, Math.max(1, parseInt(limit as string, 10) || 50));
      const skip = (pageNum - 1) * limitNum;

      const [events, total] = await Promise.all([
        prisma.calendarEvent.findMany({
          where,
          orderBy: { eventDate: 'asc' },
          skip,
          take: limitNum,
        }),
        prisma.calendarEvent.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          events,
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

// ─── POST /pets/:petId/events ────────────────────────────────────
router.post(
  '/',
  authenticate,
  validateBody(createEventSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const petId = req.params.petId as string;
      await verifyPetAccess(petId, req.user!.id);

      const event = await prisma.calendarEvent.create({
        data: {
          petId,
          title: req.body.title,
          description: req.body.description || null,
          eventType: req.body.eventType,
          eventDate: new Date(req.body.eventDate),
          recurrence: req.body.recurrence || 'none',
          reminderEnabled: req.body.reminderEnabled || false,
          reminderMinutesBefore: req.body.reminderMinutesBefore ?? 30,
          clinicName: req.body.clinicName || null,
          vetName: req.body.vetName || null,
          metadata: req.body.metadata || {},
        },
      });

      res.status(201).json({
        success: true,
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── PUT /pets/:petId/events/:eventId ────────────────────────────
router.put(
  '/:eventId',
  authenticate,
  validateBody(updateEventSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const petId = req.params.petId as string;
      const eventId = req.params.eventId as string;
      await verifyPetAccess(petId, req.user!.id);

      const existingEvent = await prisma.calendarEvent.findFirst({
        where: { id: eventId, petId },
      });

      if (!existingEvent) {
        throw new NotFoundError('Calendar event');
      }

      const updateData: Record<string, unknown> = {};
      const allowedFields = [
        'title', 'description', 'eventType', 'recurrence',
        'reminderEnabled', 'reminderMinutesBefore', 'clinicName', 'vetName', 'metadata',
      ];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      if (req.body.eventDate !== undefined) {
        updateData.eventDate = new Date(req.body.eventDate);
      }

      const event = await prisma.calendarEvent.update({
        where: { id: eventId },
        data: updateData,
      });

      res.json({
        success: true,
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── DELETE /pets/:petId/events/:eventId ─────────────────────────
router.delete(
  '/:eventId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const petId = req.params.petId as string;
      const eventId = req.params.eventId as string;
      const { isOwner } = await verifyPetAccess(petId, req.user!.id);

      if (!isOwner) {
        throw new ForbiddenError('Only the owner can delete events');
      }

      const existingEvent = await prisma.calendarEvent.findFirst({
        where: { id: eventId, petId },
      });

      if (!existingEvent) {
        throw new NotFoundError('Calendar event');
      }

      await prisma.calendarEvent.delete({
        where: { id: eventId },
      });

      res.json({
        success: true,
        data: { message: 'Event deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
