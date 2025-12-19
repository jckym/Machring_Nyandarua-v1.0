import { 
  LocalMR, Farmer, Product, Sale, MechanisationJob, Visit, Training, 
  Notification, TOTPerformance, User, FarmerApprovalRequest 
} from '@/types';

/* =====================================================
   CORE MOCK ENTITIES - 10 LOCAL MRs
===================================================== */

export const mockLocalMRs: LocalMR[] = [
  { id: 'mr-1', name: 'Nakuru Central MR', code: 'NK-001', subcounty: 'Nakuru East', ward: 'Bahati', managerId: 'mgr-1', managerName: 'John Kamau', totalTots: 5, totalFarmers: 120 },
  { id: 'mr-2', name: 'Nyeri Highland MR', code: 'NY-001', subcounty: 'Nyeri Central', ward: 'Ruring\'u', managerId: 'mgr-2', managerName: 'Mary Wanjiku', totalTots: 4, totalFarmers: 95 },
  { id: 'mr-3', name: 'Eldoret Valley MR', code: 'EL-001', subcounty: 'Eldoret East', ward: 'Pioneer', managerId: 'mgr-3', managerName: 'Peter Kipkoech', totalTots: 6, totalFarmers: 150 },
  { id: 'mr-4', name: 'Meru Highlands MR', code: 'MR-001', subcounty: 'Meru Central', ward: 'Municipality', managerId: 'mgr-4', managerName: 'Grace Muthoni', totalTots: 3, totalFarmers: 80 },
  { id: 'mr-5', name: 'Kisumu Lakeside MR', code: 'KS-001', subcounty: 'Kisumu Central', ward: 'Milimani', managerId: 'mgr-5', managerName: 'James Odhiambo', totalTots: 5, totalFarmers: 110 },
  { id: 'mr-6', name: 'Nanyuki Plateau MR', code: 'NN-001', subcounty: 'Laikipia East', ward: 'Nanyuki', managerId: 'mgr-6', managerName: 'Sarah Njeri', totalTots: 4, totalFarmers: 75 },
  { id: 'mr-7', name: 'Kitale Western MR', code: 'KT-001', subcounty: 'Kitale', ward: 'Milimani', managerId: 'mgr-7', managerName: 'David Wekesa', totalTots: 5, totalFarmers: 130 },
  { id: 'mr-8', name: 'Narok Mara MR', code: 'NR-001', subcounty: 'Narok North', ward: 'Narok Town', managerId: 'mgr-8', managerName: 'Joseph Sankok', totalTots: 3, totalFarmers: 65 },
  { id: 'mr-9', name: 'Machakos Valley MR', code: 'MC-001', subcounty: 'Machakos Central', ward: 'Machakos Town', managerId: 'mgr-9', managerName: 'Ruth Mwikali', totalTots: 4, totalFarmers: 90 },
  { id: 'mr-10', name: 'Kericho Tea Belt MR', code: 'KC-001', subcounty: 'Kericho Central', ward: 'Kericho Town', managerId: 'mgr-10', managerName: 'Moses Langat', totalTots: 4, totalFarmers: 100 },
];

