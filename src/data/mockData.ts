import { 
  Farmer, Product, Sale, MechanisationJob, Visit, Training, 
  LocalMR, User, DashboardStats, Machinery, Notification, ValueChain, TOTPerformance 
} from '@/types';

// 10 Local MRs across Kenya
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

export const mockTots: User[] = [
  { id: 'tot-001', name: 'John Kamau', email: 'john.kamau@machineryring.ke', role: 'tot', phone: '+254712345678', localMrId: 'lmr-001', status: 'active', createdAt: new Date('2024-01-15'), lastActivityDate: new Date('2024-12-10'), totalSales: 133700, totalCommission: 3500, mechanisationJobsCompleted: 4, trainingsCondcuted: 2, visitsLogged: 8 },
  { id: 'tot-002', name: 'Mary Njeri', email: 'mary.njeri@machineryring.ke', role: 'tot', phone: '+254712345679', localMrId: 'lmr-001', status: 'active', createdAt: new Date('2024-02-10'), lastActivityDate: new Date('2024-12-08'), totalSales: 5400, totalCommission: 180, mechanisationJobsCompleted: 1, trainingsCondcuted: 1, visitsLogged: 5 },
  { id: 'tot-003', name: 'Peter Mwangi', email: 'peter.mwangi@machineryring.ke', role: 'tot', phone: '+254712345680', localMrId: 'lmr-001', status: 'active', createdAt: new Date('2024-03-05'), lastActivityDate: new Date('2024-12-09'), totalSales: 14000, totalCommission: 500, mechanisationJobsCompleted: 0, trainingsCondcuted: 0, visitsLogged: 3 },
  { id: 'tot-004', name: 'Grace Wambui', email: 'grace.wambui@machineryring.ke', role: 'tot', phone: '+254712345681', localMrId: 'lmr-001', status: 'inactive', createdAt: new Date('2024-01-20'), lastActivityDate: new Date('2024-10-15'), totalSales: 0, totalCommission: 0, mechanisationJobsCompleted: 0, trainingsCondcuted: 0, visitsLogged: 0 },
  { id: 'tot-005', name: 'Daniel Kibet', email: 'daniel.kibet@machineryring.ke', role: 'tot', phone: '+254712345682', localMrId: 'lmr-002', status: 'active', createdAt: new Date('2024-02-01'), lastActivityDate: new Date('2024-12-07'), totalSales: 85000, totalCommission: 2800, mechanisationJobsCompleted: 3, trainingsCondcuted: 2, visitsLogged: 12 },
  { id: 'tot-006', name: 'Faith Cherop', email: 'faith.cherop@machineryring.ke', role: 'tot', phone: '+254712345683', localMrId: 'lmr-002', status: 'active', createdAt: new Date('2024-03-01'), lastActivityDate: new Date('2024-12-06'), totalSales: 62000, totalCommission: 1900, mechanisationJobsCompleted: 2, trainingsCondcuted: 1, visitsLogged: 8 },
  { id: 'tot-007', name: 'Samuel Wanyama', email: 'samuel.wanyama@machineryring.ke', role: 'tot', phone: '+254712345684', localMrId: 'lmr-003', status: 'active', createdAt: new Date('2024-01-25'), lastActivityDate: new Date('2024-12-05'), totalSales: 95000, totalCommission: 3200, mechanisationJobsCompleted: 5, trainingsCondcuted: 3, visitsLogged: 15 },
  { id: 'tot-008', name: 'Nancy Wekesa', email: 'nancy.wekesa@machineryring.ke', role: 'tot', phone: '+254712345685', localMrId: 'lmr-003', status: 'active', createdAt: new Date('2024-02-15'), lastActivityDate: new Date('2024-12-04'), totalSales: 45000, totalCommission: 1500, mechanisationJobsCompleted: 1, trainingsCondcuted: 1, visitsLogged: 6 },
];

