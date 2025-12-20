import { Router, Response } from 'express';
import { Farmer } from '../models/Farmer';
import { ApprovalRequest } from '../models/ApprovalRequest';
import { Notification } from '../models/Notification';
import { auth, AuthRequest } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { logAudit, auditActions } from '../services/auditService';

const router = Router();

// Get all farmers with filters
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      localMrId, registeredBy, valueChain, farmerCategory, 
      farmerRating, subcounty, ward, approvalStatus, search,
      page = 1, limit = 50 
    } = req.query;

    const query: any = {};

    // Role-based filtering
    if (req.user?.role === 'tot') {
      query.registeredBy = req.user._id;
    } else if (req.user?.role === 'manager' && req.user.localMrId) {
      query.localMrId = req.user.localMrId;
    }

    // Additional filters
    if (localMrId) query.localMrId = localMrId;
    if (registeredBy) query.registeredBy = registeredBy;
    if (valueChain) query.valueChain = valueChain;
    if (farmerCategory) query.farmerCategory = farmerCategory;
    if (farmerRating) query.farmerRating = farmerRating;
    if (subcounty) query['location.subcounty'] = subcounty;
    if (ward) query['location.ward'] = ward;
    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [farmers, total] = await Promise.all([
      Farmer.find(query)
        .populate('localMrId', 'name code')
        .populate('registeredBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Farmer.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: farmers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch farmers' });
  }
});

// Get single farmer
router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const farmer = await Farmer.findById(req.params.id)
      .populate('localMrId', 'name code')
      .populate('registeredBy', 'name');

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    res.json({ success: true, data: farmer });
  } catch (error) {
    console.error('Get farmer error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch farmer' });
  }
});

// Create farmer (TOT creates approval request, Admin creates directly)
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const farmerData = {
      ...req.body,
      registeredBy: user._id,
      localMrId: user.localMrId || req.body.localMrId,
      createdBy: user._id,
    };

    // If TOT, create approval request instead of direct creation
    if (user.role === 'tot') {
      farmerData.approvalStatus = 'pending';
      
      const approval = await ApprovalRequest.create({
        type: 'FARMER_ADD',
        status: 'pending',
        requestedBy: user._id,
        entity: 'Farmer',
        payload: farmerData,
        localMrId: user.localMrId,
      });

      // Create notification for manager
      await Notification.create({
        type: 'farmer_approval',
        title: 'New Farmer Registration',
        message: `${user.name} has requested to add farmer: ${farmerData.name}`,
        localMrId: user.localMrId,
      });

      return res.status(201).json({
        success: true,
        data: { approvalId: approval._id, status: 'pending_approval' },
        message: 'Farmer registration submitted for approval',
      });
    }

    // Admin/Manager can create directly
    farmerData.approvalStatus = 'approved';
    const farmer = await Farmer.create(farmerData);

    await logAudit({
      action: auditActions.CREATE,
      entity: 'Farmer',
      entityId: farmer._id.toString(),
      actor: user,
      after: farmer.toObject(),
      req,
    });

    res.status(201).json({ success: true, data: farmer });
  } catch (error) {
    console.error('Create farmer error:', error);
    res.status(500).json({ success: false, message: 'Failed to create farmer' });
  }
});

// Update farmer
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const farmer = await Farmer.findById(req.params.id);

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    const beforeData = farmer.toObject();

    // TOTs need approval for edits
    if (user.role === 'tot') {
      const approval = await ApprovalRequest.create({
        type: 'FARMER_EDIT',
        status: 'pending',
        requestedBy: user._id,
        targetEntityId: farmer._id,
        entity: 'Farmer',
        payload: req.body,
        localMrId: user.localMrId,
      });

      await Notification.create({
        type: 'farmer_approval',
        title: 'Farmer Edit Request',
        message: `${user.name} has requested to edit farmer: ${farmer.name}`,
        localMrId: user.localMrId,
      });

      return res.json({
        success: true,
        data: { approvalId: approval._id, status: 'pending_approval' },
        message: 'Edit request submitted for approval',
      });
    }

    // Admin/Manager can update directly
    Object.assign(farmer, req.body, {
      lastEditedBy: user._id,
      lastEditedAt: new Date(),
    });
    await farmer.save();

    await logAudit({
      action: auditActions.UPDATE,
      entity: 'Farmer',
      entityId: farmer._id.toString(),
      actor: user,
      before: beforeData,
      after: farmer.toObject(),
      req,
    });

    res.json({ success: true, data: farmer });
  } catch (error) {
    console.error('Update farmer error:', error);
    res.status(500).json({ success: false, message: 'Failed to update farmer' });
  }
});

// Delete farmer (admin only)
router.delete('/:id', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const farmer = await Farmer.findByIdAndDelete(req.params.id);

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    await logAudit({
      action: auditActions.DELETE,
      entity: 'Farmer',
      entityId: farmer._id.toString(),
      actor: req.user!,
      before: farmer.toObject(),
      req,
    });

    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error('Delete farmer error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete farmer' });
  }
});

// Approve farmer
router.post('/:id/approve', auth, roleGuard('admin', 'manager'), async (req: AuthRequest, res: Response) => {
  try {
    const farmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'approved' },
      { new: true }
    );

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    await logAudit({
      action: auditActions.APPROVE,
      entity: 'Farmer',
      entityId: farmer._id.toString(),
      actor: req.user!,
      req,
    });

    res.json({ success: true, data: farmer });
  } catch (error) {
    console.error('Approve farmer error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve farmer' });
  }
});

// Reject farmer
router.post('/:id/reject', auth, roleGuard('admin', 'manager'), async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    
    const farmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'rejected' },
      { new: true }
    );

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    await logAudit({
      action: auditActions.REJECT,
      entity: 'Farmer',
      entityId: farmer._id.toString(),
      actor: req.user!,
      after: { reason },
      req,
    });

    res.json({ success: true, data: farmer });
  } catch (error) {
    console.error('Reject farmer error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject farmer' });
  }
});

// Get farmer activity summary
router.get('/:id/activity', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { Sale } = await import('../models/Sale');
    const { MechanisationJob } = await import('../models/MechanisationJob');
    const { Training } = await import('../models/Training');
    const { Visit } = await import('../models/Visit');

    const farmerId = req.params.id;

    const [sales, mechanisation, trainings, visits] = await Promise.all([
      Sale.aggregate([
        { $match: { farmerId: farmerId, status: 'completed' } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$total' } } },
      ]),
      MechanisationJob.countDocuments({ farmerId, status: 'completed' }),
      Training.countDocuments({ attendees: farmerId }),
      Visit.countDocuments({ farmerId }),
    ]);

    res.json({
      success: true,
      data: {
        totalPurchases: sales[0]?.count || 0,
        totalSpent: sales[0]?.total || 0,
        mechanisationCount: mechanisation,
        trainingsAttended: trainings,
        visitsCount: visits,
      },
    });
  } catch (error) {
    console.error('Get farmer activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to get farmer activity' });
  }
});

export default router;
