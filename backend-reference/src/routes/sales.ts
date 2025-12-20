import { Router, Response } from 'express';
import { Sale } from '../models/Sale';
import { Product } from '../models/Product';
import { Farmer } from '../models/Farmer';
import { Notification } from '../models/Notification';
import { auth, AuthRequest } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { logAudit, auditActions } from '../services/auditService';

const router = Router();

// Get all sales with filters
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      totId, farmerId, productId, localMrId, status,
      startDate, endDate, search, page = 1, limit = 50
    } = req.query;

    const query: any = {};

    // Role-based filtering
    if (req.user?.role === 'tot') {
      query.totId = req.user._id;
    } else if (req.user?.role === 'manager' && req.user.localMrId) {
      query.localMrId = req.user.localMrId;
    }

    // Additional filters
    if (totId) query.totId = totId;
    if (farmerId) query.farmerId = farmerId;
    if (productId) query.productId = productId;
    if (localMrId) query.localMrId = localMrId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate('totId', 'name')
        .populate('farmerId', 'name phone')
        .populate('productId', 'name sku')
        .populate('localMrId', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Sale.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: sales,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sales' });
  }
});

// Get single sale
router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('totId', 'name')
      .populate('farmerId', 'name phone')
      .populate('productId', 'name sku category')
      .populate('localMrId', 'name');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    res.json({ success: true, data: sale });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sale' });
  }
});

// Create sale
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { farmerId, productId, quantity } = req.body;

    // Get product for price and commission
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ success: false, message: 'Product not found' });
    }

    if (product.inStock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    // Get farmer for localMrId
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return res.status(400).json({ success: false, message: 'Farmer not found' });
    }

    const total = product.unitPrice * quantity;
    const commissionAmount = product.commission * quantity;

    const sale = await Sale.create({
      totId: user.role === 'tot' ? user._id : req.body.totId,
      localMrId: farmer.localMrId,
      farmerId,
      productId,
      quantity,
      unitPrice: product.unitPrice,
      total,
      commissionAmount,
      date: new Date(),
      status: 'pending',
      createdBy: user._id,
    });

    // Update product stock
    product.inStock -= quantity;
    await product.save();

    // Update farmer purchase count
    farmer.totalPurchases += 1;
    farmer.lastActivityDate = new Date();
    await farmer.save();

    await logAudit({
      action: auditActions.CREATE,
      entity: 'Sale',
      entityId: sale._id.toString(),
      actor: user,
      after: sale.toObject(),
      req,
    });

    res.status(201).json({ success: true, data: sale });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ success: false, message: 'Failed to create sale' });
  }
});

// Update sale
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    if (sale.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot update completed/cancelled sale' });
    }

    const beforeData = sale.toObject();
    Object.assign(sale, req.body, {
      lastEditedBy: user._id,
      lastEditedAt: new Date(),
    });
    await sale.save();

    await logAudit({
      action: auditActions.UPDATE,
      entity: 'Sale',
      entityId: sale._id.toString(),
      actor: user,
      before: beforeData,
      after: sale.toObject(),
      req,
    });

    res.json({ success: true, data: sale });
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ success: false, message: 'Failed to update sale' });
  }
});

// Complete sale (manager action)
router.post('/:id/complete', auth, roleGuard('admin', 'manager'), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    if (sale.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Sale is not pending' });
    }

    sale.status = 'completed';
    sale.approvedBy = user._id;
    sale.approvedAt = new Date();
    await sale.save();

    // Notify TOT of commission
    await Notification.create({
      type: 'sale_completed',
      title: 'Sale Completed',
      message: `Sale #${sale._id} completed. Commission: KES ${sale.commissionAmount}`,
      userId: sale.totId,
      localMrId: sale.localMrId,
    });

    await logAudit({
      action: auditActions.COMPLETE,
      entity: 'Sale',
      entityId: sale._id.toString(),
      actor: user,
      req,
    });

    res.json({ success: true, data: sale });
  } catch (error) {
    console.error('Complete sale error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete sale' });
  }
});

// Cancel sale
router.post('/:id/cancel', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { reason } = req.body;
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    if (sale.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only cancel pending sales' });
    }

    // Restore stock
    const product = await Product.findById(sale.productId);
    if (product) {
      product.inStock += sale.quantity;
      await product.save();
    }

    sale.status = 'cancelled';
    sale.cancellationReason = reason;
    await sale.save();

    await logAudit({
      action: auditActions.CANCEL,
      entity: 'Sale',
      entityId: sale._id.toString(),
      actor: user,
      after: { reason },
      req,
    });

    res.json({ success: true, data: sale });
  } catch (error) {
    console.error('Cancel sale error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel sale' });
  }
});

// Get sales stats
router.get('/stats', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { localMrId, totId, startDate, endDate } = req.query;
    const match: any = {};

    if (req.user?.role === 'tot') {
      match.totId = req.user._id;
    } else if (localMrId) {
      match.localMrId = localMrId;
    }
    if (totId) match.totId = totId;

    const stats = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$total', 0] } },
          totalCommission: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$commissionAmount', 0] } },
          pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalSales: 0,
        totalRevenue: 0,
        totalCommission: 0,
        pendingCount: 0,
        completedCount: 0,
      },
    });
  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get sales stats' });
  }
});

// Get monthly sales data
router.get('/monthly', auth, async (req: AuthRequest, res: Response) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const match: any = {
      date: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      },
      status: 'completed',
    };

    if (req.user?.role === 'tot') {
      match.totId = req.user._id;
    }

    const monthlyData = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $month: '$date' },
          value: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = months.map((month, index) => {
      const data = monthlyData.find(d => d._id === index + 1);
      return {
        month,
        value: data?.value || 0,
        count: data?.count || 0,
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get monthly sales error:', error);
    res.status(500).json({ success: false, message: 'Failed to get monthly sales' });
  }
});

export default router;