export const mockTots: User[] = [
  { id: 'tot-1', name: 'Samuel Mwangi', email: 'samuel@mr.ke', phone: '+254712345001', role: 'tot', localMrId: 'mr-1', status: 'active', createdAt: new Date('2024-01-15'), lastActivityDate: new Date('2025-06-18') },
  { id: 'tot-2', name: 'Agnes Wairimu', email: 'agnes@mr.ke', phone: '+254712345002', role: 'tot', localMrId: 'mr-1', status: 'active', createdAt: new Date('2024-02-10'), lastActivityDate: new Date('2025-06-17') },
  { id: 'tot-3', name: 'Paul Kimani', email: 'paul@mr.ke', phone: '+254712345003', role: 'tot', localMrId: 'mr-2', status: 'active', createdAt: new Date('2024-01-20'), lastActivityDate: new Date('2025-06-15') },
  { id: 'tot-4', name: 'Jane Wambui', email: 'jane@mr.ke', phone: '+254712345004', role: 'tot', localMrId: 'mr-2', status: 'inactive', createdAt: new Date('2024-03-05'), lastActivityDate: new Date('2025-04-20') },
  { id: 'tot-5', name: 'Michael Korir', email: 'michael@mr.ke', phone: '+254712345005', role: 'tot', localMrId: 'mr-3', status: 'active', createdAt: new Date('2024-01-25'), lastActivityDate: new Date('2025-06-18') },
  { id: 'tot-6', name: 'Lucy Chebet', email: 'lucy@mr.ke', phone: '+254712345006', role: 'tot', localMrId: 'mr-3', status: 'active', createdAt: new Date('2024-02-15'), lastActivityDate: new Date('2025-06-16') },
  { id: 'tot-7', name: 'Daniel Kiprotich', email: 'daniel@mr.ke', phone: '+254712345007', role: 'tot', localMrId: 'mr-4', status: 'active', createdAt: new Date('2024-03-10'), lastActivityDate: new Date('2025-06-14') },
  { id: 'tot-8', name: 'Faith Nyambura', email: 'faith@mr.ke', phone: '+254712345008', role: 'tot', localMrId: 'mr-5', status: 'active', createdAt: new Date('2024-02-20'), lastActivityDate: new Date('2025-06-17') },
  { id: 'tot-9', name: 'George Otieno', email: 'george@mr.ke', phone: '+254712345009', role: 'tot', localMrId: 'mr-5', status: 'active', createdAt: new Date('2024-01-30'), lastActivityDate: new Date('2025-06-18') },
  { id: 'tot-10', name: 'Elizabeth Achieng', email: 'elizabeth@mr.ke', phone: '+254712345010', role: 'tot', localMrId: 'mr-6', status: 'active', createdAt: new Date('2024-04-05'), lastActivityDate: new Date('2025-06-12') },
];

export const mockManagers: User[] = [
  { id: 'mgr-1', name: 'John Kamau', email: 'john.kamau@mr.ke', phone: '+254700000001', role: 'manager', localMrId: 'mr-1', status: 'active', createdAt: new Date('2023-01-01') },
  { id: 'mgr-2', name: 'Mary Wanjiku', email: 'mary.wanjiku@mr.ke', phone: '+254700000002', role: 'manager', localMrId: 'mr-2', status: 'active', createdAt: new Date('2023-01-01') },
  { id: 'mgr-3', name: 'Peter Kipkoech', email: 'peter.kipkoech@mr.ke', phone: '+254700000003', role: 'manager', localMrId: 'mr-3', status: 'active', createdAt: new Date('2023-01-01') },
];

export const mockAdmins: User[] = [
  { id: 'admin-1', name: 'Admin User', email: 'admin@mr.ke', phone: '+254700000000', role: 'admin', status: 'active', createdAt: new Date('2023-01-01') },
];

