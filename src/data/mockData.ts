import { 
  Farmer, Product, Sale, MechanisationJob, Visit, Training, 
  LocalMR, User, DashboardStats, Machinery, Notification, ValueChain, TOTPerformance 
} from '@/types';

// -------------------- Local MRs --------------------
export const mockLocalMRs: LocalMR[] = [
  { id: 'lmr-001', code: 'NAK-C', name: 'Nakuru Central', county: 'Nakuru', subcounty: 'Nakuru East', location: 'Nakuru Town', managerId: 'manager-001', managerName: 'Sarah Wanjiku', totalTots: 12, totalFarmers: 450, createdAt: new Date('2024-01-01') },
  { id: 'lmr-002', code: 'ELD-W', name: 'Eldoret West', county: 'Uasin Gishu', subcounty: 'Eldoret West', location: 'Eldoret Town', managerId: 'manager-002', managerName: 'Michael Korir', totalTots: 8, totalFarmers: 320, createdAt: new Date('2024-01-01') },
];

// -------------------- TOTs --------------------
export const mockTots: User[] = [
  { id: 'tot-001', name: 'John Kamau', email: 'john.kamau@machineryring.ke', role: 'tot', phone: '+254712345678', localMrId: 'lmr-001', status: 'active', createdAt: new Date('2024-01-15'), lastActivityDate: new Date('2024-12-10') },
  { id: 'tot-002', name: 'Mary Njeri', email: 'mary.njeri@machineryring.ke', role: 'tot', phone: '+254712345679', localMrId: 'lmr-001', status: 'active', createdAt: new Date('2024-02-10'), lastActivityDate: new Date('2024-12-08') },
  { id: 'tot-003', name: 'Peter Mwangi', email: 'peter.mwangi@machineryring.ke', role: 'tot', phone: '+254712345680', localMrId: 'lmr-002', status: 'active', createdAt: new Date('2024-03-05'), lastActivityDate: new Date('2024-12-09') },
];

// -------------------- Products --------------------
export const mockProducts: Product[] = [
  { id: 'prod-001', name: 'DAP Fertilizer 50kg', sku: 'FERT-DAP-50', inStock: 250, unitPrice: 4500, description: 'Di-ammonium Phosphate fertilizer for planting', commission: 150, category: 'Fertilizers', createdAt: new Date('2024-01-01') },
  { id: 'prod-002', name: 'CAN Fertilizer 50kg', sku: 'FERT-CAN-50', inStock: 180, unitPrice: 3800, description: 'Calcium Ammonium Nitrate top-dressing fertilizer', commission: 120, category: 'Fertilizers', createdAt: new Date('2024-01-01') },
];

// -------------------- Sales --------------------
export const mockSales: Sale[] = [
  { id: 'sale-001', totId: 'tot-001', totName: 'John Kamau', localMrId: 'lmr-001', localMrName: 'Nakuru Central', farmerId: 'farmer-001', farmerName: 'James Kiprotich', productId: 'prod-001', productName: 'DAP Fertilizer 50kg', quantity: 4, unitPrice: 4500, total: 18000, commissionAmount: 600, date: new Date('2024-12-01'), status: 'completed', approvedBy: 'manager-001', approvedAt: new Date('2024-12-02') },
  { id: 'sale-002', totId: 'tot-001', totName: 'John Kamau', localMrId: 'lmr-001', localMrName: 'Nakuru Central', farmerId: 'farmer-002', farmerName: 'Elizabeth Chebet', productId: 'prod-002', productName: 'CAN Fertilizer 50kg', quantity: 2, unitPrice: 3800, total: 7600, commissionAmount: 240, date: new Date('2024-12-02'), status: 'completed', approvedBy: 'manager-001', approvedAt: new Date('2024-12-03') },
];

// -------------------- Mechanisation Jobs --------------------
export const mockMechanisationJobs: MechanisationJob[] = [
  { id: 'job-001', totId: 'tot-001', jobType: 'Ploughing', farmId: 'farm-001', date: new Date('2024-12-05'), status: 'completed', hoursSpent: 5 },
  { id: 'job-002', totId: 'tot-002', jobType: 'Planting', farmId: 'farm-002', date: new Date('2024-12-06'), status: 'completed', hoursSpent: 3 },
];

// -------------------- Visits --------------------
export const mockVisits: Visit[] = [
  { id: 'visit-001', totId: 'tot-001', farmerId: 'farmer-001', date: new Date('2024-12-03'), purpose: 'Check crop health', notes: 'Good progress', status: 'completed' },
  { id: 'visit-002', totId: 'tot-002', farmerId: 'farmer-002', date: new Date('2024-12-04'), purpose: 'Introduce new product', notes: 'Farmer interested', status: 'completed' },
];

// -------------------- Trainings --------------------
export const mockTrainings: Training[] = [
  { id: 'training-001', totId: 'tot-001', topic: 'Fertilizer Use', date: new Date('2024-12-07'), attendees: 15, status: 'completed' },
  { id: 'training-002', totId: 'tot-002', topic: 'Soil Testing', date: new Date('2024-12-08'), attendees: 10, status: 'completed' },
];

// -------------------- Notifications --------------------
export const mockNotifications: Notification[] = [
  { id: 'notif-001', totId: 'tot-001', message: 'Monthly sales target achieved', date: new Date('2024-12-10'), read: false },
  { id: 'notif-002', totId: 'tot-002', message: 'New training scheduled', date: new Date('2024-12-11'), read: true },
];

// -------------------- Helper Functions --------------------
const calculateTOTCommission = (totId: string, sales: Sale[], products: Product[]): number => {
  return sales
    .filter(sale => sale.totId === totId && sale.status === 'completed')
    .reduce((total, sale) => {
      const product = products.find(p => p.id === sale.productId);
      const commissionPerUnit = product?.commission || 0;
      return total + (sale.quantity * commissionPerUnit);
    }, 0);
};

// -------------------- Unified TOT Performance --------------------
export const getTOTPerformanceByLocalMR = (localMrId: string): TOTPerformance[] => {
  const totsInMr = mockTots.filter(tot => tot.localMrId === localMrId);

  return totsInMr.map(tot => {
    const totSales = mockSales.filter(s => s.totId === tot.id && s.status === 'completed');
    const totMechanisation = mockMechanisationJobs.filter(mj => mj.totId === tot.id);
    const totVisits = mockVisits.filter(v => v.totId === tot.id);
    const totTrainings = mockTrainings.filter(t => t.totId === tot.id);
    const totNotifications = mockNotifications.filter(n => n.totId === tot.id);

    // Total commission
    const totalCommission = calculateTOTCommission(tot.id, mockSales, mockProducts);

    // Product-wise sales
    const salesByProduct = totSales.reduce((acc: { productId: string; productName: string; quantity: number; total: number }[], sale) => {
      const existing = acc.find(item => item.productId === sale.productId);
      if (existing) {
        existing.quantity += sale.quantity;
        existing.total += sale.total;
      } else {
        acc.push({ productId: sale.productId, productName: sale.productName, quantity: sale.quantity, total: sale.total });
      }
      return acc;
    }, []);

    return {
      totId: tot.id,
      totName: tot.name,
      totalSales: totSales.reduce((sum, s) => sum + s.total, 0),
      totalCommission,
      salesByProduct,
      mechanisationJobs: totMechanisation,
      visits: totVisits,
      trainings: totTrainings,
      notifications: totNotifications
    };
  });
};
