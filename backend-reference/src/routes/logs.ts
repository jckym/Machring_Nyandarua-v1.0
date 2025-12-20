import { Router, Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { auth, AuthRequest } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

// System logs (simplified - in production you'd use a proper logging service)
router.get('/system', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { level, source, userId, startDate, endDate, page = 1, limit = 100 } = req.query;
    
    // For now, return audit logs as system logs - in production, use a separate collection
    const query: any = {};
    if (userId) query.actorId = userId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(query).populate('actorId', 'name').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      AuditLog.countDocuments(query),
    ]);

    // Transform to system log format
    const systemLogs = logs.map(log => ({
      id: log._id,
      level: 'info',
      message: `${log.action} on ${log.entity}`,
      source: log.entity,
      userId: log.actorId,
      createdAt: log.createdAt,
    }));

    res.json({ success: true, data: systemLogs, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch system logs' });
  }
});

// Audit logs
router.get('/audit', auth, roleGuard('admin', 'manager'), async (req: AuthRequest, res: Response) => {
  try {
    const { action, entity, actorId, startDate, endDate, page = 1, limit = 100 } = req.query;
    const query: any = {};
    
    if (action) query.action = action;
    if (entity) query.entity = entity;
    if (actorId) query.actorId = actorId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(query).populate('actorId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      AuditLog.countDocuments(query),
    ]);

    const formattedLogs = logs.map(log => ({
      id: log._id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      actorId: log.actorId,
      actorName: (log.actorId as any)?.name || 'Unknown',
      actorRole: log.actorRole,
      before: log.before,
      after: log.after,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
    }));

    res.json({ success: true, data: formattedLogs, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
});

// Export endpoints would generate Excel/PDF files - simplified here
router.get('/system/export', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  res.status(501).json({ success: false, message: 'Export functionality requires additional libraries (exceljs, pdfkit)' });
});

router.get('/audit/export', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  res.status(501).json({ success: false, message: 'Export functionality requires additional libraries (exceljs, pdfkit)' });
});

export default router;
