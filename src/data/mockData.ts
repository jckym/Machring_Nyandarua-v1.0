import { 
  Farmer, Product, Sale, MechanisationJob, Visit, Training, 
  LocalMR, User, DashboardStats, Machinery, Notification, ValueChain, TOTPerformance 
} from '@/types';

// -------------------- Local MRs --------------------
export const mockLocalMRs: LocalMR[] = [
  { id: 'lmr-001', code: 'NAK-C', name: 'Nakuru Central', county: 'Nakuru', subcounty: 'Nakuru East', location: 'Nakuru Town', managerId: 'manager-001', managerName: 'Sarah Wanjiku', totalTots: 12, totalFarmers: 450, createdAt: new Date('2024-01-01') },
  { id: 'lmr-002', code: 'ELD-W', name: 'Eldoret West', county: 'Uasin Gishu', subcounty: 'Eldoret West', location: 'Eldoret Town', managerId: 'manager-002', managerName: 'Michael Korir', totalTots: 8, totalFarmers: 320, createdAt: new Date('2024-01-01') },
  { id: 'lmr-003', code: 'KIT-H', name: 'Kitale Hub', county: 'Trans Nzoia', subcounty: 'Kitale Town', location: 'Kitale CBD', managerId: 'manager-003', managerName: 'Grace Wanjala', totalTots: 10, totalFarmers: 380, createdAt: new Date('2024-01-01') },
  { id: 'lmr-004', code: 'NYE-S', name: 'Nyeri South', county: 'Nyeri', subcounty: 'Nyeri South', location: 'Nyeri Town', managerId: 'manager-004', managerName: 'Peter Mwangi', totalTots: 7, totalFarmers: 280, createdAt: new Date('2024-01-01') },
  { id: 'lmr-005', code: 'MER-C', name: 'Meru Central', county: 'Meru', subcounty: 'Imenti North', location: 'Meru Town', managerId: 'manager-005', managerName: 'Joyce Mwiti', totalTots: 9, totalFarmers: 340, createdAt: new Date('2024-01-01') },
  { id: 'lmr-006', code: 'KIS-E', name: 'Kisumu East', county: 'Kisumu', subcounty: 'Kisumu East', location: 'Kisumu City', managerId: 'manager-006', managerName: 'David Ochieng', totalTots: 6, totalFarmers: 220, createdAt: new Date('2024-01-01') },
  { id: 'lmr-007', code: 'KAK-N', name: 'Kakamega North', county: 'Kakamega', subcounty: 'Kakamega North', location: 'Kakamega Town', managerId: 'manager-007', managerName: 'Rose Amuka', totalTots: 8, totalFarmers: 290, createdAt: new Date('2024-01-01') },
  { id: 'lmr-008', code: 'NAI-W', name: 'Nairobi West', county: 'Nairobi', subcounty: 'Westlands', location: 'Westlands', managerId: 'manager-008', managerName: 'James Kariuki', totalTots: 5, totalFarmers: 150, createdAt: new Date('2024-01-01') },
  { id: 'lmr-009', code: 'MAC-E', name: 'Machakos East', county: 'Machakos', subcounty: 'Machakos Town', location: 'Machakos CBD', managerId: 'manager-009', managerName: 'Agnes Mutua', totalTots: 7, totalFarmers: 260, createdAt: new Date('2024-01-01') },
  { id: 'lmr-010', code: 'KER-S', name: 'Kericho South', county: 'Kericho', subcounty: 'Kericho', location: 'Kericho Town', managerId: 'manager-010', managerName: 'Philip Langat', totalTots: 11, totalFarmers: 410, createdAt: new Date('2024-01-01') },
];

// Alias for backward compatibility
export const mockBranches = mockLocalMRs;

