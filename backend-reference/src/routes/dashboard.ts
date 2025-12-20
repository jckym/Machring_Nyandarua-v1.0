import { Router, Response } from 'express';
import { User } from '../models/User';
import { Farmer } from '../models/Farmer';
import { Sale } from '../models/Sale';
import { MechanisationJob } from '../models/MechanisationJob';
import { Visit } from '../models/Visit';
import { Training } from '../models/Training';
import { LocalMR } from '../models/LocalMR';
import { ApprovalRequest } from '../models/ApprovalRequest';
import { auth, AuthRequest } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

// Admin dashboard stats
router.get('/admin', auth, roleGuard('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalFarmers,
      totalMRs,
      totalTots,
      salesStats,
      mechanisationStats,
      pendingApprovals,
      activeTots,
    ] = await Promise.all([
      Farmer.countDocuments({ approvalStatus: 'approved' }),
      LocalMR.countDocuments(),
      User.countDocuments({ role: 'tot' }),
      Sale.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]),
      MechanisationJob.countDocuments({ status: 'completed' }),
      ApprovalRequest.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'tot', status: 'active' }),
    ]);

    res.json({
      success: true,
      data: {
        totalFarmers,
        totalMRs,
        totalTots,
        totalSales: salesStats[0]?.count || 0,
        totalRevenue: salesStats[0]?.revenue || 0,
        completedMechanisation: mechanisationStats,
        pendingApprovals,
        activeTots,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to get admin stats' });
  }
});

// Manager dashboard stats
router.get('/manager/:localMrId', auth, roleGuard('admin', 'manager'), async (req: AuthRequest, res: Response) => {
  try {
    const { localMrId } = req.params;

    const [
      totalFarmers,
      totalTots,
      salesStats,
      totalVisits,
      totalTrainings,
      pendingApprovals,
      pendingMechanisation,
    ] = await Promise.all([
      Farmer.countDocuments({ localMrId, approvalStatus: 'approved' }),
      User.countDocuments({ role: 'tot', localMrId }),
      Sale.aggregate([
        { $match: { localMrId, status: 'completed' } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]),
      Visit.countDocuments({ localMrId }),
      Training.countDocuments({ localMrId }),
      ApprovalRequest.countDocuments({ localMrId, status: 'pending' }),
      MechanisationJob.countDocuments({ localMrId, status: 'pending-approval' }),
    ]);

    res.json({
      success: true,
      data: {
        totalFarmers,
        totalTots,
        totalSales: salesStats[0]?.count || 0,
        totalRevenue: salesStats[0]?.revenue || 0,
        totalVisits,
        totalTrainings,
        pendingApprovals,
        pendingMechanisation,
      },
    });
  } catch (error) {
    console.error('Manager dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to get manager stats' });
  }
});

// TOT dashboard stats
router.get('/tot/:totId', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { totId } = req.params;

    // Ensure TOT can only see their own stats
    if (req.user?.role === 'tot' && req.user._id.toString() !== totId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [
      totalFarmers,
      salesStats,
      mechanisationJobs,
      visitsCompleted,
      trainingsHeld,
    ] = await Promise.all([
      Farmer.countDocuments({ registeredBy: totId, approvalStatus: 'approved' }),
      Sale.aggregate([
        { $match: { totId } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: { $sum: '$total' },
            commission: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$commissionAmount', 0] } },
          },
        },
      ]),
      MechanisationJob.countDocuments({ bookedBy: totId, status: 'completed' }),
      Visit.countDocuments({ totId }),
      Training.countDocuments({ trainerId: totId }),
    ]);

    res.json({
      success: true,
      data: {
        totalFarmers,
        totalSales: salesStats[0]?.count || 0,
        totalRevenue: salesStats[0]?.revenue || 0,
        totalCommission: salesStats[0]?.commission || 0,
        mechanisationJobs,
        visitsCompleted,
        trainingsHeld,
      },
    });
  } catch (error) {
    console.error('TOT dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to get TOT stats' });
  }
});

