import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { NotFoundError, ForbiddenError, AppError } from '../middleware/errorHandler';

const router = Router();

// ─── GET /friends ────────────────────────────────────────────────
// List all friends (accepted friendships)
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { status } = req.query;

      const statusFilter = typeof status === 'string' ? status : 'accepted';

      const [sent, received] = await Promise.all([
        prisma.friendship.findMany({
          where: {
            requesterId: userId,
            status: statusFilter,
          },
          include: {
            addressee: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                email: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.friendship.findMany({
          where: {
            addresseeId: userId,
            status: statusFilter,
          },
          include: {
            requester: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                email: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        }),
      ]);

      const friends = [
        ...sent.map((f) => ({
          friendshipId: f.id,
          friend: f.addressee,
          status: f.status,
          direction: 'sent' as const,
          createdAt: f.createdAt,
        })),
        ...received.map((f) => ({
          friendshipId: f.id,
          friend: f.requester,
          status: f.status,
          direction: 'received' as const,
          createdAt: f.createdAt,
        })),
      ];

      // Also get pending requests count
      const pendingCount = await prisma.friendship.count({
        where: {
          addresseeId: userId,
          status: 'pending',
        },
      });

      res.json({
        success: true,
        data: {
          friends,
          pendingCount,
          total: friends.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST /friends/request ───────────────────────────────────────
// Send friend request by PET code (find the pet owner)
router.post(
  '/request',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { petCode } = req.body;

      if (!petCode || typeof petCode !== 'string') {
        throw new AppError('PET code is required', 400, 'VALIDATION_ERROR');
      }

      // Find the pet and its owner
      const pet = await prisma.pet.findUnique({
        where: { petCode },
        select: {
          ownerId: true,
          owner: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
      });

      if (!pet) {
        throw new NotFoundError('Pet with this code');
      }

      const addresseeId = pet.ownerId;

      // Can't friend yourself
      if (addresseeId === userId) {
        throw new AppError('You cannot send a friend request to yourself', 400, 'INVALID_REQUEST');
      }

      // Check for existing friendship in either direction
      const existing = await prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId: userId, addresseeId },
            { requesterId: addresseeId, addresseeId: userId },
          ],
        },
      });

      if (existing) {
        if (existing.status === 'accepted') {
          throw new AppError('You are already friends', 400, 'ALREADY_FRIENDS');
        }
        if (existing.status === 'pending') {
          throw new AppError('A friend request is already pending', 400, 'ALREADY_PENDING');
        }
        if (existing.status === 'blocked') {
          throw new ForbiddenError('This user has blocked friend requests');
        }
      }

      const friendship = await prisma.friendship.create({
        data: {
          requesterId: userId,
          addresseeId,
          status: 'pending',
        },
        include: {
          addressee: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: {
          friendship: {
            id: friendship.id,
            friend: friendship.addressee,
            status: friendship.status,
            createdAt: friendship.createdAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── PUT /friends/:friendshipId/accept ───────────────────────────
router.put(
  '/:friendshipId/accept',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const friendshipId = req.params.friendshipId as string;

      const friendship = await prisma.friendship.findUnique({
        where: { id: friendshipId },
      });

      if (!friendship) {
        throw new NotFoundError('Friend request');
      }

      // Only the addressee can accept
      if (friendship.addresseeId !== userId) {
        throw new ForbiddenError('You can only accept requests sent to you');
      }

      if (friendship.status !== 'pending') {
        throw new AppError('This request is no longer pending', 400, 'INVALID_STATUS');
      }

      const updated = await prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: 'accepted' },
        include: {
          requester: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
      });

      res.json({
        success: true,
        data: {
          friendship: {
            id: updated.id,
            friend: (updated as any).requester,
            status: updated.status,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── PUT /friends/:friendshipId/reject ───────────────────────────
router.put(
  '/:friendshipId/reject',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const friendshipId = req.params.friendshipId as string;
      const { block } = req.body;

      const friendship = await prisma.friendship.findUnique({
        where: { id: friendshipId },
      });

      if (!friendship) {
        throw new NotFoundError('Friend request');
      }

      // Only the addressee can reject/block
      if (friendship.addresseeId !== userId) {
        throw new ForbiddenError('You can only reject requests sent to you');
      }

      if (block) {
        await prisma.friendship.update({
          where: { id: friendshipId },
          data: { status: 'blocked' },
        });

        res.json({
          success: true,
          data: { message: 'User blocked' },
        });
      } else {
        await prisma.friendship.delete({
          where: { id: friendshipId },
        });

        res.json({
          success: true,
          data: { message: 'Friend request rejected' },
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

// ─── DELETE /friends/:friendshipId ───────────────────────────────
// Remove friend (either party can remove)
router.delete(
  '/:friendshipId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const friendshipId = req.params.friendshipId as string;

      const friendship = await prisma.friendship.findUnique({
        where: { id: friendshipId },
      });

      if (!friendship) {
        throw new NotFoundError('Friendship');
      }

      // Either party can remove the friendship
      if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
        throw new ForbiddenError('You are not part of this friendship');
      }

      await prisma.friendship.delete({
        where: { id: friendshipId },
      });

      res.json({
        success: true,
        data: { message: 'Friend removed successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
