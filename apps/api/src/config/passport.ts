import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithoutRequest } from 'passport-jwt';
import { Strategy as GoogleStrategy, StrategyOptions as GoogleStrategyOptions } from 'passport-google-oauth20';
import prisma from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// JWT Strategy
const jwtOptions: StrategyOptionsWithoutRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          locale: true,
          authProvider: true,
        },
      });

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google OAuth Strategy (only if credentials are configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const googleOptions: GoogleStrategyOptions = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
  };

  passport.use(
    new GoogleStrategy(
      googleOptions,
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          // Find or create user
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                displayName: profile.displayName || email.split('@')[0],
                avatarUrl: profile.photos?.[0]?.value || null,
                authProvider: 'google',
                authProviderId: profile.id,
              },
            });
          } else if (user.authProvider === 'local') {
            // Link Google account to existing local user
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                authProvider: 'google',
                authProviderId: profile.id,
                avatarUrl: user.avatarUrl || profile.photos?.[0]?.value || null,
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

export default passport;
