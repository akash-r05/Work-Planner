import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getActivities,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.get('/activities/list', getActivities);

export default router;
