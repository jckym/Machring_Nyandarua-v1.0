import { Router, Response } from 'express';
import { LocalMR } from '../models/LocalMR';
import { User } from '../models/User';
import { Farmer } from '../models/Farmer';
import { Sale } from '../models/Sale';
import { auth, AuthRequest } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { logAudit, auditActions } from '../services/auditService';

const router = Router();

router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { subcounty, ward, managerId, search, page = 1, limit = 50 } = req.query;
    const query: any = {};
    
    if (subcounty) query.subcounty = subcounty;
    if (ward) query.ward = ward;
    if (managerId) query.managerId = managerId;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [mrs, total] = await Promise.all([
      LocalMR.find(query).populate('managerId', 'name').sort({ name: 1 }).skip(skip).limit(Number(limit)),
      LocalMR.countDocuments(query),
    ]);

    res.json({ success: true, data: mrs, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch Local MRs' });
  }
});

router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const mr = await LocalMR.findById(req.params.id).populate('managerId', 'name email phone');
    if (!mr) return res.status(404).json({ success: false, message: 'Local MR not found' });
    res.json({ success: true, data: mr });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch Local MR' });
  }
});

router.get('/:id/stats', auth, async (req: AuthRequest, res: Response) => {
  try {
    const localMrId = req.params.id;
    const [totalTots, totalFarmers, salesStats, mechanisation, trainings, visits] = await Promise.all([
      User.countDocuments({ role: 'tot', localMrId }),
      Farmer.countDocuments({ localMrId, approvalStatus: 'approved' }),
      Sale.aggregate([{ $match: { localMrId, status: 'completed' } }, { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
      require('../models/MechanisationJob').MechanisationJob.countDocuments({ localMrId, status: 'completed' }),
      require('../models/Training').Training.countDocuments({ localMrId }),
      require('../models/Visit').Visit.countDocuments({ localMrId }),
    ]);

    res.json({
      success: true,
      data: {
        totalTots, totalFarmers, totalSales: salesStats[0]?.count || 0, totalRevenue: salesStats[0]?.revenue || 0,
        totalMechanisationJobs: mechanisation, totalTrainings: trainings, totalVisits: visits,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get Local MR stats' });
  }
});

router.post('/', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const mr = await LocalMR.create(req.body);
    await logAudit({ action: auditActions.CREATE, entity: 'LocalMR', entityId: mr._id.toString(), actor: req.user!, after: mr.toObject(), req });
    res.status(201).json({ success: true, data: mr });
  } catch (error: any) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Code already exists' });
    res.status(500).json({ success: false, message: 'Failed to create Local MR' });
  }
});

router.put('/:id', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const before = await LocalMR.findById(req.params.id);
    if (!before) return res.status(404).json({ success: false, message: 'Local MR not found' });
    const mr = await LocalMR.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit({ action: auditActions.UPDATE, entity: 'LocalMR', entityId: mr!._id.toString(), actor: req.user!, before: before.toObject(), after: mr!.toObject(), req });
    res.json({ success: true, data: mr });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update Local MR' });
  }
});

router.delete('/:id', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const mr = await LocalMR.findByIdAndDelete(req.params.id);
    if (!mr) return res.status(404).json({ success: false, message: 'Local MR not found' });
    await logAudit({ action: auditActions.DELETE, entity: 'LocalMR', entityId: mr._id.toString(), actor: req.user!, before: mr.toObject(), req });
    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete Local MR' });
  }
});

export default router;
