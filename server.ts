import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './server/routes/authRoutes.js';
import taskRoutes from './server/routes/taskRoutes.js';
import projectRoutes from './server/routes/projectRoutes.js';
import dashboardRoutes from './server/routes/dashboardRoutes.js';
import notificationRoutes from './server/routes/notificationRoutes.js';
import { seedDatabase } from './server/scripts/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security and parser middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Seed API endpoint for instant demo reset
app.post('/api/v1/seed', async (req: Request, res: Response) => {
  try {
    const force = req.query.force === 'true';
    const result = await seedDatabase(force);
    res.json(result);
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, message: 'Failed to seed database' });
  }
});

// Mount REST API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Work Planner API', version: '1.0.0' });
});

// Auto seed on boot if empty
seedDatabase(false).catch(err => console.error('Auto-seed error:', err));

// Development Vite integration or Production static files
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Centralized error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Work Planner server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
