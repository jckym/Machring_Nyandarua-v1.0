import { Router, Response } from 'express';
import { Machinery } from '../models/Machinery';
import { auth, AuthRequest } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { logAudit, auditActions } from '../services/auditService';

const router = Router();

router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { localMrId, category, status, page = 1, limit = 50 } = req.query;
    const query: any = {};
    if (localMrId) query.localMrId = localMrId;
    if (category) query.category = category;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [machinery, total] = await Promise.all([
      Machinery.find(query).populate('localMrId', 'name').sort({ name: 1 }).skip(skip).limit(Number(limit)),
      Machinery.countDocuments(query),
    ]);
    res.json({ success: true, data: machinery, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch machinery' });
  }
});

router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const machinery = await Machinery.findById(req.params.id).populate('localMrId', 'name');
    if (!machinery) return res.status(404).json({ success: false, message: 'Machinery not found' });
    res.json({ success: true, data: machinery });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch machinery' });
  }
});

router.post('/', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const machinery = await Machinery.create(req.body);
    await logAudit({ action: auditActions.CREATE, entity: 'Machinery', entityId: machinery._id.toString(), actor: req.user!, after: machinery.toObject(), req });
    res.status(201).json({ success: true, data: machinery });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create machinery' });
  }
});

router.put('/:id', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const machinery = await Machinery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!machinery) return res.status(404).json({ success: false, message: 'Machinery not found' });
    res.json({ success: true, data: machinery });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update machinery' });
  }
});

router.patch('/:id/status', auth, roleGuard('admin', 'manager'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const machinery = await Machinery.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!machinery) return res.status(404).json({ success: false, message: 'Machinery not found' });
    res.json({ success: true, data: machinery });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

router.delete('/:id', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const machinery = await Machinery.findByIdAndDelete(req.params.id);
    if (!machinery) return res.status(404).json({ success: false, message: 'Machinery not found' });
    await logAudit({ action: auditActions.DELETE, entity: 'Machinery', entityId: machinery._id.toString(), actor: req.user!, before: machinery.toObject(), req });
    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete machinery' });
  }
});

export default router;
