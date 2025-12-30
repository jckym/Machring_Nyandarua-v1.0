// src/components/dashboard/TOTPerformanceOverview.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Download, 
  UserCheck,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { User, LocalMR, Sale } from '@/types';

interface TOTPerformanceOverviewProps {
  tots: User[];
  localMRs: LocalMR[];
  sales: Sale[];
}

export function TOTPerformanceOverview({ 
  tots, 
  localMRs, 
  sales 
}: TOTPerformanceOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMR, setFilterMR] = useState<string>('all');

  // Calculate metrics for each TOT
  const totMetrics = tots.map(tot => {
    const totSales = sales.filter(s => s.totId === tot.id);
    const completedSales = totSales.filter(s => s.status === 'completed');
    const totalRevenue = completedSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const totalCommission = completedSales.reduce((acc, s) => acc + (s.commissionAmount || 0), 0);
    
    // Determine performance level
    let performanceLevel: 'high' | 'medium' | 'low' | 'inactive' = 'medium';
    if (tot.status === 'inactive') performanceLevel = 'inactive';
    else if (totalRevenue > 100000) performanceLevel = 'high';
    else if (totalRevenue < 20000) performanceLevel = 'low';

    return {
      ...tot,
      salesCount: totSales.length,
      totalRevenue,
      totalCommission,
      performanceLevel,
    };
  });

  // Filter by search and Local MR
  const filteredTots = totMetrics.filter(tot => {
    const matchesSearch = tot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tot.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMR = filterMR === 'all' || tot.localMrId === filterMR;
    return matchesSearch && matchesMR;
  });

  // Sort by revenue (highest first)
  const sortedTots = [...filteredTots].sort((a, b) => b.totalRevenue - a.totalRevenue);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `KES ${(value / 1000000).toFixed(1)}M`;
    return `KES ${(value / 1000).toFixed(0)}K`;
  };

  const getPerformanceBadge = (level: 'high' | 'medium' | 'low' | 'inactive') => {
    switch (level) {
      case 'high':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> High
          </Badge>
        );
      case 'medium':
        return <Badge variant="secondary">Average</Badge>;
      case 'low':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Low
          </Badge>
        );
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>;
    }
  };

  // Summary stats
  const highPerformers = totMetrics.filter(t => t.performanceLevel === 'high').length;
  const lowPerformers = totMetrics.filter(t => t.performanceLevel === 'low').length;
  const inactiveTots = totMetrics.filter(t => t.performanceLevel === 'inactive').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total TOTs</p>
          <p className="text-2xl font-bold">{tots.length}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-muted-foreground">High Performers</p>
          <p className="text-2xl font-bold text-green-600">{highPerformers}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-orange-500">
          <p className="text-sm text-muted-foreground">Need Attention</p>
          <p className="text-2xl font-bold text-orange-600">{lowPerformers}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <p className="text-2xl font-bold text-red-600">{inactiveTots}</p>
        </Card>
      </div>

      {/* Table */}
      <Card variant="elevated">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            TOT Performance Overview
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search TOTs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[180px]"
              />
            </div>
            <Select value={filterMR} onValueChange={setFilterMR}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Local MR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Local MRs</SelectItem>
                {localMRs.map(mr => (
                  <SelectItem key={mr.id} value={mr.id}>{mr.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>TOT Name</TableHead>
                  <TableHead>Local MR</TableHead>
                  <TableHead className="text-center">Sales</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTots.map((tot, index) => (
                  <TableRow key={tot.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tot.name}</p>
                        <p className="text-xs text-muted-foreground">{tot.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{tot.localMrName || 'N/A'}</TableCell>
                    <TableCell className="text-center">{tot.salesCount}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {formatCurrency(tot.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-secondary">
                      {formatCurrency(tot.totalCommission)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tot.status === 'active' ? 'success' : 'secondary'}>
                        {tot.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{getPerformanceBadge(tot.performanceLevel)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {sortedTots.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No TOTs found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
