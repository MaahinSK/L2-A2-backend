import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import issuesRoutes from './modules/issues/issues.routes';
import { errorHandler } from './middleware/errorHandler';
import { sendError } from './utils/response';
import { StatusCodes } from 'http-status-codes';

const app = express();

// Middleware
const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow wildcard
    if (allowedOrigins.includes('*')) return callback(null, true);
    // Allow specific origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'DevPulse API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      issues: '/api/issues',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  sendError(res, 'Route not found', null, StatusCodes.NOT_FOUND);
});

// Global error handler
app.use(errorHandler);

// Export for Vercel
export default app;

// Start server only if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = env.port || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 API available at http://localhost:${PORT}/api`);
  });
}