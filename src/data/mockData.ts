// src/data/mockData.ts
import {
  User,
  LocalMR,
  Farmer,
  Product,
  Sale,
  MechanisationJob,
  Visit,
  Training,
  Notification,
  DashboardStats,
} from '@/types';

/* =============================
   RAW DATA (SOURCE OF TRUTH)
============================= */

// Local MRs
export const localMRs: LocalMR[] = [
  {
    id: 'lm1',
    name: 'Local MR 1',
    code: 'LM001',
    county: 'Nairobi',
    subcounty: 'West',
    location: 'West Nairobi',
    managerId: 'mgr1',
    managerName: 'John Manager',
    totalTots: 3,
    totalFarmers: 10,
  },
  {
    id: 'lm2',
    name: 'Local MR 2',
    code: 'LM002',
    county: 'Kiambu',
    subcounty: 'East',
    location: 'East Kiambu',
    managerId: 'mgr2',
    managerName: 'Mary Manager',
    totalTots: 2,
    totalFarmers: 8,
  },
];

// Users (TOTs)
export const tots: User[] = [
  {
    id: 'tot1',
    name: 'Alice Tot',
    email: 'alice@example.com',
    role: 'tot',
    phone: '0712345678',
    localMrId: 'lm1',
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: 'tot2',
    name: 'Bob Tot',
    email: 'bob@example.com',
    role: 'tot',
    phone: '0723456789',
    localMrId: 'lm1',
    status: 'active',
    createdAt: new Date(),
  },
];

// Products
export const products: Product[] = [
  {
    id: 'prod1',
    name: 'Maize Seeds',
    sku: 'MS001',
    inStock: 100,
    unitPrice: 1000,
    description: 'High quality maize seeds',
    commission: 100,
    category: 'Seeds',
  },
  {
    id: 'prod2',
    name: 'Fertilizer',
    sku: 'F001',
    inStock: 200,
    unitPrice: 500,
    description: 'NPK fertilizer',
    commission: 50,
    category: 'Fertilizers',
  },
];

// Farmers
export const farmers: Farmer[] = [
  {
    id: 'farmer1',
    name: 'Farmer One',
    phone: '0711111111',
    location: {
      village: 'Village A',
      ward: 'Ward A',
      subcounty: 'West',
      county: 'Nairobi',
    },
    localMrId: 'lm1',
    localMrName: 'Local MR 1',
    farmingActivity: 'Maize farming',
    valueChain: 'Maize',
    farmerCategory: 'Existing',
    farmerRating: 'Active',
    registeredBy: 'tot1',
    totalPurchases: 10000,
    mechanisationCount: 2,
    trainingsAttended: 1,
    visitsCount: 3,
    createdAt: new Date(),
  },
];

// Sales
export const sales: Sale[] = [
  {
    id: 'sale1',
    totId: 'tot1',
    farmerId: 'farmer1',
    productId: 'prod1',
    productName: 'Maize Seeds',
    quantity: 10,
    unitPrice: 1000,
    total: 10000,
    commissionAmount: 1000,
    date: new Date(),
    status: 'completed',
  },
];

// Mechanisation
export const mechanisationJobs: MechanisationJob[] = [
  {
    id: 'mj1',
    bookedBy: 'tot1',
    farmerId: 'farmer1',
    machineryId: 'mach1',
    machineryName: 'Tractor 1',
    serviceType: 'ploughing',
    acreage: 5,
    pricePerAcre: 1000,
    totalPrice: 5000,
    commissionAmount: 500,
    status: 'completed',
    scheduledDate: new Date(),
  },
];

// Visits
export const visits: Visit[] = [
  {
    id: 'visit1',
    totId: 'tot1',
    farmerId: 'farmer1',
    date: new Date(),
    purpose: 'Farm check',
    notes: 'Healthy crops',
  },
];

// Trainings
export const trainings: Training[] = [
  {
    id: 'tr1',
    trainerId: 'tot1',
    title: 'Soil Health',
    date: new Date(),
    status: 'Completed',
    attendees: ['farmer1'],
    location: 'Community Hall',
    topics: ['Soil Testing'],
    duration: 2,
  },
];

// Notifications
export const notifications: Notification[] = [
  {
    id: 'notif1',
    type: 'sale',
    title: 'Sale Completed',
    message: 'Maize seeds sold',
    read: false,
    createdAt: new Date(),
    userId: 'tot1',
  },
];

/* =============================
   🔁 COMPATIBILITY EXPORTS
============================= */

// Old names expected by UI
export const mockFarmers = farmers;
export const mockProducts = products;
export const mockSales = sales;
export const mockMechanisationJobs = mechanisationJobs;
export const mockVisits = visits;
export const mockTrainings = trainings;
export const mockNotifications = notifications;
export const mockLocalMRs = localMRs;
export const mockTots = tots;
export const mockBranches = localMRs;

// Value chains
export const valueChains = [
  'Maize',
  'Wheat',
  'Dairy',
  'Poultry',
  'Horticulture',
  'Coffee',
  'Tea',
];

// Machinery placeholder
export const mockMachinery = [];

/* =============================
   📊 DASHBOARD HELPERS
============================= */

export function getMonthlyData() {
  return [
    { month: 'Jan', sales: 12000 },
    { month: 'Feb', sales: 18000 },
    { month: 'Mar', sales: 15000 },
  ];
}

export function getProductPerformance() {
  return products.map((p) => ({
    name: p.name,
    sales: sales
      .filter((s) => s.productId === p.id)
      .reduce((sum, s) => sum + s.total, 0),
  }));
}

export function getAdminStats(): DashboardStats {
  return {
    totalFarmers: farmers.length,
    totalSales: sales.length,
    totalRevenue: sales.reduce((s, x) => s + x.total, 0),
    mechanisationJobs: mechanisationJobs.length,
    visitsCompleted: visits.length,
    trainingsHeld: trainings.length,
  };
}

export function getManagerStats(): DashboardStats {
  return getAdminStats();
}
