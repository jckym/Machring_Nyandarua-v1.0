import { Router, Response } from 'express';
import { User } from '../models/User';
import { auth, AuthRequest } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { logAudit, auditActions } from '../services/auditService';

const router = Router();

// Get all users
router.get('/', auth, roleGuard('admin', 'manager'), async (req: AuthRequest, res: Response) => {
  try {
    const { role, localMrId, status, search, page = 1, limit = 50 } = req.query;
    const query: any = {};

    if (role) query.role = role;
    if (localMrId) query.localMrId = localMrId;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Managers can only see users in their Local MR
    if (req.user?.role === 'manager' && req.user.localMrId) {
      query.localMrId = req.user.localMrId;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [users, total] = await Promise.all([
      User.find(query)
        .populate('localMrId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Get single user
router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).populate('localMrId', 'name');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// Create user (admin only)
router.post('/', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.create(req.body);
    await logAudit({ action: auditActions.CREATE, entity: 'User', entityId: user._id.toString(), actor: req.user!, after: user.toObject(), req });
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Email already exists' });
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const before = await User.findById(req.params.id);
    if (!before) return res.status(404).json({ success: false, message: 'User not found' });
    
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit({ action: auditActions.UPDATE, entity: 'User', entityId: user!._id.toString(), actor: req.user!, before: before.toObject(), after: user!.toObject(), req });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await logAudit({ action: auditActions.DELETE, entity: 'User', entityId: user._id.toString(), actor: req.user!, before: user.toObject(), req });
    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

export default router;
