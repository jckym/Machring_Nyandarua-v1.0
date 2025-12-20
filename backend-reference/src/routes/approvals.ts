import { Router, Response } from 'express';
import { ApprovalRequest } from '../models/ApprovalRequest';
import { Farmer } from '../models/Farmer';
import { Notification } from '../models/Notification';
import { auth, AuthRequest } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { logAudit, auditActions } from '../services/auditService';

const router = Router();

router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, requestedBy, localMrId, page = 1, limit = 50 } = req.query;
    const query: any = {};
    
    if (req.user?.role === 'manager' && req.user.localMrId) query.localMrId = req.user.localMrId;
    if (type) query.type = type;
    if (status) query.status = status;
    if (requestedBy) query.requestedBy = requestedBy;
    if (localMrId) query.localMrId = localMrId;

    const skip = (Number(page) - 1) * Number(limit);
    const [approvals, total] = await Promise.all([
      ApprovalRequest.find(query).populate('requestedBy', 'name').populate('localMrId', 'name').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      ApprovalRequest.countDocuments(query),
    ]);
    res.json({ success: true, data: approvals, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch approvals' });
  }
});

router.get('/pending-count', auth, async (req: AuthRequest, res: Response) => {
  try {
    const query: any = { status: 'pending' };
    if (req.user?.role === 'manager' && req.user.localMrId) query.localMrId = req.user.localMrId;
    if (req.query.localMrId) query.localMrId = req.query.localMrId;
    const count = await ApprovalRequest.countDocuments(query);
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get pending count' });
  }
});

router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const approval = await ApprovalRequest.findById(req.params.id).populate('requestedBy', 'name').populate('reviewedBy', 'name');
    if (!approval) return res.status(404).json({ success: false, message: 'Approval not found' });
    res.json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch approval' });
  }
});

router.post('/:id/approve', auth, roleGuard('admin', 'manager'), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const approval = await ApprovalRequest.findById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, message: 'Approval not found' });
    if (approval.status !== 'pending') return res.status(400).json({ success: false, message: 'Already processed' });

    approval.status = 'approved';
    approval.reviewedBy = user._id;
    approval.reviewedAt = new Date();
    await approval.save();

    // Execute the approved action
    if (approval.type === 'FARMER_ADD') {
      await Farmer.create({ ...approval.payload, approvalStatus: 'approved' });
    } else if (approval.type === 'FARMER_EDIT' && approval.targetEntityId) {
      await Farmer.findByIdAndUpdate(approval.targetEntityId, { ...approval.payload, approvalStatus: 'approved' });
    }

    await Notification.create({ type: 'farmer_approval', title: 'Request Approved', message: 'Your request has been approved', userId: approval.requestedBy });
    await logAudit({ action: auditActions.APPROVE, entity: 'ApprovalRequest', entityId: approval._id.toString(), actor: user, req });
    res.json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve' });
  }
});

router.post('/:id/reject', auth, roleGuard('admin', 'manager'), async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const user = req.user!;
    const approval = await ApprovalRequest.findById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, message: 'Approval not found' });

    approval.status = 'rejected';
    approval.reviewedBy = user._id;
    approval.reviewedAt = new Date();
    approval.rejectionReason = reason;
    await approval.save();

    await Notification.create({ type: 'farmer_approval', title: 'Request Rejected', message: `Your request was rejected: ${reason}`, userId: approval.requestedBy });
    await logAudit({ action: auditActions.REJECT, entity: 'ApprovalRequest', entityId: approval._id.toString(), actor: user, after: { reason }, req });
    res.json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject' });
  }
});

export default router;
