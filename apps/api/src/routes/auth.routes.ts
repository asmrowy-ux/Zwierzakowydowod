import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validators';
import { signAccessToken, signRefreshToken, verifyToken, generateTokenPair } from '../utils/jwt';
import { sendWelcomeEmail } from '../utils/email';
import { AppError, ConflictError, UnauthorizedError, NotFoundError } from '../middleware/errorHandler';

const router = Router();

// ─── POST /register ──────────────────────────────────────────────
router.post(
  '/register',
  validateBody(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, displayName, phone, locale } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictError('A user with this email already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          displayName,
          phone: phone || null,
          locale: locale || 'pl',
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          locale: true,
          authProvider: true,
          createdAt: true,
        },
      });

      // Generate tokens
      const tokens = generateTokenPair(user.id, user.email);

      // Store refresh token
      const { token: rtValue, expiresAt } = signRefreshToken(user.id, user.email);
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: rtValue,
          expiresAt,
        },
      });

      // Send welcome email (fire and forget)
      sendWelcomeEmail({ email: user.email, displayName: user.displayName }).catch(console.error);

      res.status(201).json({
        success: true,
        data: {
          user,
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: rtValue,
            accessTokenExpiresAt: tokens.accessTokenExpiresAt,
            refreshTokenExpiresAt: expiresAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST /login ─────────────────────────────────────────────────
router.post(
  '/login',
  validateBody(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      if (!user.passwordHash) {
        throw new UnauthorizedError(
          'This account uses social login. Please sign in with Google.'
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Generate tokens
      const tokens = generateTokenPair(user.id, user.email);

      // Store refresh token
      const { token: rtValue, expiresAt } = signRefreshToken(user.id, user.email);
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: rtValue,
          expiresAt,
        },
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            locale: user.locale,
            authProvider: user.authProvider,
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: rtValue,
            accessTokenExpiresAt: tokens.accessTokenExpiresAt,
            refreshTokenExpiresAt: expiresAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST /refresh ───────────────────────────────────────────────
router.post(
  '/refresh',
  validateBody(refreshSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      // Verify the JWT
      let payload;
      try {
        payload = verifyToken(refreshToken);
      } catch {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      if (payload.type !== 'refresh') {
        throw new UnauthorizedError('Invalid token type');
      }

      // Find the stored refresh token
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken) {
        // Token reuse detected — revoke all tokens for this user
        await prisma.refreshToken.deleteMany({
          where: { userId: payload.sub },
        });
        throw new UnauthorizedError('Refresh token has been revoked (possible token reuse detected)');
      }

      if (storedToken.expiresAt < new Date()) {
        await prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });
        throw new UnauthorizedError('Refresh token has expired');
      }

      // Rotate: delete old token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      // Generate new token pair
      const newAccessToken = signAccessToken(storedToken.user.id, storedToken.user.email);
      const { token: newRefreshToken, expiresAt } = signRefreshToken(
        storedToken.user.id,
        storedToken.user.email
      );

      // Store new refresh token
      await prisma.refreshToken.create({
        data: {
          userId: storedToken.user.id,
          token: newRefreshToken,
          expiresAt,
        },
      });

      res.json({
        success: true,
        data: {
          tokens: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            accessTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
            refreshTokenExpiresAt: expiresAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST /logout ────────────────────────────────────────────────
router.post(
  '/logout',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.body.refreshToken;

      if (refreshToken) {
        // Delete specific refresh token
        await prisma.refreshToken.deleteMany({
          where: {
            token: refreshToken,
            userId: req.user!.id,
          },
        });
      } else {
        // Delete all refresh tokens for user (logout from all devices)
        await prisma.refreshToken.deleteMany({
          where: { userId: req.user!.id },
        });
      }

      res.json({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── GET /google ─────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// ─── GET /google/callback ────────────────────────────────────────
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;

      if (!user) {
        throw new UnauthorizedError('Google authentication failed');
      }

      // Generate tokens
      const tokens = generateTokenPair(user.id, user.email);
      const { token: rtValue, expiresAt } = signRefreshToken(user.id, user.email);

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: rtValue,
          expiresAt,
        },
      });

      // Redirect to frontend with tokens as query params
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const params = new URLSearchParams({
        accessToken: tokens.accessToken,
        refreshToken: rtValue,
      });

      res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
    } catch (error) {
      next(error);
    }
  }
);

// ─── GET /me ─────────────────────────────────────────────────────
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          phone: true,
          locale: true,
          authProvider: true,
          settings: true,
          createdAt: true,
          _count: { select: { pets: true } },
        },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
