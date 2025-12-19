// types.ts

// -----------------------------
// User Roles & Users
// -----------------------------
export type UserRole = 'admin' | 'manager' | 'tot';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  localMrId?: string;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: Date;
  lastActivityDate?: Date;
}

// -----------------------------
// Local MR
// -----------------------------
export interface LocalMR {
  id: string;
  name: string;
  code: string;
  county: string;
  subcounty: string;
  location: string;
  managerId: string;
  managerName: string;
  regionManagerId?: string;
  totalTots: number;
  totalFarmers: number;
}

// Alias
export type Branch = LocalMR;

// -----------------------------
// Machinery
// -----------------------------
export type MachineryStatus = 'available' | 'booked' | 'maintenance';

export interface Machinery {
  id: string;
  name: string;
  category: string;
  type?: string;
  status: MachineryStatus;
  pricePerAcre: number;
  localMrId?: string;
  description?: string;
  createdAt?: Date;
}

// -----------------------------
// Value Chains & Farmer Categories
// -----------------------------
export type ValueChain = 
  | 'Maize'
  | 'Wheat'
  | 'Dairy'
  | 'Poultry'
  | 'Horticulture'
  | 'Coffee'
  | 'Tea'
  | 'Sugarcane'
  | 'Livestock'
  | 'Mixed Farming';

export type FarmerCategory = 'New' | 'Existing' | 'Pioneer';
export type FarmerRating = 'Active' | 'Dormant' | 'High-Value';

// -----------------------------
// Farmer
// -----------------------------
export interface Farmer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  location: {
    village: string;
    ward: string;
    subcounty: string;
    county: string;
  };
  localMrId: string;
  localMrName: string;
  farmingActivity: string;
  valueChain: ValueChain;
  farmerCategory: FarmerCategory;
  farmerRating: FarmerRating;
  registeredBy: string; // TOT id
  totalPurchases: number;
  mechanisationCount: number;
  trainingsAttended: number;
  visitsCount: number;
  lastActivityDate?: Date;
  createdAt: Date;
  createdBy?: string;
  lastEditedAt?: Date;
  lastEditedBy?: string;
}

// -----------------------------
// Products
// -----------------------------
export type ProductCategory =
  | 'Machineries'
  | 'Seeds'
  | 'Animal Feeds & Supplements'
  | 'Services'
  | 'Fertilizers'
  | 'Agrochemicals'
  | 'Equipment';

export interface Product {
  id: string;
  name: string;
  sku: string;
  inStock: number;
  unitPrice: number;
  description: string;
  commission: number;
  category: ProductCategory;
  imageUrl?: string;
  createdAt?: Date;
  createdBy?: string;
  lastEditedAt?: Date;
  lastEditedBy?: string;
}

// -----------------------------
// Sales
// -----------------------------
export type SaleStatus = 'pending' | 'completed' | 'cancelled';

export interface Sale {
  id: string;
  totId: string;
  totName?: string;
  localMrId?: string;
  localMrName?: string;
  farmerId: string;
  farmerName?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  commissionAmount: number;
  date: Date;
  status: SaleStatus;
  proofImage?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt?: Date;
  createdBy?: string;
  lastEditedAt?: Date;
  lastEditedBy?: string;
}

// -----------------------------
// Mechanisation Jobs
// -----------------------------
export type MechanisationStatus =
  | 'pending-approval'
  | 'approved'
  | 'rejected'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export interface MechanisationJob {
  id: string;
  farmerId: string;
  farmerName?: string;
  localMrId?: string;
  localMrName?: string;
  machineryId: string;
  machineryName: string;
  serviceType: 'ploughing' | 'harrowing' | 'planting' | 'harvesting' | 'spraying';
  acreage: number;
  pricePerAcre: number;
  totalPrice: number;
  commissionAmount: number;
  status: MechanisationStatus;
  bookedBy: string; // TOT id
  bookedByName?: string;
  scheduledDate: Date;
  completedDate?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  rescheduledDate?: Date;
  createdAt?: Date;
  createdBy?: string;
  lastEditedAt?: Date;
  lastEditedBy?: string;
  gpsLocation?: { lat: number; lng: number };
  images?: string[];
  notes?: string;
}

// -----------------------------
// Visits
// -----------------------------
export interface Visit {
  id: string;
  farmerId: string;
  farmerName?: string;
  totId: string;
  totName?: string;
  localMrId?: string;
  localMrName?: string;
  date: Date;
  gpsLocation?: { lat: number; lng: number };
  notes: string;
  images?: string[];
  purpose: string;
  createdAt?: Date;
  createdBy?: string;
}

// -----------------------------
// Trainings
// -----------------------------
export type TrainingStatus = 'Upcoming' | 'Completed';

export interface Training {
  id: string;
  type?: string;
  title: string;
  date: Date;
  status: TrainingStatus;
  attendees: string[]; // farmer ids
  attendeeNames?: string[];
  trainerId: string; // TOT id
  trainerName?: string;
  topics: string[];
  location: string;
  localMrId?: string;
  localMrName?: string;
  duration: number; // hours
  images?: string[];
  createdAt?: Date;
  createdBy?: string;
}

// -----------------------------
// Notifications
// -----------------------------
export type NotificationType =
  | 'sale'
  | 'sale_completed'
  | 'commission'
  | 'mechanisation'
  | 'mechanisation_pending'
  | 'mechanisation_approved'
  | 'mechanisation_rejected'
  | 'mechanisation_completed'
  | 'farmer'
  | 'training'
  | 'visit'
  | 'manager_message'
  | 'system'
  | 'training_reminder'
  | 'visit_logged'
  | 'support_request'
  | 'escalation'
  | 'failed_operation';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId?: string; // TOT or admin
  localMrId?: string;
  localMrName?: string;
  reportedBy?: string;
  issueType?: string;
  resolutionStatus?: 'pending' | 'resolved' | 'escalated';
  link?: string;
  metadata?: Record<string, any>;
}
// -----------------------------
// Dashboard & TOT Performance
// -----------------------------
export interface DashboardStats {
  totalFarmers: number;
  totalSales: number;
  totalRevenue: number;
  mechanisationJobs: number;
  visitsCompleted: number;
  trainingsHeld: number;
  pendingSync?: number;
  pendingApprovals?: number;
  totalCommission?: number;
}

export interface TOTPerformance {
  totId: string;
  totName: string;
  localMrId: string;
  localMrName: string;
  status: 'active' | 'inactive';
  phone: string;
  email: string;
  totalSales: number;
  totalCommission: number;
  mechanisationJobsCompleted: number;
  trainingsConducted: number; 
  visitsLogged: number;
  lastActivityDate?: Date;
  salesByProduct?: {
    productId: string;
    productName: string;
    quantity: number;
    totalSales: number;
    commission: number;
  }[];
}
