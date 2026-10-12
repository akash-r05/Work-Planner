import { Router } from 'express';
import {
  getDashboardSummary,
  getProductivityAnalytics,
  getTaskAnalytics,
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/summary', getDashboardSummary);
router.get('/analytics/productivity', getProductivityAnalytics);
router.get('/analytics/tasks', getTaskAnalytics);

export default router;