export const mockFarmers: Farmer[] = [
  { id: 'farmer-1', name: 'Peter Kamau', phone: '+254711100001', email: 'peter.kamau@email.com', age: 45, location: { village: 'Bahati', ward: 'Bahati', subcounty: 'Nakuru East', county: 'Nakuru' }, localMrId: 'mr-1', localMrName: 'Nakuru Central MR', valueChain: 'Maize', farmerCategory: 'Pioneer', farmerRating: 'High-Value', registeredBy: 'tot-1', totalPurchases: 25, mechanisationCount: 8, trainingsAttended: 12, visitsCount: 6, createdAt: new Date('2023-06-15'), lastActivityDate: new Date('2025-06-15'), approvalStatus: 'approved' },
  { id: 'farmer-2', name: 'Mary Njeri', phone: '+254711100002', email: 'mary.njeri@email.com', age: 38, location: { village: 'Subukia', ward: 'Subukia', subcounty: 'Nakuru East', county: 'Nakuru' }, localMrId: 'mr-1', localMrName: 'Nakuru Central MR', valueChain: 'Dairy', farmerCategory: 'Existing', farmerRating: 'Active', registeredBy: 'tot-1', totalPurchases: 15, mechanisationCount: 5, trainingsAttended: 8, visitsCount: 4, createdAt: new Date('2023-08-20'), lastActivityDate: new Date('2025-06-10'), approvalStatus: 'approved' },
  { id: 'farmer-3', name: 'John Maina', phone: '+254711100003', age: 52, location: { village: 'Nyeri Town', ward: 'Central', subcounty: 'Nyeri Central', county: 'Nyeri' }, localMrId: 'mr-2', localMrName: 'Nyeri Highland MR', valueChain: 'Coffee', farmerCategory: 'Pioneer', farmerRating: 'High-Value', registeredBy: 'tot-3', totalPurchases: 30, mechanisationCount: 10, trainingsAttended: 15, visitsCount: 8, createdAt: new Date('2023-05-10'), lastActivityDate: new Date('2025-06-18'), approvalStatus: 'approved' },
  { id: 'farmer-4', name: 'Grace Wangui', phone: '+254711100004', email: 'grace.wangui@email.com', age: 29, location: { village: 'Eldoret', ward: 'Pioneer', subcounty: 'Eldoret East', county: 'Uasin Gishu' }, localMrId: 'mr-3', localMrName: 'Eldoret Valley MR', valueChain: 'Wheat', farmerCategory: 'New', farmerRating: 'Active', registeredBy: 'tot-5', totalPurchases: 5, mechanisationCount: 2, trainingsAttended: 3, visitsCount: 2, createdAt: new Date('2024-11-20'), lastActivityDate: new Date('2025-06-12'), approvalStatus: 'approved' },
  { id: 'farmer-5', name: 'James Omondi', phone: '+254711100005', age: 41, location: { village: 'Kisumu CBD', ward: 'Milimani', subcounty: 'Kisumu Central', county: 'Kisumu' }, localMrId: 'mr-5', localMrName: 'Kisumu Lakeside MR', valueChain: 'Sugarcane', farmerCategory: 'Existing', farmerRating: 'Dormant', registeredBy: 'tot-8', totalPurchases: 8, mechanisationCount: 3, trainingsAttended: 2, visitsCount: 1, createdAt: new Date('2023-12-05'), lastActivityDate: new Date('2025-02-10'), approvalStatus: 'approved' },
];

export const mockProducts: Product[] = [
  { id: 'prod-1', name: 'Maize Seeds (10kg)', sku: 'MS-001', inStock: 500, unitPrice: 3500, description: 'High-yield hybrid maize seeds', commission: 175, category: 'Seeds', createdAt: new Date('2024-01-01') },
  { id: 'prod-2', name: 'DAP Fertilizer (50kg)', sku: 'DF-001', inStock: 300, unitPrice: 4500, description: 'Di-ammonium phosphate fertilizer', commission: 225, category: 'Fertilizers', createdAt: new Date('2024-01-01') },
  { id: 'prod-3', name: 'Tractor Hire (per acre)', sku: 'TH-001', inStock: 999, unitPrice: 5000, description: 'Tractor ploughing service', commission: 500, category: 'Services', createdAt: new Date('2024-01-01') },
  { id: 'prod-4', name: 'Herbicide (5L)', sku: 'HB-001', inStock: 200, unitPrice: 2500, description: 'Broad-spectrum herbicide', commission: 125, category: 'Agrochemicals', createdAt: new Date('2024-01-01') },
  { id: 'prod-5', name: 'Dairy Meal (70kg)', sku: 'DM-001', inStock: 150, unitPrice: 3200, description: 'Premium dairy cattle feed', commission: 160, category: 'Animal Feeds & Supplements', createdAt: new Date('2024-01-01') },
];

