import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { authenticate, isAdmin } from '../middleware/auth';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

// Apply auth & admin check to all admin endpoints
router.use(authenticate, isAdmin);

// ─── GET /stats ──────────────────────────────────────────────────
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userCount = await prisma.user.count();
    const petCount = await prisma.pet.count();
    const foundReportsCount = await prisma.foundReport.count();
    const activeScansCount = 1420; // Mock scan aggregator count
    
    // Scans over time mock data
    const scanHistory = [
      { date: '2026-06-17', count: 120 },
      { date: '2026-06-18', count: 150 },
      { date: '2026-06-19', count: 180 },
      { date: '2026-06-20', count: 220 },
      { date: '2026-06-21', count: 290 },
      { date: '2026-06-22', count: 240 },
      { date: '2026-06-23', count: 220 },
    ];

    res.json({
      success: true,
      data: {
        users: userCount,
        pets: petCount,
        reports: foundReportsCount,
        scans: activeScansCount,
        scanHistory,
        systemHealth: {
          db: 'Connected',
          api: 'Healthy',
          latency: '24ms',
          uptime: '14d 6h',
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /users ──────────────────────────────────────────────────
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string || '';
    
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { displayName: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /users/:id/role ──────────────────────────────────────────
router.put('/users/:id/role', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body; // 'USER' or 'ADMIN'

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /users/:id ───────────────────────────────────────────
router.delete('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User');
    }

    await prisma.user.delete({ where: { id } });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /pets ───────────────────────────────────────────────────
router.get('/pets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string || '';

    const pets = await prisma.pet.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { petCode: { contains: search, mode: 'insensitive' } },
          { breed: { contains: search, mode: 'insensitive' } },
        ],
      },
      include: {
        owner: {
          select: { displayName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: pets,
    });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /pets/:id ────────────────────────────────────────────
router.delete('/pets/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const pet = await prisma.pet.findUnique({ where: { id } });
    if (!pet) {
      throw new NotFoundError('Pet');
    }

    await prisma.pet.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Pet profile removed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /logs ───────────────────────────────────────────────────
router.get('/logs', (req: Request, res: Response) => {
  // Generate beautiful real-time mock error and request logs
  const logs = [
    { timestamp: new Date(Date.now() - 5000).toISOString(), type: 'info', service: 'API_GATEWAY', message: 'GET /api/pets/public/PET-A1F92B - 200 OK (24ms)' },
    { timestamp: new Date(Date.now() - 12000).toISOString(), type: 'info', service: 'AUTH', message: 'User logged in successfully (Jan Kowalski)' },
    { timestamp: new Date(Date.now() - 45000).toISOString(), type: 'warn', service: 'DATABASE', message: 'Prisma Client: Slow query detected (duration: 210ms)' },
    { timestamp: new Date(Date.now() - 90000).toISOString(), type: 'error', service: 'AUTH_GATEWAY', message: 'POST /api/auth/login - 401 Unauthorized (Invalid password hash)' },
    { timestamp: new Date(Date.now() - 150000).toISOString(), type: 'error', service: 'EMAIL', message: 'Resend: Failed to send Found Pet notification (invalid recipient)' },
    { timestamp: new Date(Date.now() - 300000).toISOString(), type: 'info', service: 'GPS', message: 'Updated coordinates for PET-Z8Y3X1 (manual submission)' },
  ];

  res.json({
    success: true,
    data: logs,
  });
});

// ─── GET /files ──────────────────────────────────────────────────
router.get('/files', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const photos = await prisma.petPhoto.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        pet: { select: { name: true, petCode: true } },
      },
    });

    // Mock static folder details or uploaded attachment lists
    const files = photos.map(photo => ({
      id: photo.id,
      name: photo.url.substring(photo.url.lastIndexOf('/') + 1) || 'photo.jpg',
      size: '2.4 MB',
      type: 'image/jpeg',
      uploadedBy: photo.pet.name,
      petCode: photo.pet.petCode,
      createdAt: photo.createdAt,
    }));

    res.json({
      success: true,
      data: files,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
