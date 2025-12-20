import { Router, Response } from 'express';
import { MechanisationJob } from '../models/MechanisationJob';
import { Machinery } from '../models/Machinery';
import { Farmer } from '../models/Farmer';
import { Notification } from '../models/Notification';
import { auth, AuthRequest } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { logAudit, auditActions } from '../services/auditService';

const router = Router();

router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { farmerId, machineryId, localMrId, bookedBy, status, serviceType, page = 1, limit = 50 } = req.query;
    const query: any = {};
    
    if (req.user?.role === 'tot') query.bookedBy = req.user._id;
    else if (req.user?.role === 'manager' && req.user.localMrId) query.localMrId = req.user.localMrId;
    
    if (farmerId) query.farmerId = farmerId;
    if (machineryId) query.machineryId = machineryId;
    if (localMrId) query.localMrId = localMrId;
    if (bookedBy) query.bookedBy = bookedBy;
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      MechanisationJob.find(query)
        .populate('farmerId', 'name phone')
        .populate('machineryId', 'name category')
        .populate('bookedBy', 'name')
        .populate('localMrId', 'name')
        .sort({ scheduledDate: -1 })
        .skip(skip).limit(Number(limit)),
      MechanisationJob.countDocuments(query),
    ]);
    res.json({ success: true, data: jobs, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch mechanisation jobs' });
  }
});

router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const job = await MechanisationJob.findById(req.params.id)
      .populate('farmerId', 'name phone location')
      .populate('machineryId', 'name category pricePerAcre')
      .populate('bookedBy', 'name');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch job' });
  }
});

router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { farmerId, machineryId, serviceType, acreage, scheduledDate, notes, gpsLocation } = req.body;

    const machinery = await Machinery.findById(machineryId);
    if (!machinery) return res.status(400).json({ success: false, message: 'Machinery not found' });

    const farmer = await Farmer.findById(farmerId);
    if (!farmer) return res.status(400).json({ success: false, message: 'Farmer not found' });

    const totalPrice = acreage * machinery.pricePerAcre;
    const commissionAmount = totalPrice * 0.1;

    const job = await MechanisationJob.create({
      farmerId, localMrId: farmer.localMrId, machineryId, serviceType, acreage,
      pricePerAcre: machinery.pricePerAcre, totalPrice, commissionAmount,
      status: 'pending-approval', bookedBy: user._id, scheduledDate, notes, gpsLocation, createdBy: user._id,
    });

    await Notification.create({
      type: 'mechanisation_pending', title: 'Mechanisation Approval Required',
      message: `${farmer.name} has requested ${serviceType} service`, localMrId: farmer.localMrId,
    });

    await logAudit({ action: auditActions.CREATE, entity: 'MechanisationJob', entityId: job._id.toString(), actor: user, after: job.toObject(), req });
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
});

router.post('/:id/approve', auth, roleGuard('admin', 'manager'), async (req: AuthRequest, res: Response) => {
  try {
    const job = await MechanisationJob.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.status !== 'pending-approval') return res.status(400).json({ success: false, message: 'Job is not pending approval' });

    job.status = 'approved';
    job.approvedBy = req.user!._id;
    job.approvedAt = new Date();
    await job.save();

    await Notification.create({ type: 'mechanisation_approved', title: 'Booking Approved', message: `Your ${job.serviceType} booking has been approved`, userId: job.bookedBy });
    await logAudit({ action: auditActions.APPROVE, entity: 'MechanisationJob', entityId: job._id.toString(), actor: req.user!, req });
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve job' });
  }
});

router.post('/:id/reject', auth, roleGuard('admin', 'manager'), async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const job = await MechanisationJob.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    job.status = 'rejected';
    job.rejectedBy = req.user!._id;
    job.rejectedAt = new Date();
    job.rejectionReason = reason;
    await job.save();

    await Notification.create({ type: 'mechanisation_rejected', title: 'Booking Rejected', message: `Your ${job.serviceType} booking was rejected: ${reason}`, userId: job.bookedBy });
    await logAudit({ action: auditActions.REJECT, entity: 'MechanisationJob', entityId: job._id.toString(), actor: req.user!, after: { reason }, req });
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject job' });
  }
});

router.post('/:id/complete', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { summary, duration, outcome } = req.body;
    const job = await MechanisationJob.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    job.status = 'completed';
    job.completedDate = new Date();
    job.completionReport = { summary, duration, outcome, completedAt: new Date() };
    await job.save();

    const farmer = await Farmer.findById(job.farmerId);
    if (farmer) { farmer.mechanisationCount += 1; farmer.lastActivityDate = new Date(); await farmer.save(); }

    await Notification.create({ type: 'mechanisation_completed', title: 'Job Completed', message: `${job.serviceType} job completed. Commission: KES ${job.commissionAmount}`, userId: job.bookedBy });
    await logAudit({ action: auditActions.COMPLETE, entity: 'MechanisationJob', entityId: job._id.toString(), actor: req.user!, req });
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to complete job' });
  }
});

router.post('/:id/reschedule', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { scheduledDate } = req.body;
    const job = await MechanisationJob.findByIdAndUpdate(req.params.id, { rescheduledDate: new Date(scheduledDate), scheduledDate: new Date(scheduledDate) }, { new: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reschedule job' });
  }
});

export default router;