// -------------------- TOTs --------------------
export const mockTots: User[] = [
  { id: 'tot-001', name: 'John Kamau', email: 'john.kamau@machineryring.ke', role: 'tot', phone: '+254712345678', localMrId: 'lmr-001', status: 'active', createdAt: new Date('2024-01-15'), lastActivityDate: new Date('2024-12-10'), totalSales: 133700, totalCommission: 3500, mechanisationJobsCompleted: 4, trainingsCondcuted: 2, visitsLogged: 8 },
  { id: 'tot-002', name: 'Mary Njeri', email: 'mary.njeri@machineryring.ke', role: 'tot', phone: '+254712345679', localMrId: 'lmr-001', status: 'active', createdAt: new Date('2024-02-10'), lastActivityDate: new Date('2024-12-08'), totalSales: 5400, totalCommission: 180, mechanisationJobsCompleted: 1, trainingsCondcuted: 1, visitsLogged: 5 },
  { id: 'tot-003', name: 'Peter Mwangi', email: 'peter.mwangi@machineryring.ke', role: 'tot', phone: '+254712345680', localMrId: 'lmr-001', status: 'active', createdAt: new Date('2024-03-05'), lastActivityDate: new Date('2024-12-09'), totalSales: 14000, totalCommission: 500, mechanisationJobsCompleted: 0, trainingsCondcuted: 0, visitsLogged: 3 },
  { id: 'tot-004', name: 'Grace Wambui', email: 'grace.wambui@machineryring.ke', role: 'tot', phone: '+254712345681', localMrId: 'lmr-001', status: 'inactive', createdAt: new Date('2024-01-20'), lastActivityDate: new Date('2024-10-15'), totalSales: 0, totalCommission: 0, mechanisationJobsCompleted: 0, trainingsCondcuted: 0, visitsLogged: 0 },
  { id: 'tot-005', name: 'Daniel Kibet', email: 'daniel.kibet@machineryring.ke', role: 'tot', phone: '+254712345682', localMrId: 'lmr-002', status: 'active', createdAt: new Date('2024-02-01'), lastActivityDate: new Date('2024-12-07'), totalSales: 85000, totalCommission: 2800, mechanisationJobsCompleted: 3, trainingsCondcuted: 2, visitsLogged: 12 },
];

// -------------------- Products --------------------
export const mockProducts: Product[] = [
  { id: 'prod-001', name: 'DAP Fertilizer 50kg', sku: 'FERT-DAP-50', inStock: 250, unitPrice: 4500, description: 'Di-ammonium Phosphate fertilizer for planting', commission: 150, category: 'Fertilizers', createdAt: new Date('2024-01-01') },
  { id: 'prod-002', name: 'CAN Fertilizer 50kg', sku: 'FERT-CAN-50', inStock: 180, unitPrice: 3800, description: 'Calcium Ammonium Nitrate top-dressing fertilizer', commission: 120, category: 'Fertilizers', createdAt: new Date('2024-01-01') },
  { id: 'prod-003', name: 'Hybrid Maize Seeds 10kg', sku: 'SEED-MAIZE-10', inStock: 500, unitPrice: 6500, description: 'High-yield hybrid maize seeds', commission: 200, category: 'Seeds', createdAt: new Date('2024-01-01') },
  { id: 'prod-004', name: 'Bean Seeds 5kg', sku: 'SEED-BEAN-5', inStock: 300, unitPrice: 2500, description: 'Certified bean seeds', commission: 80, category: 'Seeds', createdAt: new Date('2024-01-01') },
];

// -------------------- Sales --------------------
export const mockSales: Sale[] = [
  { id: 'sale-001', totId: 'tot-001', totName: 'John Kamau', localMrId: 'lmr-001', localMrName: 'Nakuru Central', farmerId: 'farmer-001', farmerName: 'James Kiprotich', productId: 'prod-001', productName: 'DAP Fertilizer 50kg', quantity: 4, unitPrice: 4500, total: 18000, commissionAmount: 600, date: new Date('2024-12-01'), status: 'completed', approvedBy: 'manager-001', approvedAt: new Date('2024-12-02') },
  { id: 'sale-002', totId: 'tot-001', totName: 'John Kamau', localMrId: 'lmr-001', localMrName: 'Nakuru Central', farmerId: 'farmer-002', farmerName: 'Elizabeth Chebet', productId: 'prod-003', productName: 'Hybrid Maize Seeds 10kg', quantity: 10, unitPrice: 6500, total: 65000, commissionAmount: 2000, date: new Date('2024-12-02'), status: 'completed', approvedBy: 'manager-001', approvedAt: new Date('2024-12-03') },
];

// -------------------- TOT Performance Function --------------------
export const calculateTOTCommission = (totId: string, sales: Sale[], products: Product[]): number => {
  return sales
    .filter(sale => sale.totId === totId && sale.status === 'completed')
    .reduce((total, sale) => {
      const product = products.find(p => p.id === sale.productId);
      const commissionPerUnit = product?.commission || 0;
      return total + (sale.quantity * commissionPerUnit);
    }, 0);
};

export const getTOTPerformanceByLocalMR = (localMrId: string): TOTPerformance[] => {
  const totsInMr = mockTots.filter(tot => tot.localMrId === localMrId);

  return totsInMr.map(tot => {
    const totSales = mockSales.filter(s => s.totId === tot.id && s.status === 'completed');
    
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
      salesByProduct
    };
  });
};
