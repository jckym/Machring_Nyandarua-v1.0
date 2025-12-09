import { Farmer, Product, Sale, MechanisationJob, Visit, Training, Branch, User, DashboardStats } from '@/types';

export const mockBranches: Branch[] = [
  { id: 'branch-001', name: 'Nakuru Central', county: 'Nakuru', regionManagerId: 'manager-001', totalTots: 12, totalFarmers: 450 },
  { id: 'branch-002', name: 'Eldoret West', county: 'Uasin Gishu', regionManagerId: 'manager-002', totalTots: 8, totalFarmers: 320 },
  { id: 'branch-003', name: 'Kitale Hub', county: 'Trans Nzoia', regionManagerId: 'manager-003', totalTots: 10, totalFarmers: 380 },
];

export const mockTots: User[] = [
  { id: 'tot-001', name: 'John Kamau', email: 'john.kamau@machineryring.ke', role: 'tot', phone: '+254712345678', branchId: 'branch-001', status: 'active', createdAt: new Date('2024-01-15') },
  { id: 'tot-002', name: 'Mary Njeri', email: 'mary.njeri@machineryring.ke', role: 'tot', phone: '+254712345679', branchId: 'branch-001', status: 'active', createdAt: new Date('2024-02-10') },
  { id: 'tot-003', name: 'Peter Mwangi', email: 'peter.mwangi@machineryring.ke', role: 'tot', phone: '+254712345680', branchId: 'branch-001', status: 'active', createdAt: new Date('2024-03-05') },
  { id: 'tot-004', name: 'Grace Wambui', email: 'grace.wambui@machineryring.ke', role: 'tot', phone: '+254712345681', branchId: 'branch-001', status: 'active', createdAt: new Date('2024-01-20') },
];

export const mockFarmers: Farmer[] = [
  { id: 'farmer-001', name: 'James Kiprotich', phone: '+254700111222', location: { village: 'Bahati', ward: 'Bahati', county: 'Nakuru' }, farmerCategory: 'smallholder', registeredBy: 'tot-001', createdAt: new Date('2024-02-01') },
  { id: 'farmer-002', name: 'Elizabeth Chebet', phone: '+254700111223', location: { village: 'Molo', ward: 'Molo', county: 'Nakuru' }, farmerCategory: 'commercial', registeredBy: 'tot-001', createdAt: new Date('2024-02-15') },
  { id: 'farmer-003', name: 'Joseph Kiplagat', phone: '+254700111224', location: { village: 'Njoro', ward: 'Njoro', county: 'Nakuru' }, farmerCategory: 'smallholder', registeredBy: 'tot-002', createdAt: new Date('2024-03-01') },
  { id: 'farmer-004', name: 'Agnes Wanjiru', phone: '+254700111225', location: { village: 'Subukia', ward: 'Subukia', county: 'Nakuru' }, farmerCategory: 'cooperative', registeredBy: 'tot-001', createdAt: new Date('2024-03-10') },
  { id: 'farmer-005', name: 'Daniel Rotich', phone: '+254700111226', location: { village: 'Rongai', ward: 'Rongai', county: 'Nakuru' }, farmerCategory: 'smallholder', registeredBy: 'tot-003', createdAt: new Date('2024-03-20') },
];

export const mockProducts: Product[] = [
  { id: 'prod-001', name: 'DAP Fertilizer 50kg', sku: 'FERT-DAP-50', inStock: 250, unitPrice: 4500, description: 'Di-ammonium Phosphate fertilizer for planting', commission: 150, category: 'Fertilizers' },
  { id: 'prod-002', name: 'CAN Fertilizer 50kg', sku: 'FERT-CAN-50', inStock: 180, unitPrice: 3800, description: 'Calcium Ammonium Nitrate top-dressing fertilizer', commission: 120, category: 'Fertilizers' },
  { id: 'prod-003', name: 'Hybrid Maize Seeds 10kg', sku: 'SEED-MAIZE-10', inStock: 500, unitPrice: 6500, description: 'High-yield hybrid maize seeds', commission: 200, category: 'Seeds' },
  { id: 'prod-004', name: 'Bean Seeds 5kg', sku: 'SEED-BEAN-5', inStock: 300, unitPrice: 2500, description: 'Certified bean seeds', commission: 80, category: 'Seeds' },
  { id: 'prod-005', name: 'Pesticide Spray 1L', sku: 'PEST-SPR-1', inStock: 150, unitPrice: 1800, description: 'Broad-spectrum pesticide', commission: 60, category: 'Agrochemicals' },
  { id: 'prod-006', name: 'Knapsack Sprayer 16L', sku: 'EQUIP-SPR-16', inStock: 45, unitPrice: 8500, description: 'Manual knapsack sprayer', commission: 300, category: 'Equipment' },
];

export const mockSales: Sale[] = [
  { id: 'sale-001', totId: 'tot-001', farmerId: 'farmer-001', farmerName: 'James Kiprotich', productId: 'prod-001', productName: 'DAP Fertilizer 50kg', quantity: 4, unitPrice: 4500, total: 18000, commissionAmount: 600, date: new Date('2024-12-01'), status: 'completed' },
  { id: 'sale-002', totId: 'tot-001', farmerId: 'farmer-002', farmerName: 'Elizabeth Chebet', productId: 'prod-003', productName: 'Hybrid Maize Seeds 10kg', quantity: 10, unitPrice: 6500, total: 65000, commissionAmount: 2000, date: new Date('2024-12-02'), status: 'completed' },
  { id: 'sale-003', totId: 'tot-001', farmerId: 'farmer-004', farmerName: 'Agnes Wanjiru', productId: 'prod-002', productName: 'CAN Fertilizer 50kg', quantity: 6, unitPrice: 3800, total: 22800, commissionAmount: 720, date: new Date('2024-12-05'), status: 'completed' },
  { id: 'sale-004', totId: 'tot-002', farmerId: 'farmer-003', farmerName: 'Joseph Kiplagat', productId: 'prod-005', productName: 'Pesticide Spray 1L', quantity: 3, unitPrice: 1800, total: 5400, commissionAmount: 180, date: new Date('2024-12-06'), status: 'completed' },
  { id: 'sale-005', totId: 'tot-001', farmerId: 'farmer-001', farmerName: 'James Kiprotich', productId: 'prod-006', productName: 'Knapsack Sprayer 16L', quantity: 1, unitPrice: 8500, total: 8500, commissionAmount: 300, date: new Date('2024-12-07'), status: 'pending' },
];

