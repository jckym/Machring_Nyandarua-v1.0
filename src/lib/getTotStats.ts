import {
  mockFarmers,
  mockSales,
  mockMechanisationJobs,
  mockVisits,
  mockTrainings,
} from '@/data/mockData';
import { DashboardStats } from '@/types';

export function getTotStats(totId: string): DashboardStats {
  const totalFarmers = mockFarmers.filter(
    farmer => farmer.registeredBy === totId
  ).length;

  const totSales = mockSales.filter(sale => sale.totId === totId);
  const totalSales = totSales.length;

  const totalRevenue = totSales.reduce(
    (sum, sale) => sum + sale.total,
    0
  );

  const mechanisationJobsCompleted = mockMechanisationJobs.filter(
    job => job.bookedBy === totId && job.status === 'completed'
  ).length;

  const visitsCompleted = mockVisits.filter(
    visit => visit.totId === totId
  ).length;

  const trainingsHeld = mockTrainings.filter(
    training => training.trainerId === totId
  ).length;

  const totalCommission = totSales
    .filter(s => s.status === 'completed')
    .reduce((sum, sale) => sum + sale.commissionAmount, 0);

  return {
    totalFarmers,
    totalSales,
    totalRevenue,
    mechanisationJobs: mechanisationJobsCompleted,
    visitsCompleted,
    trainingsHeld,
    totalCommission,
  };
}
