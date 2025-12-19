import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Download, Building2, Users, TrendingUp, ChevronRight, 
  ArrowLeft, FileText, FileSpreadsheet, Calculator 
} from 'lucide-react';
import { 
  mockLocalMRs, getLocalMRCommissionSummary, getTOTsByLocalMR, 
  calculateTOTCommission, mockTots 
} from '@/data/mockData';
import { toast } from 'sonner';

type ViewMode = 'local-mrs' | 'tots' | 'tot-detail';

interface SelectedContext {
  localMrId?: string;
  localMrName?: string;
  totId?: string;
  totName?: string;
}

export function CommissionCalculator() {
  const [viewMode, setViewMode] = useState<ViewMode>('local-mrs');
  const [selectedContext, setSelectedContext] = useState<SelectedContext>({});

  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

  // Calculate totals across all Local MRs
  const allMRSummaries = mockLocalMRs.map(mr => getLocalMRCommissionSummary(mr.id));
  const totalCommission = allMRSummaries.reduce((acc, mr) => acc + mr.totalCommission, 0);
  const totalSales = allMRSummaries.reduce((acc, mr) => acc + mr.totalSales, 0);
  const totalActiveTots = allMRSummaries.reduce((acc, mr) => acc + mr.activeTots, 0);

  const handleSelectLocalMR = (mrId: string, mrName: string) => {
    setSelectedContext({ localMrId: mrId, localMrName: mrName });
    setViewMode('tots');
  };

  const handleSelectTOT = (totId: string, totName: string) => {
    setSelectedContext(prev => ({ ...prev, totId, totName }));
    setViewMode('tot-detail');
  };

  const handleBack = () => {
    if (viewMode === 'tot-detail') {
      setViewMode('tots');
      setSelectedContext(prev => ({ localMrId: prev.localMrId, localMrName: prev.localMrName }));
    } else {
      setViewMode('local-mrs');
      setSelectedContext({});
    }
  };

  const exportToPDF = () => {
    toast.success('PDF export started - downloading...');
    // Generate text report for now
    let reportContent = `COMMISSION REPORT\n${'='.repeat(50)}\nGenerated: ${new Date().toLocaleString()}\n\n`;
    
    if (viewMode === 'local-mrs') {
      reportContent += `ALL LOCAL MRs SUMMARY\n${'-'.repeat(30)}\n`;
      allMRSummaries.forEach(mr => {
        reportContent += `\n${mr.localMrName}\n`;
        reportContent += `  Manager: ${mr.managerName}\n`;
        reportContent += `  Total TOTs: ${mr.totalTots} (${mr.activeTots} active)\n`;
        reportContent += `  Total Sales: ${formatCurrency(mr.totalSales)}\n`;
        reportContent += `  Total Commission: ${formatCurrency(mr.totalCommission)}\n`;
      });
      reportContent += `\n${'='.repeat(50)}\nGRAND TOTAL COMMISSION: ${formatCurrency(totalCommission)}`;
    } else if (viewMode === 'tots' && selectedContext.localMrId) {
      const totsData = getTOTsByLocalMR(selectedContext.localMrId);
      reportContent += `LOCAL MR: ${selectedContext.localMrName}\n${'-'.repeat(30)}\n`;
      totsData.forEach(tot => {
        reportContent += `\n${tot.totName}\n`;
        reportContent += `  Status: ${tot.status}\n`;
        reportContent += `  Total Sales: ${formatCurrency(tot.totalSales)}\n`;
        reportContent += `  Commission Earned: ${formatCurrency(tot.totalCommission)}\n`;
      });
    }
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `commission_report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  const exportToExcel = () => {
    toast.success('Excel export started - downloading...');
    // CSV export
    let csvContent = '';
    
    if (viewMode === 'local-mrs') {
      csvContent = 'Local MR,Manager,TOTs,Active TOTs,Total Sales (KES),Total Commission (KES)\n';
      allMRSummaries.forEach(mr => {
        csvContent += `"${mr.localMrName}","${mr.managerName}",${mr.totalTots},${mr.activeTots},${mr.totalSales},${mr.totalCommission}\n`;
      });
    } else if (viewMode === 'tots' && selectedContext.localMrId) {
      csvContent = 'TOT Name,Status,Phone,Total Sales (KES),Commission (KES),Jobs Completed,Trainings,Visits\n';
      const totsData = getTOTsByLocalMR(selectedContext.localMrId);
      totsData.forEach(tot => {
        csvContent += `"${tot.totName}","${tot.status}","${tot.phone}",${tot.totalSales},${tot.totalCommission},${tot.mechanisationJobsCompleted},${tot.trainingsConducted},${tot.visitsLogged}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `commission_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Render Local MRs view
  const renderLocalMRsView = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Local MRs</p>
              <p className="text-2xl font-bold font-heading">{mockLocalMRs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active TOTs</p>
              <p className="text-2xl font-bold font-heading">{totalActiveTots}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold font-heading">{formatCurrency(totalSales)}</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="forest">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-80">Total Commission</p>
              <p className="text-2xl font-bold font-heading">{formatCurrency(totalCommission)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Local MRs Table */}
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">All Local MRs Commission Summary</CardTitle>
          <p className="text-sm text-muted-foreground">Click on a Local MR to view TOT details</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Local MR</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-center">TOTs</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allMRSummaries.map((mr) => (
                <TableRow 
                  key={mr.localMrId} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectLocalMR(mr.localMrId, mr.localMrName)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{mr.localMrName}</p>
                        <p className="text-xs text-muted-foreground">{mr.activeTots} active TOTs</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{mr.managerName}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{mr.totalTots}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(mr.totalSales)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-primary">{formatCurrency(mr.totalCommission)}</span>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );

  // Render TOTs view for selected Local MR
  const renderTOTsView = () => {
    if (!selectedContext.localMrId) return null;
    
    const totsData = getTOTsByLocalMR(selectedContext.localMrId);
    const mrSummary = getLocalMRCommissionSummary(selectedContext.localMrId);

    return (
      <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total TOTs</p>
              <p className="text-2xl font-bold">{mrSummary.totalTots}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600">{mrSummary.activeTots}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold">{formatCurrency(mrSummary.totalSales)}</p>
            </CardContent>
          </Card>
          <Card variant="forest">
            <CardContent className="p-4">
              <p className="text-sm opacity-80">Total Commission</p>
              <p className="text-2xl font-bold">{formatCurrency(mrSummary.totalCommission)}</p>
            </CardContent>
          </Card>
        </div>

        {/* TOTs Table */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">TOTs in {selectedContext.localMrName}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TOT Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Total Sales</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-center">Jobs</TableHead>
                  <TableHead className="text-center">Trainings</TableHead>
                  <TableHead className="text-center">Visits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totsData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No TOTs found in this Local MR
                    </TableCell>
                  </TableRow>
                ) : (
                  totsData.map((tot) => (
                    <TableRow key={tot.totId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {tot.totName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium">{tot.totName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tot.status === 'active' ? 'success' : 'secondary'}>
                          {tot.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{tot.phone}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(tot.totalSales)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-primary">{formatCurrency(tot.totalCommission)}</span>
                      </TableCell>
                      <TableCell className="text-center">{tot.mechanisationJobsCompleted}</TableCell>
                      <TableCell className="text-center">{tot.trainingsConducted}</TableCell>
                      <TableCell className="text-center">{tot.visitsLogged}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Product Breakdown for first TOT with sales */}
        {totsData.length > 0 && totsData[0].salesByProduct && totsData[0].salesByProduct.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product-wise Commission Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">Showing breakdown for {totsData[0].totName}</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Quantity Sold</TableHead>
                    <TableHead className="text-right">Total Sales</TableHead>
                    <TableHead className="text-right">Commission Earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {totsData[0].salesByProduct.map((product, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{product.productName}</TableCell>
                      <TableCell className="text-center">{product.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.totalSales)}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(product.commission)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {viewMode !== 'local-mrs' && (
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Commission Calculator
            </h1>
            <p className="text-muted-foreground">
              {viewMode === 'local-mrs' && 'View commission across all Local MRs'}
              {viewMode === 'tots' && `TOTs in ${selectedContext.localMrName}`}
              {viewMode === 'tot-detail' && `${selectedContext.totName} - Commission Details`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      {viewMode !== 'local-mrs' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="link" className="p-0 h-auto" onClick={() => { setViewMode('local-mrs'); setSelectedContext({}); }}>
            All Local MRs
          </Button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{selectedContext.localMrName}</span>
          {viewMode === 'tot-detail' && selectedContext.totName && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">{selectedContext.totName}</span>
            </>
          )}
        </div>
      )}

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start gap-3">
          <Calculator className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Commission is auto-calculated</p>
            <p className="text-blue-700">
              Commission is automatically calculated based on <strong>completed sales only</strong>. 
              Products without "Completed" status do not earn commission. All values are in Kenyan Shillings (KES).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {viewMode === 'local-mrs' && renderLocalMRsView()}
      {viewMode === 'tots' && renderTOTsView()}
    </div>
  );
}

export { CommissionCalculator as Commission };
