import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
  jti?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

/**
 * Sign an access token (15 minute expiry).
 */
export function signAccessToken(userId: string, email: string): string {
  return jwt.sign(
    {
      sub: userId,
      email,
      type: 'access',
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Sign a refresh token (7 day expiry).
 * Each refresh token has a unique jti for revocation tracking.
 */
export function signRefreshToken(userId: string, email: string): { token: string; jti: string; expiresAt: Date } {
  const jti = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const token = jwt.sign(
    {
      sub: userId,
      email,
      type: 'refresh',
      jti,
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { token, jti, expiresAt };
}

/**
 * Generate a complete token pair.
 */
export function generateTokenPair(userId: string, email: string): TokenPair {
  const accessToken = signAccessToken(userId, email);
  const { token: refreshToken, expiresAt: refreshTokenExpiresAt } = signRefreshToken(userId, email);

  const accessTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  };
}

/**
 * Verify a JWT token and return the payload.
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

/**
 * Decode token without verification (for inspection).
 */
export function decodeToken(token: string): TokenPayload | null {
  return jwt.decode(token) as TokenPayload | null;
}
