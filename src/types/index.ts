// types.ts

// -----------------------------
// User Roles & Users
// -----------------------------
// Role naming:
// - admin: System Administrator
// - manager: Manager (organization-wide oversight, read-only)
// - local_mr_coordinator: Local MR Coordinator (read-only, scoped to their Local MR)
// - tot: TOT (read-only, can only view their own data)
export type UserRole = 'admin' | 'manager' | 'local_mr_coordinator' | 'tot';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  localMrId?: string;
  localMrName?: string;
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
  code?: string;
  region: string;
  county: string;
  subcounty: string;
  sub_county?: string;
  ward: string;
  coordinator_id?: string;
  coordinatorName?: string;
  managerName?: string;
  contact_email?: string;
  contact_phone?: string;
  status: string;
  totalTots: number;
  totalFarmers: number;
  created_at?: string;
  updated_at?: string;
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
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalRequestedBy?: string;
}

// -----------------------------
// Products
// -----------------------------
export type ProductCategory =
  | 'Seeds'
  | 'Fertilizers'
  | 'Agrochemicals'
  | 'Animal Feeds & Supplements'
  | 'Services'
  | 'Equipment'
  | 'Others';

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
  notes?: string;
  completionReport?: {
    summary: string;
    duration: string;
    outcome: string;
    completedAt: Date;
  };
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
export type TrainingType = 'Workshop' | 'Field Day' | 'Seminar' | 'Demonstration' | 'Online Training';

export interface Training {
  id: string;
  type?: TrainingType;
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
  | 'farmer_approval'
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
// Farmer Approval Request
// -----------------------------
export type ApprovalType = 'add' | 'edit';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface FarmerApprovalRequest {
  id: string;
  farmerId?: string; // Existing farmer ID if editing
  farmerData: Partial<Farmer>;
  type: ApprovalType;
  status: ApprovalStatus;
  requestedBy: string; // TOT ID
  requestedByName: string;
  localMrId: string;
  localMrName: string;
  createdAt: Date;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
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