export const mockMachinery = [
  { id: 'mach-1', name: 'John Deere 5050E', category: 'Tractor', status: 'available' as const, pricePerAcre: 5000, localMrId: 'mr-1', createdAt: new Date('2024-01-15') },
  { id: 'mach-2', name: 'Massey Ferguson 375', category: 'Tractor', status: 'booked' as const, pricePerAcre: 4500, localMrId: 'mr-1', createdAt: new Date('2024-02-10') },
  { id: 'mach-3', name: 'Case IH Harvester', category: 'Harvester', status: 'available' as const, pricePerAcre: 8000, localMrId: 'mr-3', createdAt: new Date('2024-03-05') },
  { id: 'mach-4', name: 'Boom Sprayer 1000L', category: 'Sprayer', status: 'available' as const, pricePerAcre: 1500, localMrId: 'mr-2', createdAt: new Date('2024-01-20') },
  { id: 'mach-5', name: 'Disc Plough 3-Furrow', category: 'Plough', status: 'available' as const, pricePerAcre: 3500, localMrId: 'mr-5', createdAt: new Date('2024-04-01') },
];

/* =====================================================
   ACTIVITY DATA
===================================================== */

export const mockSales: Sale[] = [
  { id: 'sale-1', totId: 'tot-1', totName: 'Samuel Mwangi', localMrId: 'mr-1', localMrName: 'Nakuru Central MR', farmerId: 'farmer-1', farmerName: 'Peter Kamau', productId: 'prod-1', productName: 'Maize Seeds (10kg)', quantity: 5, unitPrice: 3500, total: 17500, commissionAmount: 875, date: new Date('2025-06-15'), status: 'completed', createdAt: new Date('2025-06-15') },
  { id: 'sale-2', totId: 'tot-1', totName: 'Samuel Mwangi', localMrId: 'mr-1', localMrName: 'Nakuru Central MR', farmerId: 'farmer-2', farmerName: 'Mary Njeri', productId: 'prod-2', productName: 'DAP Fertilizer (50kg)', quantity: 3, unitPrice: 4500, total: 13500, commissionAmount: 675, date: new Date('2025-06-14'), status: 'completed', createdAt: new Date('2025-06-14') },
  { id: 'sale-3', totId: 'tot-3', totName: 'Paul Kimani', localMrId: 'mr-2', localMrName: 'Nyeri Highland MR', farmerId: 'farmer-3', farmerName: 'John Maina', productId: 'prod-5', productName: 'Dairy Meal (70kg)', quantity: 10, unitPrice: 3200, total: 32000, commissionAmount: 1600, date: new Date('2025-06-13'), status: 'completed', createdAt: new Date('2025-06-13') },
  { id: 'sale-4', totId: 'tot-5', totName: 'Michael Korir', localMrId: 'mr-3', localMrName: 'Eldoret Valley MR', farmerId: 'farmer-4', farmerName: 'Grace Wangui', productId: 'prod-1', productName: 'Maize Seeds (10kg)', quantity: 2, unitPrice: 3500, total: 7000, commissionAmount: 350, date: new Date('2025-06-12'), status: 'pending', createdAt: new Date('2025-06-12') },
  { id: 'sale-5', totId: 'tot-8', totName: 'Faith Nyambura', localMrId: 'mr-5', localMrName: 'Kisumu Lakeside MR', farmerId: 'farmer-5', farmerName: 'James Omondi', productId: 'prod-4', productName: 'Herbicide (5L)', quantity: 4, unitPrice: 2500, total: 10000, commissionAmount: 500, date: new Date('2025-06-11'), status: 'completed', createdAt: new Date('2025-06-11') },
];

