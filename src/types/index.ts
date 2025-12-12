export type UserRole = 'admin' | 'manager' | 'tot';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  branchId?: string;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: Date;
}

export interface Branch {
  id: string;
  name: string;
  county: string;
  subcounty: string;
  regionManagerId: string;
  totalTots: number;
  totalFarmers: number;
}

// New Value Chain Categories
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

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location: {
    village: string;
    ward: string;
    subcounty: string;
    county: string;
  };
  branchId: string; // Local MR
  branchName: string;
  farmingActivity: string;
  valueChain: ValueChain;
  farmerCategory: FarmerCategory;
  farmerRating: FarmerRating;
  registeredBy: string;
  // Engagement metrics for rating calculation
  totalPurchases: number;
  mechanisationCount: number;
  trainingsAttended: number;
  visitsCount: number;
  lastActivityDate?: Date;
  soilTests?: SoilTest[];
  mechanisationHistory?: MechanisationJob[];
  trainingAttendance?: Training[];
  createdAt: Date;
}

export interface SoilTest {
  id: string;
  date: Date;
  results: string;
  recommendations: string;
}

// Product categories for sorting
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
}

export interface Machinery {
  id: string;
  name: string;
  type: string;
  status: 'Available' | 'Booked' | 'Maintenance';
  branchId?: string;
  branchName?: string;
  pricePerAcre: number;
  description?: string;
  imageUrl?: string;
  currentBookingId?: string;
  nextAvailableDate?: Date;
  createdAt?: Date;
}

export type SaleStatus = 'pending' | 'completed' | 'cancelled';

export interface Sale {
  id: string;
  totId: string;
  totName?: string;
  farmerId: string;
  farmerName: string;
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
}

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
  farmerName: string;
  machineryId: string;
  machineryName: string;
  serviceType: 'ploughing' | 'harrowing' | 'planting' | 'harvesting' | 'spraying';
  acreage: number;
  pricePerAcre: number;
  totalPrice: number;
  commissionAmount: number;
  status: MechanisationStatus;
  bookedBy: string;
  bookedByName?: string;
  gpsLocation?: {
    lat: number;
    lng: number;
  };
  images?: string[];
  notes?: string;
  scheduledDate: Date;
  completedDate?: Date;
  // Approval workflow
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  rescheduledDate?: Date;
}

export interface Visit {
  id: string;
  farmerId: string;
  farmerName: string;
  totId: string;
  totName?: string;
  date: Date;
  gpsLocation?: {
    lat: number;
    lng: number;
  };
  notes: string;
  images?: string[];
  purpose: string;
}

export type TrainingStatus = 'Upcoming' | 'Completed';

export interface Training {
  id: string;
  type: string;
  title: string;
  date: Date;
  status: TrainingStatus;
  attendees: string[];
  attendeeNames?: string[];
  trainerId: string;
  trainerName: string;
  topics: string[];
  location: string;
  duration: number; // in hours
  images?: string[];
}

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
  | 'visit_logged';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId?: string;
  link?: string;
  metadata?: Record<string, any>;
}

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
