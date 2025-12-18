// mockData.ts
import { User, LocalMR, Sale, MechanisationJob, Visit, Training, Notification, Product } from './types';

// -----------------------------
// Local MRs
// -----------------------------
export const localMRs: LocalMR[] = [
  { id: 'lm1', name: 'Local MR 1', code: 'LM001', county: 'Nairobi', subcounty: 'West', location: 'West Nairobi', managerId: 'mgr1', managerName: 'John Manager', totalTots: 3, totalFarmers: 10 },
  { id: 'lm2', name: 'Local MR 2', code: 'LM002', county: 'Kiambu', subcounty: 'East', location: 'East Kiambu', managerId: 'mgr2', managerName: 'Mary Manager', totalTots: 2, totalFarmers: 8 },
];

// -----------------------------
// TOT Users
// -----------------------------
export const tots: User[] = [
  {
    id: 'tot1',
    name: 'Alice Tot',
    email: 'alice@example.com',
    role: 'tot',
    phone: '0712345678',
    localMrId: 'lm1',
    status: 'active',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'tot2',
    name: 'Bob Tot',
    email: 'bob@example.com',
    role: 'tot',
    phone: '0723456789',
    localMrId: 'lm1',
    status: 'active',
    createdAt: new Date('2025-01-02'),
  },
  {
    id: 'tot3',
    name: 'Cathy Tot',
    email: 'cathy@example.com',
    role: 'tot',
    phone: '0734567890',
    localMrId: 'lm2',
    status: 'active',
    createdAt: new Date('2025-01-03'),
  },
];

// -----------------------------
// Products
// -----------------------------
export const products: Product[] = [
  { id: 'prod1', name: 'Maize Seeds', sku: 'MS001', inStock: 100, unitPrice: 1000, description: 'High quality maize seeds', commission: 100, category: 'Seeds' },
  { id: 'prod2', name: 'Fertilizer', sku: 'F001', inStock: 200, unitPrice: 500, description: 'NPK fertilizer', commission: 50, category: 'Fertilizers' },
];

// -----------------------------
// Farmers
// -----------------------------
export const farmers = [
  {
    id: 'farmer1',
    name: 'Farmer One',
    phone: '0711111111',
    location: { village: 'Village A', ward: 'Ward A', subcounty: 'West', county: 'Nairobi' },
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
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'farmer2',
    name: 'Farmer Two',
    phone: '0722222222',
    location: { village: 'Village B', ward: 'Ward B', subcounty: 'West', county: 'Nairobi' },
    localMrId: 'lm1',
    localMrName: 'Local MR 1',
    farmingActivity: 'Dairy',
    valueChain: 'Dairy',
    farmerCategory: 'New',
    farmerRating: 'High-Value',
    registeredBy: 'tot2',
    totalPurchases: 5000,
    mechanisationCount: 1,
    trainingsAttended: 2,
    visitsCount: 1,
    createdAt: new Date('2025-01-02'),
  },
  {
    id: 'farmer3',
    name: 'Farmer Three',
    phone: '0733333333',
    location: { village: 'Village C', ward: 'Ward C', subcounty: 'East', county: 'Kiambu' },
    localMrId: 'lm2',
    localMrName: 'Local MR 2',
    farmingActivity: 'Horticulture',
    valueChain: 'Horticulture',
    farmerCategory: 'Pioneer',
    farmerRating: 'Active',
    registeredBy: 'tot3',
    totalPurchases: 8000,
    mechanisationCount: 0,
    trainingsAttended: 1,
    visitsCount: 2,
    createdAt: new Date('2025-01-03'),
  },
];

// -----------------------------
// Sales
// -----------------------------
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
    date: new Date('2025-02-01'),
    status: 'completed',
  },
  {
    id: 'sale2',
    totId: 'tot2',
    farmerId: 'farmer2',
    productId: 'prod2',
    productName: 'Fertilizer',
    quantity: 5,
    unitPrice: 500,
    total: 2500,
    commissionAmount: 250,
    date: new Date('2025-02-03'),
    status: 'completed',
  },
];

// -----------------------------
// Mechanisation Jobs
// -----------------------------
export const mechanisationJobs: MechanisationJob[] = [
  {
    id: 'mj1',
    bookedBy: 'tot1',
    farmerId: 'farmer1',
    farmerName: 'Farmer One',
    machineryId: 'mach1',
    machineryName: 'Tractor 1',
    serviceType: 'ploughing',
    acreage: 5,
    pricePerAcre: 1000,
    totalPrice: 5000,
    commissionAmount: 500,
    status: 'completed',
    scheduledDate: new Date('2025-02-05'),
  },
  {
    id: 'mj2',
    bookedBy: 'tot2',
    farmerId: 'farmer2',
    farmerName: 'Farmer Two',
    machineryId: 'mach2',
    machineryName: 'Tractor 2',
    serviceType: 'harrowing',
    acreage: 3,
    pricePerAcre: 800,
    totalPrice: 2400,
    commissionAmount: 240,
    status: 'completed',
    scheduledDate: new Date('2025-02-06'),
  },
];

// -----------------------------
// Visits
// -----------------------------
export const visits: Visit[] = [
  {
    id: 'visit1',
    totId: 'tot1',
    farmerId: 'farmer1',
    date: new Date('2025-02-06'),
    purpose: 'Check maize crop',
    notes: 'Good growth',
  },
  {
    id: 'visit2',
    totId: 'tot3',
    farmerId: 'farmer3',
    date: new Date('2025-02-08'),
    purpose: 'Inspect horticulture',
    notes: 'Needs more water',
  },
];

// -----------------------------
// Trainings
// -----------------------------
export const trainings: Training[] = [
  {
    id: 'tr1',
    trainerId: 'tot1',
    title: 'Soil Health Workshop',
    date: new Date('2025-02-07'),
    status: 'Completed',
    attendees: ['farmer1', 'farmer2'],
    location: 'Community Hall',
    topics: ['Soil Testing', 'Fertilizer Use'],
    duration: 2,
  },
  {
    id: 'tr2',
    trainerId: 'tot3',
    title: 'Dairy Management',
    date: new Date('2025-02-09'),
    status: 'Completed',
    attendees: ['farmer3'],
    location: 'Farmers Center',
    topics: ['Feeding', 'Milking'],
    duration: 3,
  },
];

// -----------------------------
// Notifications
// -----------------------------
export const notifications: Notification[] = [
  {
    id: 'notif1',
    userId: 'tot1',
    type: 'sale',
    title: 'New Sale Completed',
    message: 'Sale of 10 units of Maize Seeds completed.',
    read: false,
    createdAt: new Date('2025-02-01'),
  },
  {
    id: 'notif2',
    userId: 'tot2',
    type: 'mechanisation_completed',
    title: 'Mechanisation Job Completed',
    message: 'Harrowing completed for Farmer Two.',
    read: false,
    createdAt: new Date('2025-02-06'),
  },
];