export const mockMechanisationJobs: MechanisationJob[] = [
  { id: 'mech-001', farmerId: 'farmer-001', farmerName: 'James Kiprotich', serviceType: 'ploughing', acreage: 5, pricePerAcre: 3500, totalPrice: 17500, status: 'completed', bookedBy: 'tot-001', scheduledDate: new Date('2024-11-20'), completedDate: new Date('2024-11-22') },
  { id: 'mech-002', farmerId: 'farmer-002', farmerName: 'Elizabeth Chebet', serviceType: 'harrowing', acreage: 8, pricePerAcre: 2500, totalPrice: 20000, status: 'completed', bookedBy: 'tot-001', scheduledDate: new Date('2024-11-25'), completedDate: new Date('2024-11-26') },
  { id: 'mech-003', farmerId: 'farmer-003', farmerName: 'Joseph Kiplagat', serviceType: 'ploughing', acreage: 3, pricePerAcre: 3500, totalPrice: 10500, status: 'in-progress', bookedBy: 'tot-002', scheduledDate: new Date('2024-12-08') },
  { id: 'mech-004', farmerId: 'farmer-004', farmerName: 'Agnes Wanjiru', serviceType: 'planting', acreage: 10, pricePerAcre: 4000, totalPrice: 40000, status: 'pending', bookedBy: 'tot-001', scheduledDate: new Date('2024-12-15') },
  { id: 'mech-005', farmerId: 'farmer-005', farmerName: 'Daniel Rotich', serviceType: 'spraying', acreage: 6, pricePerAcre: 1500, totalPrice: 9000, status: 'pending', bookedBy: 'tot-003', scheduledDate: new Date('2024-12-18') },
];

export const mockVisits: Visit[] = [
  { id: 'visit-001', farmerId: 'farmer-001', farmerName: 'James Kiprotich', totId: 'tot-001', date: new Date('2024-12-01'), notes: 'Discussed soil preparation and fertilizer application', purpose: 'Follow-up', gpsLocation: { lat: -0.3031, lng: 36.0800 } },
  { id: 'visit-002', farmerId: 'farmer-002', farmerName: 'Elizabeth Chebet', totId: 'tot-001', date: new Date('2024-12-03'), notes: 'Conducted soil test and provided recommendations', purpose: 'Soil Testing', gpsLocation: { lat: -0.2500, lng: 35.7300 } },
  { id: 'visit-003', farmerId: 'farmer-004', farmerName: 'Agnes Wanjiru', totId: 'tot-001', date: new Date('2024-12-05'), notes: 'Cooperative meeting about bulk purchasing', purpose: 'Group Meeting', gpsLocation: { lat: -0.1500, lng: 36.1500 } },
];

export const mockTrainings: Training[] = [
  { id: 'train-001', type: 'Workshop', title: 'Modern Maize Farming Techniques', date: new Date('2024-11-15'), attendees: ['farmer-001', 'farmer-002', 'farmer-003', 'farmer-004'], trainerId: 'tot-001', trainerName: 'John Kamau', topics: ['Soil Preparation', 'Seed Selection', 'Pest Management'], location: 'Nakuru Agricultural Center', duration: 4 },
  { id: 'train-002', type: 'Field Day', title: 'Mechanization Demonstration', date: new Date('2024-11-28'), attendees: ['farmer-001', 'farmer-004', 'farmer-005'], trainerId: 'manager-001', trainerName: 'Sarah Wanjiku', topics: ['Tractor Operations', 'Implement Selection', 'Cost-Benefit Analysis'], location: 'Bahati Demo Farm', duration: 6 },
  { id: 'train-003', type: 'Seminar', title: 'Soil Health & Conservation', date: new Date('2024-12-04'), attendees: ['farmer-002', 'farmer-003'], trainerId: 'tot-002', trainerName: 'Mary Njeri', topics: ['Soil Testing', 'Organic Matter', 'Erosion Control'], location: 'Molo Community Hall', duration: 3 },
];

export const getTotStats = (): DashboardStats => ({
  totalFarmers: 28,
  totalSales: 45,
  totalRevenue: 485000,
  mechanisationJobs: 12,
  visitsCompleted: 35,
  trainingsHeld: 8,
  pendingSync: 3,
});

export const getManagerStats = (): DashboardStats => ({
  totalFarmers: 450,
  totalSales: 320,
  totalRevenue: 8500000,
  mechanisationJobs: 85,
  visitsCompleted: 420,
  trainingsHeld: 45,
});

export const getAdminStats = (): DashboardStats => ({
  totalFarmers: 1150,
  totalSales: 890,
  totalRevenue: 24500000,
  mechanisationJobs: 245,
  visitsCompleted: 1200,
  trainingsHeld: 120,
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
  { name: 'DAP Fertilizer', value: 35 },
  { name: 'CAN Fertilizer', value: 28 },
  { name: 'Maize Seeds', value: 20 },
  { name: 'Pesticides', value: 12 },
  { name: 'Equipment', value: 5 },
];
