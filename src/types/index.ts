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
  regionManagerId: string;
  totalTots: number;
  totalFarmers: number;
}

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  location: {
    village: string;
    ward: string;
    county: string;
  };
  farmerCategory: 'smallholder' | 'commercial' | 'cooperative';
  registeredBy: string;
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

export interface Product {
  id: string;
  name: string;
  sku: string;
  inStock: number;
  unitPrice: number;
  description: string;
  commission: number;
  category: string;
  imageUrl?: string;
}

export interface Sale {
  id: string;
  totId: string;
  farmerId: string;
  farmerName: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  commissionAmount: number;
  date: Date;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface MechanisationJob {
  id: string;
  farmerId: string;
  farmerName: string;
  serviceType: 'ploughing' | 'harrowing' | 'planting' | 'harvesting' | 'spraying';
  acreage: number;
  pricePerAcre: number;
  totalPrice: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  bookedBy: string;
  gpsLocation?: {
    lat: number;
    lng: number;
  };
  images?: string[];
  scheduledDate: Date;
  completedDate?: Date;
}

export interface Visit {
  id: string;
  farmerId: string;
  farmerName: string;
  totId: string;
  date: Date;
  gpsLocation?: {
    lat: number;
    lng: number;
  };
  notes: string;
  images?: string[];
  purpose: string;
}

export interface Training {
  id: string;
  type: string;
  title: string;
  date: Date;
  attendees: string[];
  trainerId: string;
  trainerName: string;
  topics: string[];
  location: string;
  duration: number; // in hours
}

export interface DashboardStats {
  totalFarmers: number;
  totalSales: number;
  totalRevenue: number;
  mechanisationJobs: number;
  visitsCompleted: number;
  trainingsHeld: number;
  pendingSync?: number;
}
