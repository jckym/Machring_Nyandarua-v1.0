// src/hooks/api/index.ts
// API Hooks - Re-export all hooks for easy importing

// Core entities
export * from './useFarmers';
export * from './useSales';
export * from './useMechanisation';
export * from './useProducts';
export * from './useNotifications';
export * from './useDashboard';

// Additional entities
export * from './useTrainings';
export * from './useVisits';
export * from './useMachinery';
export * from './useLocalMRs';
export * from './useUsers';

// No more fallbacks — everything is real API-driven
// Removed: export * from './useApiWithFallback';
