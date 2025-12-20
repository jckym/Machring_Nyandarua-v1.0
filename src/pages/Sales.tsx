import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { mockSales, mockProducts } from '@/data/mockData';
import { Search, Plus, TrendingUp, Calendar, Download, Package, CheckCircle, MoreVertical, FileSpreadsheet, FileText, WifiOff } from 'lucide-react';
import { exportSalesToExcel, exportSalesToPDF } from '@/lib/exportUtils';
import { SaleFormDialog } from '@/components/forms/SaleFormDialog';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Sale } from '@/types';
import { useSales, useCreateSale, useApiWithFallback } from '@/hooks/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Sales() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [localSales, setLocalSales] = useState<Sale[]>([]);
  const [productFilter, setProductFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  // API hooks with fallback
  const salesQuery = useSales();
  const { data: sales, isLoading, isUsingFallback } = useApiWithFallback(salesQuery, mockSales);
  const createSale = useCreateSale();

  useEffect(() => {
    if (sales && Array.isArray(sales)) {
      setLocalSales(sales);
    }
  }, [sales]);

  const filteredSales = localSales.filter(sale => {
    const matchesSearch = sale.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProduct = productFilter === 'all' || sale.productId === productFilter;
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    return matchesSearch && matchesProduct && matchesStatus;
  });

  const totalRevenue = localSales.reduce((acc, sale) => acc + sale.total, 0);
  const totalCommission = localSales.filter(s => s.status === 'completed').reduce((acc, sale) => acc + sale.commissionAmount, 0);

  const handleAddSale = (data: Partial<Sale>) => {
    if (!isUsingFallback) {
      createSale.mutate(data as any);
    } else {
      const newSale: Sale = {
        id: `sale-${Date.now()}`,
        ...data as any,
        status: 'pending',
      };
      setLocalSales(prev => [...prev, newSale]);
      toast.success('Sale recorded successfully (offline mode)');
    }
    addNotification({
      title: 'New Sale Recorded',
      message: `Sale recorded`,
      type: 'sale',
    });
  };

  const handleCompleteSale = (saleId: string) => {
    setLocalSales(prev => prev.map(s => s.id === saleId ? { ...s, status: 'completed' as const } : s));
    const sale = localSales.find(s => s.id === saleId);
    toast.success('Sale marked as completed');
    addNotification({
      title: 'Sale Completed',
      message: `Commission of KES ${sale?.commissionAmount.toLocaleString()} awarded`,
      type: 'commission',
    });
  };

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      default: return 'destructive';
    }
  };

  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Offline Banner */}
      {isUsingFallback && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-center gap-2 text-warning">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">Using offline data. Changes will sync when connection is restored.</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Sales</h1>
          <p className="text-sm text-muted-foreground">Track and manage product sales</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { exportSalesToExcel(filteredSales); toast.success('Exported to Excel'); }}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { exportSalesToPDF(filteredSales); toast.success('Exported to PDF'); }}>
                <FileText className="w-4 h-4 mr-2" />
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="wheat" size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Sale
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4" variant="forest">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold font-heading truncate">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs sm:text-sm opacity-80">Total Revenue</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-accent-foreground">{localSales.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Sales</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold font-heading text-secondary truncate">{formatCurrency(totalCommission)}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Commission</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-emerald-700">
                {localSales.filter(s => s.status === 'completed').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by farmer or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {mockProducts.map(product => (
                  <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg">Recent Sales ({filteredSales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Farmer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Qty</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Commission</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale, index) => (
                  <tr 
                    key={sale.id}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="py-3 px-4 text-sm">{formatDate(sale.date)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                          {sale.farmerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-sm">{sale.farmerName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{sale.productName}</td>
                    <td className="py-3 px-4 text-sm font-medium">{sale.quantity}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-primary">{formatCurrency(sale.total)}</td>
                    <td className="py-3 px-4 text-sm text-emerald-600 font-medium">{formatCurrency(sale.commissionAmount)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(sale.status) as any}>{sale.status}</Badge>
                        {isManager && sale.status === 'pending' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCompleteSale(sale.id)}>
                                <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                                Mark Completed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sale Form Dialog */}
      <SaleFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddSale}
      />
    </div>
  );
}
