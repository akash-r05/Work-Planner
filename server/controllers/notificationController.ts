import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { NotificationModel, ActivityModel } from '../models/index.js';

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const userId = req.user._id;

    const list = await NotificationModel.find(n => n.recipient === userId);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = list.filter(n => !n.readAt).length;

    return res.json({
      success: true,
      notifications: list,
      unreadCount,
    });
  } catch (error: any) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications' });
  }
}

export async function markAsRead(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;

    const notif = await NotificationModel.findById(id);
    if (!notif || notif.recipient !== req.user._id) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const updated = await NotificationModel.findByIdAndUpdate(id, {
      readAt: new Date().toISOString(),
    });

    return res.json({ success: true, notification: updated });
  } catch (error: any) {
    console.error('markAsRead error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const userId = req.user._id;

    const list = await NotificationModel.find(n => n.recipient === userId && !n.readAt);
    const now = new Date().toISOString();

    for (const item of list) {
      await NotificationModel.findByIdAndUpdate(item._id, { readAt: now });
    }

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('markAllAsRead error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
}

export async function getActivities(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const userId = req.user._id;

    const list = await ActivityModel.find(a => a.actor === userId);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({ success: true, activities: list.slice(0, 30) });
  } catch (error: any) {
    console.error('getActivities error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve activities' });
  }
}
