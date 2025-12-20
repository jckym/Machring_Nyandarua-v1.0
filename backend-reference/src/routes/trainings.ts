import { Router, Response } from 'express';
import { Training } from '../models/Training';
import { Farmer } from '../models/Farmer';
import { auth, AuthRequest } from '../middleware/auth';
import { logAudit, auditActions } from '../services/auditService';

const router = Router();

router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { trainerId, localMrId, status, type, page = 1, limit = 50 } = req.query;
    const query: any = {};
    if (req.user?.role === 'tot') query.trainerId = req.user._id;
    else if (req.user?.role === 'manager' && req.user.localMrId) query.localMrId = req.user.localMrId;
    if (trainerId) query.trainerId = trainerId;
    if (localMrId) query.localMrId = localMrId;
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    const [trainings, total] = await Promise.all([
      Training.find(query).populate('trainerId', 'name').populate('attendees', 'name').sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Training.countDocuments(query),
    ]);
    res.json({ success: true, data: trainings, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trainings' });
  }
});

router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const training = await Training.findById(req.params.id).populate('trainerId', 'name').populate('attendees', 'name phone');
    if (!training) return res.status(404).json({ success: false, message: 'Training not found' });
    res.json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch training' });
  }
});

router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { title, type, date, location, duration, topics, attendees } = req.body;
    const training = await Training.create({
      title, type, date, location, duration, topics, attendees: attendees || [],
      trainerId: user._id, localMrId: user.localMrId, status: 'Upcoming', createdBy: user._id,
    });
    await logAudit({ action: auditActions.CREATE, entity: 'Training', entityId: training._id.toString(), actor: user, after: training.toObject(), req });
    res.status(201).json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create training' });
  }
});

router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const training = await Training.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!training) return res.status(404).json({ success: false, message: 'Training not found' });
    res.json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update training' });
  }
});

router.post('/:id/attendees', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { farmerIds } = req.body;
    const training = await Training.findByIdAndUpdate(req.params.id, { $addToSet: { attendees: { $each: farmerIds } } }, { new: true });
    if (!training) return res.status(404).json({ success: false, message: 'Training not found' });
    await Farmer.updateMany({ _id: { $in: farmerIds } }, { $inc: { trainingsAttended: 1 }, lastActivityDate: new Date() });
    res.json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add attendees' });
  }
});

router.post('/:id/complete', auth, async (req: AuthRequest, res: Response) => {
  try {
    const training = await Training.findByIdAndUpdate(req.params.id, { status: 'Completed' }, { new: true });
    if (!training) return res.status(404).json({ success: false, message: 'Training not found' });
    res.json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to complete training' });
  }
});

router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);
    if (!training) return res.status(404).json({ success: false, message: 'Training not found' });
    await logAudit({ action: auditActions.DELETE, entity: 'Training', entityId: training._id.toString(), actor: req.user!, before: training.toObject(), req });
    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete training' });
  }
});

export default router;