// TOT performance details
router.get('/tot/:totId/performance', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { totId } = req.params;
    const tot = await User.findById(totId).populate('localMrId', 'name');

    if (!tot) {
      return res.status(404).json({ success: false, message: 'TOT not found' });
    }

    const [salesData, mechanisationJobs, trainings, visits] = await Promise.all([
      Sale.aggregate([
        { $match: { totId, status: 'completed' } },
        {
          $group: {
            _id: '$productId',
            quantity: { $sum: '$quantity' },
            totalSales: { $sum: '$total' },
            commission: { $sum: '$commissionAmount' },
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
      ]),
      MechanisationJob.countDocuments({ bookedBy: totId, status: 'completed' }),
      Training.countDocuments({ trainerId: totId }),
      Visit.countDocuments({ totId }),
    ]);

    const totalSales = salesData.reduce((sum, s) => sum + s.totalSales, 0);
    const totalCommission = salesData.reduce((sum, s) => sum + s.commission, 0);

    res.json({
      success: true,
      data: {
        totId: tot._id,
        totName: tot.name,
        localMrId: tot.localMrId,
        status: tot.status,
        phone: tot.phone,
        email: tot.email,
        totalSales,
        totalCommission,
        mechanisationJobsCompleted: mechanisationJobs,
        trainingsConducted: trainings,
        visitsLogged: visits,
        lastActivityDate: tot.lastActivityDate,
        salesByProduct: salesData.map(s => ({
          productId: s._id,
          productName: s.product.name,
          quantity: s.quantity,
          totalSales: s.totalSales,
          commission: s.commission,
        })),
      },
    });
  } catch (error) {
    console.error('TOT performance error:', error);
    res.status(500).json({ success: false, message: 'Failed to get TOT performance' });
  }
});

// Get all TOTs performance for a Local MR
router.get('/mr/:localMrId/tots', auth, roleGuard('admin', 'manager'), async (req: AuthRequest, res: Response) => {
  try {
    const { localMrId } = req.params;
    const tots = await User.find({ role: 'tot', localMrId });

    const performances = await Promise.all(
      tots.map(async (tot) => {
        const [salesData, mechanisation, trainings, visits] = await Promise.all([
          Sale.aggregate([
            { $match: { totId: tot._id, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$total' }, commission: { $sum: '$commissionAmount' } } },
          ]),
          MechanisationJob.countDocuments({ bookedBy: tot._id, status: 'completed' }),
          Training.countDocuments({ trainerId: tot._id }),
          Visit.countDocuments({ totId: tot._id }),
        ]);

        return {
          totId: tot._id,
          totName: tot.name,
          status: tot.status,
          phone: tot.phone,
          email: tot.email,
          totalSales: salesData[0]?.total || 0,
          totalCommission: salesData[0]?.commission || 0,
          mechanisationJobsCompleted: mechanisation,
          trainingsConducted: trainings,
          visitsLogged: visits,
          lastActivityDate: tot.lastActivityDate,
        };
      })
    );

    res.json({ success: true, data: performances });
  } catch (error) {
    console.error('Local MR TOTs error:', error);
    res.status(500).json({ success: false, message: 'Failed to get TOTs performance' });
  }
});

// Monthly sales data for charts
router.get('/sales/monthly', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { localMrId, totId, year } = req.query;
    const currentYear = Number(year) || new Date().getFullYear();

    const match: any = {
      date: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`),
      },
      status: 'completed',
    };

    if (localMrId) match.localMrId = localMrId;
    if (totId) match.totId = totId;

    const data = await Sale.aggregate([
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
    const result = months.map((month, i) => {
      const d = data.find(x => x._id === i + 1);
      return { month, value: d?.value || 0, count: d?.count || 0 };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Monthly sales error:', error);
    res.status(500).json({ success: false, message: 'Failed to get monthly sales' });
  }
});

// Product performance data for charts
router.get('/products/performance', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { localMrId } = req.query;
    const match: any = { status: 'completed' };
    if (localMrId) match.localMrId = localMrId;

    const data = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$productId',
          value: { $sum: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      { $sort: { value: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: data.map(d => ({
        productId: d._id,
        name: d.product.name.split(' ')[0],
        value: d.value,
      })),
    });
  } catch (error) {
    console.error('Product performance error:', error);
    res.status(500).json({ success: false, message: 'Failed to get product performance' });
  }
});

export default router;