export const mockMechanisationJobs: MechanisationJob[] = [
  { id: 'job-1', farmerId: 'farmer-1', farmerName: 'Peter Kamau', localMrId: 'mr-1', localMrName: 'Nakuru Central MR', machineryId: 'mach-1', machineryName: 'John Deere 5050E', serviceType: 'ploughing', acreage: 5, pricePerAcre: 5000, totalPrice: 25000, commissionAmount: 2500, status: 'completed', bookedBy: 'tot-1', bookedByName: 'Samuel Mwangi', scheduledDate: new Date('2025-06-10'), completedDate: new Date('2025-06-10'), createdAt: new Date('2025-06-05'), completionReport: { summary: 'Successfully ploughed 5 acres of land for maize planting', duration: '4 hours', outcome: 'Field ready for planting', completedAt: new Date('2025-06-10') } },
  { id: 'job-2', farmerId: 'farmer-3', farmerName: 'John Maina', localMrId: 'mr-2', localMrName: 'Nyeri Highland MR', machineryId: 'mach-4', machineryName: 'Boom Sprayer 1000L', serviceType: 'spraying', acreage: 10, pricePerAcre: 1500, totalPrice: 15000, commissionAmount: 1500, status: 'completed', bookedBy: 'tot-3', bookedByName: 'Paul Kimani', scheduledDate: new Date('2025-06-08'), completedDate: new Date('2025-06-08'), createdAt: new Date('2025-06-01'), completionReport: { summary: 'Completed pesticide application for coffee farm', duration: '6 hours', outcome: 'Full coverage achieved, pest control effective', completedAt: new Date('2025-06-08') } },
  { id: 'job-3', farmerId: 'farmer-4', farmerName: 'Grace Wangui', localMrId: 'mr-3', localMrName: 'Eldoret Valley MR', machineryId: 'mach-3', machineryName: 'Case IH Harvester', serviceType: 'harvesting', acreage: 15, pricePerAcre: 8000, totalPrice: 120000, commissionAmount: 12000, status: 'pending-approval', bookedBy: 'tot-5', bookedByName: 'Michael Korir', scheduledDate: new Date('2025-06-25'), createdAt: new Date('2025-06-15') },
];

export const mockVisits: Visit[] = [
  { id: 'visit-1', farmerId: 'farmer-1', farmerName: 'Peter Kamau', totId: 'tot-1', totName: 'Samuel Mwangi', localMrId: 'mr-1', localMrName: 'Nakuru Central MR', date: new Date('2025-06-15'), purpose: 'Follow-up', notes: 'Checked on maize crop progress. Farmer satisfied with seed quality.', createdAt: new Date('2025-06-15') },
  { id: 'visit-2', farmerId: 'farmer-2', farmerName: 'Mary Njeri', totId: 'tot-1', totName: 'Samuel Mwangi', localMrId: 'mr-1', localMrName: 'Nakuru Central MR', date: new Date('2025-06-12'), purpose: 'Product Demo', notes: 'Demonstrated new fertilizer application techniques.', createdAt: new Date('2025-06-12') },
  { id: 'visit-3', farmerId: 'farmer-3', farmerName: 'John Maina', totId: 'tot-3', totName: 'Paul Kimani', localMrId: 'mr-2', localMrName: 'Nyeri Highland MR', date: new Date('2025-06-10'), purpose: 'Training Follow-up', notes: 'Assessed coffee farm after pest management training.', createdAt: new Date('2025-06-10') },
];

export const mockTrainings: Training[] = [
  { id: 'training-1', title: 'Soil Health Management', type: 'Workshop', date: new Date('2025-06-20'), status: 'Upcoming', attendees: ['farmer-1', 'farmer-2'], attendeeNames: ['Peter Kamau', 'Mary Njeri'], trainerId: 'tot-1', trainerName: 'Samuel Mwangi', topics: ['Soil testing', 'Fertilizer application'], location: 'Nakuru Agricultural Hall', localMrId: 'mr-1', localMrName: 'Nakuru Central MR', duration: 4, createdAt: new Date('2025-06-01') },
  { id: 'training-2', title: 'Modern Dairy Practices', type: 'Field Day', date: new Date('2025-06-05'), status: 'Completed', attendees: ['farmer-3'], attendeeNames: ['John Maina'], trainerId: 'tot-3', trainerName: 'Paul Kimani', topics: ['Feeding regimes', 'Milk handling'], location: 'Nyeri Farmers Hub', localMrId: 'mr-2', localMrName: 'Nyeri Highland MR', duration: 6, createdAt: new Date('2025-05-20') },
  { id: 'training-3', title: 'Mechanisation Best Practices', type: 'Seminar', date: new Date('2025-06-25'), status: 'Upcoming', attendees: ['farmer-4', 'farmer-5'], attendeeNames: ['Grace Wangui', 'James Omondi'], trainerId: 'tot-5', trainerName: 'Michael Korir', topics: ['Tractor operation', 'Safety protocols'], location: 'Eldoret Conference Center', localMrId: 'mr-3', localMrName: 'Eldoret Valley MR', duration: 3, createdAt: new Date('2025-06-10') },
];

