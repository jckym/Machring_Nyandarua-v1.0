// src/lib/getTotStats.ts

import {
  farmers,
  sales,
  mechanisationJobs,
  visits,
  trainings,
} from '@/data/mockData';
import { DashboardStats } from '@/data/types';

export function getTotStats(totId: string): DashboardStats {
  const totalFarmers = farmers.filter(
    farmer => farmer.registeredBy === totId
  ).length;

  const totSales = sales.filter(sale => sale.totId === totId);
  const totalSales = totSales.length;

  const totalRevenue = totSales.reduce(
    (sum, sale) => sum + sale.total,
    0
  );

  const mechanisationJobsCompleted = mechanisationJobs.filter(
    job => job.bookedBy === totId && job.status === 'completed'
  ).length;

  const visitsCompleted = visits.filter(
    visit => visit.totId === totId
  ).length;

  const trainingsHeld = trainings.filter(
    training => training.trainerId === totId
  ).length;

  return {
    totalFarmers,
    totalSales,
    totalRevenue,
    mechanisationJobs: mechanisationJobsCompleted,
    visitsCompleted,
    trainingsHeld,
  };
}
