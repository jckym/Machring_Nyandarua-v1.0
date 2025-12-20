import { Router, Response } from 'express';
import { Visit } from '../models/Visit';
import { Farmer } from '../models/Farmer';
import { auth, AuthRequest } from '../middleware/auth';
import { logAudit, auditActions } from '../services/auditService';

const router = Router();

router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { farmerId, totId, localMrId, startDate, endDate, purpose, page = 1, limit = 50 } = req.query;
    const query: any = {};
    if (req.user?.role === 'tot') query.totId = req.user._id;
    else if (req.user?.role === 'manager' && req.user.localMrId) query.localMrId = req.user.localMrId;
    if (farmerId) query.farmerId = farmerId;
    if (totId) query.totId = totId;
    if (localMrId) query.localMrId = localMrId;
    if (purpose) query.purpose = { $regex: purpose, $options: 'i' };
    if (startDate || endDate) { query.date = {}; if (startDate) query.date.$gte = new Date(startDate as string); if (endDate) query.date.$lte = new Date(endDate as string); }

    const skip = (Number(page) - 1) * Number(limit);
    const [visits, total] = await Promise.all([
      Visit.find(query).populate('farmerId', 'name').populate('totId', 'name').sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Visit.countDocuments(query),
    ]);
    res.json({ success: true, data: visits, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch visits' });
  }
});

router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const visit = await Visit.findById(req.params.id).populate('farmerId', 'name phone location').populate('totId', 'name');
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    res.json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch visit' });
  }
});

router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { farmerId, date, purpose, notes, gpsLocation, images } = req.body;
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) return res.status(400).json({ success: false, message: 'Farmer not found' });

    const visit = await Visit.create({ farmerId, totId: user._id, localMrId: farmer.localMrId, date: date || new Date(), purpose, notes, gpsLocation, images, createdBy: user._id });
    farmer.visitsCount += 1; farmer.lastActivityDate = new Date(); await farmer.save();
    await logAudit({ action: auditActions.CREATE, entity: 'Visit', entityId: visit._id.toString(), actor: user, after: visit.toObject(), req });
    res.status(201).json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create visit' });
  }
});

router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const visit = await Visit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    res.json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update visit' });
  }
});

router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const visit = await Visit.findByIdAndDelete(req.params.id);
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    await logAudit({ action: auditActions.DELETE, entity: 'Visit', entityId: visit._id.toString(), actor: req.user!, before: visit.toObject(), req });
    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete visit' });
  }
});

export default router;
