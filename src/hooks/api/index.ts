// src/hooks/api/index.ts
// API Hooks - Re-export all hooks for easy importing

// Core entities
export * from './useFarmers';
export * from './useSales';
export * from './useMechanisation';
export * from './useTrainings';
export * from './useVisits';
export * from './useMachinery';
export * from './useLocalMRs';
export * from './useUsers';
export * from './useNotifications';

// Dashboard hooks (note: useProductPerformance is also in useDashboard)
export { 
  useAdminDashboard, 
  useManagerDashboard, 
  useTotDashboard, 
  useMonthlySalesData, 
  useTopPerformers,
  useProductPerformance as useDashboardProductPerformance 
} from './useDashboard';

// Products - export all except useProductPerformance to avoid conflict
export { 
  useProducts, 
  useProduct, 
  useCreateProduct, 
  useUpdateProduct, 
  useUpdateProductStock, 
  useDeleteProduct,
  productKeys 
} from './useProducts';

// Real-time subscriptions
export { useProductsRealtime } from './useProductsRealtime';