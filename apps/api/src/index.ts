import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from './config/passport';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth.routes';
import petRoutes from './routes/pets.routes';
import noteRoutes from './routes/notes.routes';
import calendarRoutes from './routes/calendar.routes';
import photoRoutes from './routes/photos.routes';
import friendRoutes from './routes/friends.routes';
import locationRoutes from './routes/locations.routes';
import foundRoutes from './routes/found.routes';
import adminRoutes from './routes/admin.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport initialization
app.use(passport.initialize());

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/found', foundRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Resource not found',
    },
  });
});

// Global Error Handler
app.use(errorHandler);

export { app };
export default app;

// Start server (runs everywhere except when imported as a Cloudflare Worker)
if (process.env.IS_WORKER !== 'true') {
  const server = app.listen(PORT, () => {
    console.log(`🐾 PET ID API server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
      console.log('Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
