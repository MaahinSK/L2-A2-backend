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
app.use(cors({
  origin: env.corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  sendError(res, 'Route not found', null, StatusCodes.NOT_FOUND);
});

// Global error handler
app.use(errorHandler);

// Start server only if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(env.port, () => {
    console.log(`🚀 Server running on http://localhost:${env.port}`);
    console.log(`📝 API available at http://localhost:${env.port}/api`);
  });
}

export default app;