export const mockNotifications: Notification[] = [
  { id: 'notif-1', type: 'mechanisation_pending', title: 'Mechanisation Approval Required', message: 'Grace Wangui has requested harvesting service', read: false, createdAt: new Date('2025-06-15'), localMrId: 'mr-3', localMrName: 'Eldoret Valley MR' },
  { id: 'notif-2', type: 'sale_completed', title: 'Sale Completed', message: 'Peter Kamau purchased Maize Seeds', read: false, createdAt: new Date('2025-06-15'), localMrId: 'mr-1', localMrName: 'Nakuru Central MR' },
  { id: 'notif-3', type: 'training_reminder', title: 'Training Tomorrow', message: 'Soil Health Management training scheduled', read: true, createdAt: new Date('2025-06-19'), localMrId: 'mr-1', localMrName: 'Nakuru Central MR' },
  { id: 'notif-4', type: 'support_request', title: 'Support Request', message: 'TOT Samuel Mwangi reported login issue', read: false, createdAt: new Date('2025-06-14'), reportedBy: 'tot-1', issueType: 'Technical', resolutionStatus: 'pending' },
];

export const mockFarmerApprovalRequests: FarmerApprovalRequest[] = [
  { id: 'approval-1', farmerData: { name: 'New Test Farmer', phone: '+254711999999', location: { village: 'Test Village', ward: 'Test Ward', subcounty: 'Nakuru East', county: 'Nakuru' }, valueChain: 'Maize', farmerCategory: 'New' }, type: 'add', status: 'pending', requestedBy: 'tot-1', requestedByName: 'Samuel Mwangi', localMrId: 'mr-1', localMrName: 'Nakuru Central MR', createdAt: new Date('2025-06-18') },
];

export const valueChains = ['Maize', 'Wheat', 'Dairy', 'Poultry', 'Horticulture', 'Coffee', 'Tea', 'Sugarcane', 'Livestock', 'Mixed Farming'];

export const productCategories = ['Seeds', 'Fertilizers', 'Agrochemicals', 'Animal Feeds & Supplements', 'Services', 'Equipment', 'Others'];

/* =====================================================
   DASHBOARD HELPERS
===================================================== */

export function getMonthlyData() {
  return [
    { month: 'Jan', value: 45000 },
    { month: 'Feb', value: 62000 },
    { month: 'Mar', value: 78000 },
    { month: 'Apr', value: 55000 },
    { month: 'May', value: 89000 },
    { month: 'Jun', value: 72000 },
  ];
}

export function getProductPerformance() {
  return mockProducts.map((product, index) => ({
    name: product.name.split(' ')[0],
    value: 60 - index * 10,
  }));
}

/* =====================================================
   ADMIN / MANAGER STATS
===================================================== */

export function getAdminStats() {
  return {
    totalFarmers: mockFarmers.length,
    totalSales: mockSales.length,
    totalMRs: mockLocalMRs.length,
    totalTots: mockTots.length,
    totalRevenue: mockSales.filter(s => s.status === 'completed').reduce((acc, s) => acc + s.total, 0),
  };
}

export function getManagerStats() {
  return {
    totalVisits: mockVisits.length,
    totalTrainings: mockTrainings.length,
    pendingApprovals: mockMechanisationJobs.filter(j => j.status === 'pending-approval').length + mockFarmerApprovalRequests.filter(r => r.status === 'pending').length,
  };
}

