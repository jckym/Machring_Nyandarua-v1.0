import { Router, Response } from 'express';
import { Notification } from '../models/Notification';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, localMrId, type, read, page = 1, limit = 50 } = req.query;
    const query: any = {};
    if (userId) query.userId = userId;
    if (localMrId) query.localMrId = localMrId;
    if (type) query.type = type;
    if (read !== undefined) query.read = read === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [notifications, total] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Notification.countDocuments(query),
    ]);
    res.json({ success: true, data: notifications, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

router.get('/me', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { read, page = 1, limit = 50 } = req.query;
    const query: any = { $or: [{ userId: req.user!._id }, { localMrId: req.user!.localMrId }] };
    if (read !== undefined) query.read = read === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

router.get('/unread-count', auth, async (req: AuthRequest, res: Response) => {
  try {
    const count = await Notification.countDocuments({
      $or: [{ userId: req.user!._id }, { localMrId: req.user!.localMrId }],
      read: false,
    });
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get unread count' });
  }
});

router.patch('/:id/read', auth, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

router.patch('/read', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    const result = await Notification.updateMany({ _id: { $in: ids } }, { read: true });
    res.json({ success: true, data: { updated: result.modifiedCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

router.patch('/read-all', auth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await Notification.updateMany(
      { $or: [{ userId: req.user!._id }, { localMrId: req.user!.localMrId }], read: false },
      { read: true }
    );
    res.json({ success: true, data: { updated: result.modifiedCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
});

router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
});

router.delete('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    const result = await Notification.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, data: { deleted: result.deletedCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete notifications' });
  }
});

router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

export default router;
