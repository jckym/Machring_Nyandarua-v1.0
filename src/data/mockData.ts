/* =====================================================
   BASIC TYPES (lightweight, avoids circular imports)
===================================================== */

export type ID = string;

/* =====================================================
   CORE MOCK ENTITIES
===================================================== */

export const mockLocalMRs = [
  { id: 'mr-1', name: 'John Mwangi', region: 'Central' },
  { id: 'mr-2', name: 'Jane Wanjiku', region: 'Rift Valley' },
];

export const mockFarmers = [
  { id: 'farmer-1', name: 'Peter Kamau', localMrId: 'mr-1' },
  { id: 'farmer-2', name: 'Mary Njeri', localMrId: 'mr-2' },
];

export const mockProducts = [
  { id: 'prod-1', name: 'Maize' },
  { id: 'prod-2', name: 'Beans' },
];

export const mockMachinery = [
  { id: 'mach-1', name: 'Tractor' },
  { id: 'mach-2', name: 'Plough' },
];

export const mockBranches = [
  { id: 'branch-1', name: 'Nakuru' },
  { id: 'branch-2', name: 'Nyeri' },
];

export const mockTots = [
  { id: 'tot-1', name: 'TOT Alpha' },
  { id: 'tot-2', name: 'TOT Beta' },
];

export const valueChains = ['Maize', 'Beans', 'Potatoes'];

/* =====================================================
   ACTIVITY DATA
===================================================== */

// SALES DATA - Added linkage validation
export const mockSales = [
  { id: 'sale-1', productId: 'prod-1', amount: 1200 },
  { id: 'sale-2', productId: 'prod-2', amount: 800 },
];

// MACHINISATION JOBS
export const mockMechanisationJobs = [
  { id: 'job-1', machineryId: 'mach-1', status: 'Completed' },
];

// VISIT LOG
export const mockVisits = [
  { id: 'visit-1', farmerId: 'farmer-1', date: '2025-01-10' },
];

// TRAINING LOG
export const mockTrainings = [
  { id: 'training-1', topic: 'Soil Health', attendees: 25 },
];

// NOTIFICATIONS
export const mockNotifications = [
  { id: 'notif-1', message: 'New training scheduled' },
];

/* =====================================================
   DASHBOARD HELPERS (REQUIRED BY CHARTS)
===================================================== */

// Chart Data Helpers
export function getMonthlyData() {
  return [
    { month: 'Jan', value: 400 },
    { month: 'Feb', value: 600 },
    { month: 'Mar', value: 800 },
  ];
}

export function getProductPerformance() {
  return mockProducts.map((product, index) => ({
    name: product.name,
    value: 60 - index * 20, // Dynamic computation
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
    invalidSales: mockSales.filter(
      (sale) => !mockProducts.find((product) => product.id === sale.productId)
    ), // Safety check added
  };
}

export function getManagerStats() {
  return {
    totalVisits: mockVisits.length,
    totalTrainings: mockTrainings.length,
    unmatchedVisits: mockVisits.filter(
      (visit) => !mockFarmers.find((farmer) => farmer.id === visit.farmerId)
    ), // Safety check added
  };
}

/* =====================================================
   TOT PERFORMANCE (YOUR NEW FEATURE)
===================================================== */

export function getTOTPerformanceByLocalMR(localMrId: ID) {
  const matchedMR = mockLocalMRs.find((mr) => mr.id === localMrId);

  if (!matchedMR) {
    throw new Error(`Invalid Local MR ID: ${localMrId}`);
  }

  return {
    localMrId,
    mrName: matchedMR.name,
    farmers: mockFarmers.filter((f) => f.localMrId === localMrId),
    sales: mockSales.filter((sale) =>
      mockFarmers.some((farmer) => farmer.id === sale.id)
    ),
    mechanisationJobs: mockMechanisationJobs,
    visits: mockVisits,
    trainings: mockTrainings,
    notifications: mockNotifications,
  };
}