/* =====================================================
   TOT PERFORMANCE & COMMISSION CALCULATION
===================================================== */

export function calculateTOTCommission(totId: string): { 
  totalSales: number; 
  totalCommission: number; 
  completedSalesCount: number;
  productBreakdown: { productId: string; productName: string; quantity: number; totalSales: number; commission: number }[] 
} {
  const completedSales = mockSales.filter(s => s.totId === totId && s.status === 'completed');
  const completedJobs = mockMechanisationJobs.filter(j => j.bookedBy === totId && j.status === 'completed');
  
  const productBreakdown = completedSales.reduce((acc, sale) => {
    const existing = acc.find(p => p.productId === sale.productId);
    if (existing) {
      existing.quantity += sale.quantity;
      existing.totalSales += sale.total;
      existing.commission += sale.commissionAmount;
    } else {
      acc.push({
        productId: sale.productId,
        productName: sale.productName,
        quantity: sale.quantity,
        totalSales: sale.total,
        commission: sale.commissionAmount,
      });
    }
    return acc;
  }, [] as { productId: string; productName: string; quantity: number; totalSales: number; commission: number }[]);

  const salesTotal = completedSales.reduce((acc, s) => acc + s.total, 0);
  const salesCommission = completedSales.reduce((acc, s) => acc + s.commissionAmount, 0);
  const mechanisationCommission = completedJobs.reduce((acc, j) => acc + j.commissionAmount, 0);

  return {
    totalSales: salesTotal,
    totalCommission: salesCommission + mechanisationCommission,
    completedSalesCount: completedSales.length,
    productBreakdown,
  };
}

export function getTOTPerformance(totId: string): TOTPerformance | undefined {
  const tot = mockTots.find(t => t.id === totId);
  if (!tot) return undefined;

  const localMr = mockLocalMRs.find(mr => mr.id === tot.localMrId);
  const commissionData = calculateTOTCommission(totId);
  const completedJobs = mockMechanisationJobs.filter(j => j.bookedBy === totId && j.status === 'completed');
  const trainings = mockTrainings.filter(t => t.trainerId === totId);
  const visits = mockVisits.filter(v => v.totId === totId);

  return {
    totId: tot.id,
    totName: tot.name,
    localMrId: tot.localMrId || '',
    localMrName: localMr?.name || '',
    status: tot.status,
    phone: tot.phone,
    email: tot.email,
    totalSales: commissionData.totalSales,
    totalCommission: commissionData.totalCommission,
    mechanisationJobsCompleted: completedJobs.length,
    trainingsConducted: trainings.length,
    visitsLogged: visits.length,
    lastActivityDate: tot.lastActivityDate,
    salesByProduct: commissionData.productBreakdown,
  };
}

export function getTOTsByLocalMR(localMrId: string): TOTPerformance[] {
  const tots = mockTots.filter(t => t.localMrId === localMrId);
  return tots.map(t => getTOTPerformance(t.id)).filter((p): p is TOTPerformance => p !== undefined);
}

export function getLocalMRCommissionSummary(localMrId: string) {
  const localMr = mockLocalMRs.find(mr => mr.id === localMrId);
  const tots = getTOTsByLocalMR(localMrId);
  
  return {
    localMrId,
    localMrName: localMr?.name || '',
    managerName: localMr?.managerName || '',
    totalTots: tots.length,
    activeTots: tots.filter(t => t.status === 'active').length,
    totalSales: tots.reduce((acc, t) => acc + t.totalSales, 0),
    totalCommission: tots.reduce((acc, t) => acc + t.totalCommission, 0),
    totalMechanisationJobs: tots.reduce((acc, t) => acc + t.mechanisationJobsCompleted, 0),
    totalTrainings: tots.reduce((acc, t) => acc + t.trainingsConducted, 0),
    totalVisits: tots.reduce((acc, t) => acc + t.visitsLogged, 0),
    tots,
  };
}

// Get all users combined
export function getAllUsers(): User[] {
  return [...mockAdmins, ...mockManagers, ...mockTots];
}