export const mockManagers: User[] = [
  { id: 'manager-001', name: 'Sarah Wanjiku', email: 'sarah.wanjiku@machineryring.ke', role: 'manager', phone: '+254711111111', localMrId: 'lmr-001', status: 'active', createdAt: new Date('2024-01-01') },
  { id: 'manager-002', name: 'Michael Korir', email: 'michael.korir@machineryring.ke', role: 'manager', phone: '+254711111112', localMrId: 'lmr-002', status: 'active', createdAt: new Date('2024-01-01') },
  { id: 'manager-003', name: 'Grace Wanjala', email: 'grace.wanjala@machineryring.ke', role: 'manager', phone: '+254711111113', localMrId: 'lmr-003', status: 'active', createdAt: new Date('2024-01-01') },
  { id: 'manager-004', name: 'Peter Mwangi', email: 'peter.m@machineryring.ke', role: 'manager', phone: '+254711111114', localMrId: 'lmr-004', status: 'active', createdAt: new Date('2024-01-01') },
  { id: 'manager-005', name: 'Joyce Mwiti', email: 'joyce.mwiti@machineryring.ke', role: 'manager', phone: '+254711111115', localMrId: 'lmr-005', status: 'active', createdAt: new Date('2024-01-01') },
];

// Calculate farmer rating based on engagement
export const calculateFarmerRating = (farmer: { totalPurchases: number; mechanisationCount: number; trainingsAttended: number; visitsCount: number; lastActivityDate?: Date }): 'Active' | 'Dormant' | 'High-Value' => {
  const totalActivity = farmer.totalPurchases + farmer.mechanisationCount + farmer.trainingsAttended + farmer.visitsCount;
  
  // High-Value: 10+ purchases
  if (farmer.totalPurchases >= 10) return 'High-Value';
  
  // Check for dormancy (no activity in 60 days)
  if (farmer.lastActivityDate) {
    const daysSinceActivity = Math.floor((Date.now() - farmer.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceActivity > 60) return 'Dormant';
  }
  
  // Active: 3+ activities per month equivalent
  if (totalActivity >= 3) return 'Active';
  
  return 'Dormant';
};

export const mockFarmers: Farmer[] = [
  { 
    id: 'farmer-001', 
    name: 'James Kiprotich', 
    phone: '+254700111222', 
    email: 'james.k@gmail.com',
    age: 45,
    location: { village: 'Bahati', ward: 'Bahati', subcounty: 'Nakuru East', county: 'Nakuru' }, 
    localMrId: 'lmr-001',
    localMrName: 'Nakuru Central',
    farmingActivity: 'Crop Production',
    valueChain: 'Maize',
    farmerCategory: 'Existing', 
    farmerRating: 'High-Value',
    totalPurchases: 15,
    mechanisationCount: 8,
    trainingsAttended: 5,
    visitsCount: 12,
    lastActivityDate: new Date('2024-12-05'),
    registeredBy: 'tot-001', 
    createdAt: new Date('2024-02-01') 
  },
  { 
    id: 'farmer-002', 
    name: 'Elizabeth Chebet', 
    phone: '+254700111223', 
    email: 'elizabeth.c@yahoo.com',
    age: 38,
    location: { village: 'Molo', ward: 'Molo', subcounty: 'Molo', county: 'Nakuru' }, 
    localMrId: 'lmr-001',
    localMrName: 'Nakuru Central',
    farmingActivity: 'Mixed Farming',
    valueChain: 'Dairy',
    farmerCategory: 'Pioneer', 
    farmerRating: 'Active',
    totalPurchases: 8,
    mechanisationCount: 3,
    trainingsAttended: 4,
    visitsCount: 6,
    lastActivityDate: new Date('2024-12-08'),
    registeredBy: 'tot-001', 
    createdAt: new Date('2024-02-15') 
  },
  { 
    id: 'farmer-003', 
    name: 'Joseph Kiplagat', 
    phone: '+254700111224', 
    age: 52,
    location: { village: 'Njoro', ward: 'Njoro', subcounty: 'Njoro', county: 'Nakuru' }, 
    localMrId: 'lmr-001',
    localMrName: 'Nakuru Central',
    farmingActivity: 'Wheat Farming',
    valueChain: 'Wheat',
    farmerCategory: 'New', 
    farmerRating: 'Active',
    totalPurchases: 3,
    mechanisationCount: 2,
    trainingsAttended: 2,
    visitsCount: 4,
    lastActivityDate: new Date('2024-12-01'),
    registeredBy: 'tot-002', 
    createdAt: new Date('2024-03-01') 
  },
  { 
    id: 'farmer-004', 
    name: 'Agnes Wanjiru', 
    phone: '+254700111225', 
    age: 33,
    location: { village: 'Subukia', ward: 'Subukia', subcounty: 'Subukia', county: 'Nakuru' }, 
    localMrId: 'lmr-001',
    localMrName: 'Nakuru Central',
    farmingActivity: 'Poultry Keeping',
    valueChain: 'Poultry',
    farmerCategory: 'Existing', 
    farmerRating: 'Active',
    totalPurchases: 5,
    mechanisationCount: 1,
    trainingsAttended: 3,
    visitsCount: 5,
    lastActivityDate: new Date('2024-11-20'),
    registeredBy: 'tot-001', 
    createdAt: new Date('2024-03-10') 
  },
  { 
    id: 'farmer-005', 
    name: 'Daniel Rotich', 
    phone: '+254700111226', 
    age: 28,
    location: { village: 'Rongai', ward: 'Rongai', subcounty: 'Rongai', county: 'Nakuru' }, 
    localMrId: 'lmr-001',
    localMrName: 'Nakuru Central',
    farmingActivity: 'Horticulture',
    valueChain: 'Horticulture',
    farmerCategory: 'New', 
    farmerRating: 'Dormant',
    totalPurchases: 1,
    mechanisationCount: 0,
    trainingsAttended: 1,
    visitsCount: 1,
    lastActivityDate: new Date('2024-09-15'),
    registeredBy: 'tot-003', 
    createdAt: new Date('2024-03-20') 
  },
  { 
    id: 'farmer-006', 
    name: 'Rebecca Cherono', 
    phone: '+254700111227', 
    email: 'rebecca.c@gmail.com',
    age: 41,
    location: { village: 'Kipkelion', ward: 'Kipkelion', subcounty: 'Kericho', county: 'Kericho' }, 
    localMrId: 'lmr-010',
    localMrName: 'Kericho South',
    farmingActivity: 'Tea Farming',
    valueChain: 'Tea',
    farmerCategory: 'Pioneer', 
    farmerRating: 'High-Value',
    totalPurchases: 12,
    mechanisationCount: 5,
    trainingsAttended: 6,
    visitsCount: 10,
    lastActivityDate: new Date('2024-12-10'),
    registeredBy: 'tot-007', 
    createdAt: new Date('2024-01-15') 
  },
];

export const mockMachinery: Machinery[] = [
  { id: 'mach-001', name: 'John Deere 5045E', type: 'Tractor', category: 'Heavy Equipment', status: 'Available', localMrId: 'lmr-001', localMrName: 'Nakuru Central', pricePerAcre: 3500, description: '45HP tractor for ploughing', createdAt: new Date('2024-01-01') },
  { id: 'mach-002', name: 'Massey Ferguson 240', type: 'Tractor', category: 'Heavy Equipment', status: 'Booked', localMrId: 'lmr-001', localMrName: 'Nakuru Central', pricePerAcre: 3200, description: '50HP tractor', currentBookingId: 'mech-003', createdAt: new Date('2024-01-01') },
  { id: 'mach-003', name: 'New Holland TT45', type: 'Tractor', category: 'Heavy Equipment', status: 'Available', localMrId: 'lmr-001', localMrName: 'Nakuru Central', pricePerAcre: 3000, description: '45HP compact tractor', createdAt: new Date('2024-02-01') },
  { id: 'mach-004', name: 'Boom Sprayer 500L', type: 'Sprayer', category: 'Spraying Equipment', status: 'Available', localMrId: 'lmr-001', localMrName: 'Nakuru Central', pricePerAcre: 1500, description: 'Tractor mounted sprayer', createdAt: new Date('2024-01-15') },
  { id: 'mach-005', name: 'Disc Harrow 14-disc', type: 'Implement', category: 'Implements', status: 'Available', localMrId: 'lmr-001', localMrName: 'Nakuru Central', pricePerAcre: 2500, description: 'Heavy duty disc harrow', createdAt: new Date('2024-01-15') },
  { id: 'mach-006', name: 'Planter 4-row', type: 'Planter', category: 'Planting Equipment', status: 'Maintenance', localMrId: 'lmr-001', localMrName: 'Nakuru Central', pricePerAcre: 4000, description: 'Precision planter', createdAt: new Date('2024-03-01') },
  { id: 'mach-007', name: 'Combine Harvester', type: 'Harvester', category: 'Heavy Equipment', status: 'Available', localMrId: 'lmr-002', localMrName: 'Eldoret West', pricePerAcre: 5500, description: 'Grain combine harvester', createdAt: new Date('2024-01-01') },
  { id: 'mach-008', name: 'Kubota L3800', type: 'Tractor', category: 'Heavy Equipment', status: 'Available', localMrId: 'lmr-003', localMrName: 'Kitale Hub', pricePerAcre: 3300, description: '38HP compact tractor', createdAt: new Date('2024-02-01') },
];

export const mockProducts: Product[] = [
  { id: 'prod-001', name: 'DAP Fertilizer 50kg', sku: 'FERT-DAP-50', inStock: 250, unitPrice: 4500, description: 'Di-ammonium Phosphate fertilizer for planting', commission: 150, category: 'Fertilizers', createdAt: new Date('2024-01-01') },
  { id: 'prod-002', name: 'CAN Fertilizer 50kg', sku: 'FERT-CAN-50', inStock: 180, unitPrice: 3800, description: 'Calcium Ammonium Nitrate top-dressing fertilizer', commission: 120, category: 'Fertilizers', createdAt: new Date('2024-01-01') },
  { id: 'prod-003', name: 'Hybrid Maize Seeds 10kg', sku: 'SEED-MAIZE-10', inStock: 500, unitPrice: 6500, description: 'High-yield hybrid maize seeds', commission: 200, category: 'Seeds', createdAt: new Date('2024-01-01') },
  { id: 'prod-004', name: 'Bean Seeds 5kg', sku: 'SEED-BEAN-5', inStock: 300, unitPrice: 2500, description: 'Certified bean seeds', commission: 80, category: 'Seeds', createdAt: new Date('2024-01-01') },
  { id: 'prod-005', name: 'Pesticide Spray 1L', sku: 'PEST-SPR-1', inStock: 150, unitPrice: 1800, description: 'Broad-spectrum pesticide', commission: 60, category: 'Agrochemicals', createdAt: new Date('2024-01-01') },
  { id: 'prod-006', name: 'Knapsack Sprayer 16L', sku: 'EQUIP-SPR-16', inStock: 45, unitPrice: 8500, description: 'Manual knapsack sprayer', commission: 300, category: 'Equipment', createdAt: new Date('2024-01-01') },
  { id: 'prod-007', name: 'Dairy Meal 70kg', sku: 'FEED-DM-70', inStock: 200, unitPrice: 2800, description: 'High protein dairy meal', commission: 100, category: 'Animal Feeds & Supplements', createdAt: new Date('2024-01-01') },
  { id: 'prod-008', name: 'Layers Mash 50kg', sku: 'FEED-LM-50', inStock: 180, unitPrice: 3200, description: 'Complete layers feed', commission: 120, category: 'Animal Feeds & Supplements', createdAt: new Date('2024-01-01') },
  { id: 'prod-009', name: 'Ploughing Service', sku: 'SRV-PLOUGH', inStock: 999, unitPrice: 3500, description: 'Tractor ploughing per acre', commission: 200, category: 'Services', createdAt: new Date('2024-01-01') },
  { id: 'prod-010', name: 'Spraying Service', sku: 'SRV-SPRAY', inStock: 999, unitPrice: 1500, description: 'Crop spraying per acre', commission: 100, category: 'Services', createdAt: new Date('2024-01-01') },
];

export const mockSales: Sale[] = [
  { id: 'sale-001', totId: 'tot-001', totName: 'John Kamau', localMrId: 'lmr-001', localMrName: 'Nakuru Central', farmerId: 'farmer-001', farmerName: 'James Kiprotich', productId: 'prod-001', productName: 'DAP Fertilizer 50kg', quantity: 4, unitPrice: 4500, total: 18000, commissionAmount: 600, date: new Date('2024-12-01'), status: 'completed', approvedBy: 'manager-001', approvedAt: new Date('2024-12-02') },
  { id: 'sale-002', totId: 'tot-001', totName: 'John Kamau', localMrId: 'lmr-001', localMrName: 'Nakuru Central', farmerId: 'farmer-002', farmerName: 'Elizabeth Chebet', productId: 'prod-003', productName: 'Hybrid Maize Seeds 10kg', quantity: 10, unitPrice: 6500, total: 65000, commissionAmount: 2000, date: new Date('2024-12-02'), status: 'completed', approvedBy: 'manager-001', approvedAt: new Date('2024-12-03') },
  { id: 'sale-003', totId: 'tot-001', totName: 'John Kamau', localMrId: 'lmr-001', localMrName: 'Nakuru Central', farmerId: 'farmer-004', farmerName: 'Agnes Wanjiru', productId: 'prod-002', productName: 'CAN Fertilizer 50kg', quantity: 6, unitPrice: 3800, total: 22800, commissionAmount: 720, date: new Date('2024-12-05'), status: 'completed', approvedBy: 'manager-001', approvedAt: new Date('2024-12-06') },
  { id: 'sale-004', totId: 'tot-002', totName: 'Mary Njeri', localMrId: 'lmr-001', localMrName: 'Nakuru Central', farmerId: 'farmer-003', farmerName: 'Joseph Kiplagat', productId: 'prod-005', productName: 'Pesticide Spray 1L', quantity: 3, unitPrice: 1800, total: 5400, commissionAmount: 180, date: new Date('2024-12-06'), status: 'completed', approvedBy: 'manager-001', approvedAt: new Date('2024-12-07') },
  { id: 'sale-005', totId: 'tot-001', totName: 'John Kamau', localMrId: 'lmr-001', localMrName: 'Nakuru Central', farmerId: 'farmer-001', farmerName: 'James Kiprotich', productId: 'prod-006', productName: 'Knapsack Sprayer 16L', quantity: 1, unitPrice: 8500, total: 8500, commissionAmount: 0, date: new Date('2024-12-07'), status: 'pending' },
  { id: 'sale-006', totId: 'tot-003', totName: 'Peter Mwangi', localMrId: 'lmr-001', localMrName: 'Nakuru Central', farmerId: 'farmer-005', farmerName: 'Daniel Rotich', productId: 'prod-007', productName: 'Dairy Meal 70kg', quantity: 5, unitPrice: 2800, total: 14000, commissionAmount: 0, date: new Date('2024-12-09'), status: 'pending' },
  { id: 'sale-007', totId: 'tot-005', totName: 'Daniel Kibet', localMrId: 'lmr-002', localMrName: 'Eldoret West', farmerId: 'farmer-006', farmerName: 'Rebecca Cherono', productId: 'prod-001', productName: 'DAP Fertilizer 50kg', quantity: 10, unitPrice: 4500, total: 45000, commissionAmount: 1500, date: new Date('2024-12-03'), status: 'completed', approvedBy: 'manager-002', approvedAt: new Date('2024-12-04') },
  { id: 'sale-008', totId: 'tot-005', totName: 'Daniel Kibet', localMrId: 'lmr-002', localMrName: 'Eldoret West', farmerId: 'farmer-006', farmerName: 'Rebecca Cherono', productId: 'prod-003', productName: 'Hybrid Maize Seeds 10kg', quantity: 5, unitPrice: 6500, total: 32500, commissionAmount: 1000, date: new Date('2024-12-05'), status: 'completed', approvedBy: 'manager-002', approvedAt: new Date('2024-12-06') },
];

export const mockMechanisationJobs: MechanisationJob[] = [
  { id: 'mech-001', farmerId: 'farmer-001', farmerName: 'James Kiprotich', localMrId: 'lmr-001', localMrName: 'Nakuru Central', machineryId: 'mach-001', machineryName: 'John Deere 5045E', serviceType: 'ploughing', acreage: 5, pricePerAcre: 3500, totalPrice: 17500, commissionAmount: 500, status: 'completed', bookedBy: 'tot-001', bookedByName: 'John Kamau', scheduledDate: new Date('2024-11-20'), completedDate: new Date('2024-11-22'), approvedBy: 'manager-001', approvedAt: new Date('2024-11-18') },
  { id: 'mech-002', farmerId: 'farmer-002', farmerName: 'Elizabeth Chebet', localMrId: 'lmr-001', localMrName: 'Nakuru Central', machineryId: 'mach-003', machineryName: 'New Holland TT45', serviceType: 'harrowing', acreage: 8, pricePerAcre: 2500, totalPrice: 20000, commissionAmount: 600, status: 'completed', bookedBy: 'tot-001', bookedByName: 'John Kamau', scheduledDate: new Date('2024-11-25'), completedDate: new Date('2024-11-26'), approvedBy: 'manager-001', approvedAt: new Date('2024-11-23') },
  { id: 'mech-003', farmerId: 'farmer-003', farmerName: 'Joseph Kiplagat', localMrId: 'lmr-001', localMrName: 'Nakuru Central', machineryId: 'mach-002', machineryName: 'Massey Ferguson 240', serviceType: 'ploughing', acreage: 3, pricePerAcre: 3500, totalPrice: 10500, commissionAmount: 0, status: 'in-progress', bookedBy: 'tot-002', bookedByName: 'Mary Njeri', scheduledDate: new Date('2024-12-08'), approvedBy: 'manager-001', approvedAt: new Date('2024-12-06') },
  { id: 'mech-004', farmerId: 'farmer-004', farmerName: 'Agnes Wanjiru', localMrId: 'lmr-001', localMrName: 'Nakuru Central', machineryId: 'mach-001', machineryName: 'John Deere 5045E', serviceType: 'planting', acreage: 10, pricePerAcre: 4000, totalPrice: 40000, commissionAmount: 0, status: 'pending-approval', bookedBy: 'tot-001', bookedByName: 'John Kamau', scheduledDate: new Date('2024-12-15'), notes: 'Customer requests early morning start' },
  { id: 'mech-005', farmerId: 'farmer-005', farmerName: 'Daniel Rotich', localMrId: 'lmr-001', localMrName: 'Nakuru Central', machineryId: 'mach-004', machineryName: 'Boom Sprayer 500L', serviceType: 'spraying', acreage: 6, pricePerAcre: 1500, totalPrice: 9000, commissionAmount: 0, status: 'pending-approval', bookedBy: 'tot-003', bookedByName: 'Peter Mwangi', scheduledDate: new Date('2024-12-18') },
  { id: 'mech-006', farmerId: 'farmer-001', farmerName: 'James Kiprotich', localMrId: 'lmr-001', localMrName: 'Nakuru Central', machineryId: 'mach-005', machineryName: 'Disc Harrow 14-disc', serviceType: 'harrowing', acreage: 5, pricePerAcre: 2500, totalPrice: 12500, commissionAmount: 0, status: 'approved', bookedBy: 'tot-001', bookedByName: 'John Kamau', scheduledDate: new Date('2024-12-20'), approvedBy: 'manager-001', approvedAt: new Date('2024-12-10') },
];

export const mockVisits: Visit[] = [
  { id: 'visit-001', farmerId: 'farmer-001', farmerName: 'James Kiprotich', totId: 'tot-001', totName: 'John Kamau', localMrId: 'lmr-001', localMrName: 'Nakuru Central', date: new Date('2024-12-01'), notes: 'Discussed soil preparation and fertilizer application', purpose: 'Follow-up', gpsLocation: { lat: -0.3031, lng: 36.0800 } },
  { id: 'visit-002', farmerId: 'farmer-002', farmerName: 'Elizabeth Chebet', totId: 'tot-001', totName: 'John Kamau', localMrId: 'lmr-001', localMrName: 'Nakuru Central', date: new Date('2024-12-03'), notes: 'Conducted soil test and provided recommendations', purpose: 'Soil Testing', gpsLocation: { lat: -0.2500, lng: 35.7300 }, images: ['image1.jpg'] },
  { id: 'visit-003', farmerId: 'farmer-004', farmerName: 'Agnes Wanjiru', totId: 'tot-001', totName: 'John Kamau', localMrId: 'lmr-001', localMrName: 'Nakuru Central', date: new Date('2024-12-05'), notes: 'Cooperative meeting about bulk purchasing', purpose: 'Group Meeting', gpsLocation: { lat: -0.1500, lng: 36.1500 } },
  { id: 'visit-004', farmerId: 'farmer-003', farmerName: 'Joseph Kiplagat', totId: 'tot-002', totName: 'Mary Njeri', localMrId: 'lmr-001', localMrName: 'Nakuru Central', date: new Date('2024-12-07'), notes: 'Checked on wheat crop progress and pest status', purpose: 'Crop Monitoring', gpsLocation: { lat: -0.3200, lng: 35.9500 }, images: ['image2.jpg', 'image3.jpg'] },
];

export const mockTrainings: Training[] = [
  { id: 'train-001', type: 'Workshop', title: 'Modern Maize Farming Techniques', date: new Date('2024-11-15'), status: 'Completed', attendees: ['farmer-001', 'farmer-002', 'farmer-003', 'farmer-004'], attendeeNames: ['James Kiprotich', 'Elizabeth Chebet', 'Joseph Kiplagat', 'Agnes Wanjiru'], trainerId: 'tot-001', trainerName: 'John Kamau', localMrId: 'lmr-001', localMrName: 'Nakuru Central', topics: ['Soil Preparation', 'Seed Selection', 'Pest Management'], location: 'Nakuru Agricultural Center', duration: 4, images: ['training1.jpg'] },
  { id: 'train-002', type: 'Field Day', title: 'Mechanization Demonstration', date: new Date('2024-11-28'), status: 'Completed', attendees: ['farmer-001', 'farmer-004', 'farmer-005'], attendeeNames: ['James Kiprotich', 'Agnes Wanjiru', 'Daniel Rotich'], trainerId: 'manager-001', trainerName: 'Sarah Wanjiku', localMrId: 'lmr-001', localMrName: 'Nakuru Central', topics: ['Tractor Operations', 'Implement Selection', 'Cost-Benefit Analysis'], location: 'Bahati Demo Farm', duration: 6 },
  { id: 'train-003', type: 'Seminar', title: 'Soil Health & Conservation', date: new Date('2024-12-04'), status: 'Completed', attendees: ['farmer-002', 'farmer-003'], attendeeNames: ['Elizabeth Chebet', 'Joseph Kiplagat'], trainerId: 'tot-002', trainerName: 'Mary Njeri', localMrId: 'lmr-001', localMrName: 'Nakuru Central', topics: ['Soil Testing', 'Organic Matter', 'Erosion Control'], location: 'Molo Community Hall', duration: 3 },
  { id: 'train-004', type: 'Workshop', title: 'Dairy Management Best Practices', date: new Date('2024-12-20'), status: 'Upcoming', attendees: [], trainerId: 'tot-001', trainerName: 'John Kamau', localMrId: 'lmr-001', localMrName: 'Nakuru Central', topics: ['Feeding', 'Milking Hygiene', 'Disease Prevention'], location: 'Nakuru Agricultural Center', duration: 5 },
];

export const mockNotifications: Notification[] = [
  { id: 'notif-001', type: 'sale_completed', title: 'Sale Approved', message: 'Your sale to James Kiprotich has been approved', read: false, createdAt: new Date('2024-12-10T09:00:00'), userId: 'tot-001', link: '/sales' },
  { id: 'notif-002', type: 'mechanisation_pending', title: 'New Booking Request', message: 'Agnes Wanjiru has requested planting service', read: false, createdAt: new Date('2024-12-09T14:30:00'), userId: 'manager-001', localMrId: 'lmr-001', localMrName: 'Nakuru Central', link: '/mechanisation' },
  { id: 'notif-003', type: 'mechanisation_approved', title: 'Booking Approved', message: 'Your booking for James Kiprotich has been approved', read: true, createdAt: new Date('2024-12-08T11:00:00'), userId: 'tot-001', link: '/mechanisation' },
  { id: 'notif-004', type: 'training_reminder', title: 'Training Tomorrow', message: 'Dairy Management workshop is scheduled for tomorrow', read: false, createdAt: new Date('2024-12-09T16:00:00'), userId: 'tot-001', link: '/trainings' },
  { id: 'notif-005', type: 'system', title: 'System Update', message: 'New features have been added to the dashboard', read: true, createdAt: new Date('2024-12-07T08:00:00'), userId: 'tot-001' },
  { id: 'notif-006', type: 'commission', title: 'Commission Awarded', message: 'You earned KES 600 commission on sale to James Kiprotich', read: false, createdAt: new Date('2024-12-02T10:00:00'), userId: 'tot-001', link: '/commission' },
  { id: 'notif-007', type: 'support_request', title: 'Support Request', message: 'TOT John Kamau reported an issue with machinery booking', read: false, createdAt: new Date('2024-12-11T08:30:00'), userId: 'manager-001', localMrId: 'lmr-001', localMrName: 'Nakuru Central', reportedBy: 'tot-001', issueType: 'Machinery Booking', resolutionStatus: 'pending' },
];

export const valueChains: ValueChain[] = [
  'Maize', 'Wheat', 'Dairy', 'Poultry', 'Horticulture', 
  'Coffee', 'Tea', 'Sugarcane', 'Livestock', 'Mixed Farming'
];

// Calculate TOT commission from completed sales only
export const calculateTOTCommission = (totId: string, sales: Sale[], products: Product[]): number => {
  return sales
    .filter(sale => sale.totId === totId && sale.status === 'completed')
    .reduce((total, sale) => {
      const product = products.find(p => p.id === sale.productId);
      // Use current product commission value (Admin can update)
      const commissionPerUnit = product?.commission || 0;
      return total + (sale.quantity * commissionPerUnit);
    }, 0);
};

// Get TOT performance data for a Local MR
export const getTOTPerformanceByLocalMR = (localMrId: string): TOTPerformance[] => {
  const totsInMr = mockTots.filter(tot => tot.localMrId === localMrId);
  const localMr = mockLocalMRs.find(mr => mr.id === localMrId);
  
  return totsInMr.map(tot => {
    const totSales = mockSales.filter(s => s.totId === tot.id);
    const completedSales = totSales.filter(s => s.status === 'completed');
    
    // Calculate commission from completed sales
    const totalCommission = calculateTOTCommission(tot.id, mockSales, mockProducts);
    
    // Product-wise breakdown
    const salesByProduct = completedSales.reduce((acc, sale) => {
      const existing = acc.find(p => p.productId === sale.productId);
      const product = mockProducts.find(p => p.id === sale.productId);
      const commissionPerUnit = product?.commission || 0;
      
      if (existing) {
        existing.quantity += sale.quantity;
        existing.totalSales += sale.total;
        existing.commission += sale.quantity * commissionPerUnit;
      } else {
        acc.push({
          productId: sale.productId,
          productName: sale.productName,
          quantity: sale.quantity,
          totalSales: sale.total,
          commission: sale.quantity * commissionPerUnit,
        });
      }
      return acc;
    }, [] as TOTPerformance['salesByProduct']);

    const completedMechJobs = mockMechanisationJobs.filter(
      j => j.bookedBy === tot.id && j.status === 'completed'
    ).length;
    
    const trainingsCondcuted = mockTrainings.filter(
      t => t.trainerId === tot.id && t.status === 'Completed'
    ).length;
    
    const visitsLogged = mockVisits.filter(v => v.totId === tot.id).length;

    return {
      totId: tot.id,
      totName: tot.name,
      localMrId: localMrId,
      localMrName: localMr?.name || '',
      status: tot.status,
      phone: tot.phone,
      email: tot.email,
      totalSales: completedSales.reduce((sum, s) => sum + s.total, 0),
      totalCommission,
      mechanisationJobsCompleted: completedMechJobs,
      trainingsCondcuted,
      visitsLogged,
      lastActivityDate: tot.lastActivityDate,
      salesByProduct,
    };
  });
};

// Get all TOT performance data grouped by Local MR
export const getAllTOTPerformance = (): Map<string, TOTPerformance[]> => {
  const performanceMap = new Map<string, TOTPerformance[]>();
  
  mockLocalMRs.forEach(mr => {
    performanceMap.set(mr.id, getTOTPerformanceByLocalMR(mr.id));
  });
  
  return performanceMap;
};

export const getTotStats = (): DashboardStats => ({
  totalFarmers: 28,
  totalSales: 45,
  totalRevenue: 485000,
  mechanisationJobs: 12,
  visitsCompleted: 35,
  trainingsHeld: 8,
  pendingSync: 3,
  totalCommission: 15500,
});

export const getManagerStats = (): DashboardStats => ({
  totalFarmers: 450,
  totalSales: 320,
  totalRevenue: 8500000,
  mechanisationJobs: 85,
  visitsCompleted: 420,
  trainingsHeld: 45,
  pendingApprovals: 8,
});

export const getAdminStats = (): DashboardStats => ({
  totalFarmers: 1150,
  totalSales: 890,
  totalRevenue: 24500000,
  mechanisationJobs: 245,
  visitsCompleted: 1200,
  trainingsHeld: 120,
  pendingApprovals: 23,
});

export const getMonthlyData = () => [
  { month: 'Jul', sales: 580000, mechanisation: 320000, farmers: 45 },
  { month: 'Aug', sales: 720000, mechanisation: 450000, farmers: 62 },
  { month: 'Sep', sales: 850000, mechanisation: 380000, farmers: 58 },
  { month: 'Oct', sales: 920000, mechanisation: 520000, farmers: 75 },
  { month: 'Nov', sales: 1100000, mechanisation: 680000, farmers: 88 },
  { month: 'Dec', sales: 1350000, mechanisation: 750000, farmers: 95 },
];

export const getProductPerformance = () => [
  { name: 'DAP Fertilizer', sales: 45, revenue: 202500 },
  { name: 'Hybrid Maize Seeds', sales: 38, revenue: 247000 },
  { name: 'CAN Fertilizer', sales: 32, revenue: 121600 },
  { name: 'Dairy Meal', sales: 28, revenue: 78400 },
  { name: 'Pesticide Spray', sales: 22, revenue: 39600 },
];
