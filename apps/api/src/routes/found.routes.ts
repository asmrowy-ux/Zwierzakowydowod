import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { validateBody } from '../middleware/validate';
import { createFoundReportSchema } from '../validators/found.validators';
import { sendFoundPetNotification } from '../utils/email';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

// ─── POST /found/:petCode ────────────────────────────────────────
// Submit a found pet report (NO auth required — public endpoint)
router.post(
  '/:petCode',
  validateBody(createFoundReportSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { petCode } = req.params;

      // Find the pet and its owner
      const pet = await prisma.pet.findUnique({
        where: { petCode: petCode as string },
        include: {
          owner: {
            select: {
              email: true,
              displayName: true,
              phone: true,
            },
          },
        },
      });

      if (!pet) {
        throw new NotFoundError('Pet');
      }

      const { finderName, finderPhone, finderEmail, latitude, longitude, message } = req.body;

      // Create the found report
      const report = await prisma.foundReport.create({
        data: {
          petId: pet.id,
          finderName: finderName || null,
          finderPhone: finderPhone || null,
          finderEmail: finderEmail || null,
          latitude: latitude || null,
          longitude: longitude || null,
          message: message || null,
        },
      });

      // If pet is lost, this is extra important
      if (pet.status === 'lost') {
        // Mark pet as found/home (owner can change later)
        await prisma.pet.update({
          where: { id: pet.id },
          data: { status: 'home' },
        });
      }

      // Send email notification to owner (fire and forget)
      sendFoundPetNotification({
        ownerEmail: (pet as any).owner.email,
        ownerName: (pet as any).owner.displayName,
        petName: pet.name,
        petCode: pet.petCode,
        finderName: finderName || undefined,
        finderPhone: finderPhone || undefined,
        finderEmail: finderEmail || undefined,
        message: message || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
      }).catch(console.error);

      res.status(201).json({
        success: true,
        data: {
          message: 'Found report submitted successfully. The owner has been notified.',
          report: {
            id: report.id,
            petName: pet.name,
            createdAt: report.createdAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
