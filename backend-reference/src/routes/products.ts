import { Router, Response } from 'express';
import { Product } from '../models/Product';
import { auth, AuthRequest } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { logAudit, auditActions } from '../services/auditService';

const router = Router();

router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { category, inStock, search, page = 1, limit = 50 } = req.query;
    const query: any = {};
    if (category) query.category = category;
    if (inStock === 'true') query.inStock = { $gt: 0 };
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort({ name: 1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);
    res.json({ success: true, data: products, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

router.get('/performance', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { Sale } = await import('../models/Sale');
    const data = await Sale.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$productId', totalSold: { $sum: '$quantity' }, totalRevenue: { $sum: '$total' }, totalCommission: { $sum: '$commissionAmount' } } },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $sort: { totalRevenue: -1 } },
    ]);
    res.json({ success: true, data: data.map(d => ({ productId: d._id, productName: d.product.name, totalSold: d.totalSold, totalRevenue: d.totalRevenue, totalCommission: d.totalCommission })) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get product performance' });
  }
});

router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

router.post('/', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.create({ ...req.body, createdBy: req.user!._id });
    await logAudit({ action: auditActions.CREATE, entity: 'Product', entityId: product._id.toString(), actor: req.user!, after: product.toObject(), req });
    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'SKU already exists' });
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
});

router.put('/:id', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const before = await Product.findById(req.params.id);
    if (!before) return res.status(404).json({ success: false, message: 'Product not found' });
    const product = await Product.findByIdAndUpdate(req.params.id, { ...req.body, lastEditedBy: req.user!._id, lastEditedAt: new Date() }, { new: true });
    await logAudit({ action: auditActions.UPDATE, entity: 'Product', entityId: product!._id.toString(), actor: req.user!, before: before.toObject(), after: product!.toObject(), req });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

router.patch('/:id/stock', auth, roleGuard('admin', 'manager'), async (req: AuthRequest, res: Response) => {
  try {
    const { inStock } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { inStock, lastEditedBy: req.user!._id, lastEditedAt: new Date() }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update stock' });
  }
});

router.delete('/:id', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await logAudit({ action: auditActions.DELETE, entity: 'Product', entityId: product._id.toString(), actor: req.user!, before: product.toObject(), req });
    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

export default router;
