import { useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
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
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  Calculator,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalMRs, useUsers, useSales } from '@/hooks/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

/* ---------------- TYPES ---------------- */
type ViewMode = 'local-mrs' | 'tots';
interface LocalMRSummary {
  id: string;
  name: string;
  manager: string;
  totalTots: number;
  activeTots: number;
  totalSales: number;
  totalCommission: number;
}
interface TOTSummary {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  totalSales: number;
  totalCommission: number;
}
/* ---------------- COMPONENT ---------------- */
export function Commission() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('local-mrs');
  const [selectedMrId, setSelectedMrId] = useState<string | null>(null);
  const [selectedMrName, setSelectedMrName] = useState<string | null>(null);
  const { data: localMRs = [] } = useLocalMRs();
  const { data: users = [] } = useUsers();
  const { data: sales = [] } = useSales({ status: 'completed' });
  /* ---------------- HELPERS ---------------- */
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(v);
  const completedSales = useMemo(
    () => sales.filter((s: any) => s.status === 'completed'),
    [sales]
  );
  /* ---------------- GROUPED SALES ---------------- */
  const salesByMr = useMemo(() => completedSales.reduce((acc: any, s: any) => {
    if (!acc[s.localMrId]) acc[s.localMrId] = [];
    acc[s.localMrId].push(s);
    return acc;
  }, {}), [completedSales]);
  const salesByTot = useMemo(() => completedSales.reduce((acc: any, s: any) => {
    if (!acc[s.totId]) acc[s.totId] = [];
    acc[s.totId].push(s);
    return acc;
  }, {}), [completedSales]);
  /* ---------------- LOCAL MR AGGREGATION ---------------- */
  const localMRSummaries: LocalMRSummary[] = useMemo(() => {
    return localMRs.map((mr: any) => {
      const tots = users.filter(
        (u: any) => u.role === 'tot' && u.localMrId === mr.id
      );
      const mrSales = salesByMr[mr.id] || [];
      return {
        id: mr.id,
        name: mr.name,
        manager: mr.managerName || 'Manager',
        totalTots: tots.length,
        activeTots: tots.filter((t: any) => t.status === 'active').length,
        totalSales: mrSales.reduce(
          (acc: number, s: any) => acc + s.total,
          0
        ),
        totalCommission: mrSales.reduce(
          (acc: number, s: any) => acc + s.commissionAmount,
          0
        ),
      };
    });
  }, [localMRs, users, salesByMr]);
  /* ---------------- TOT AGGREGATION ---------------- */
  const selectedMRTots: TOTSummary[] = useMemo(() => {
    if (!selectedMrId) return [];
    return users
      .filter(
        (u: any) => u.role === 'tot' && u.localMrId === selectedMrId
      )
      .map((tot: any) => {
        const totSales = salesByTot[tot.id] || [];
        return {
          id: tot.id,
          name: tot.name,
          status: tot.status === 'active' ? 'active' : 'inactive',
          totalSales: totSales.reduce(
            (acc: number, s: any) => acc + s.total,
            0
          ),
          totalCommission: totSales.reduce(
            (acc: number, s: any) => acc + s.commissionAmount,
            0
          ),
        };
      });
  }, [selectedMrId, users, salesByTot]);
  /* ---------------- TOTALS ---------------- */
  const totals = useMemo(() => ({
    sales: localMRSummaries.reduce((a, b) => a + b.totalSales, 0),
    commission: localMRSummaries.reduce((a, b) => a + b.totalCommission, 0),
    activeTots: localMRSummaries.reduce((a, b) => a + b.activeTots, 0),
  }), [localMRSummaries]);
  /* ---------------- EXPORTS ---------------- */
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(localMRSummaries);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Commission Report');
    XLSX.writeFile(wb, 'commission_report.xlsx');
    toast.success('Excel report downloaded');
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('COMMISSION REPORT', 10, 10);
    localMRSummaries.forEach((mr, i) => {
      doc.text(`${mr.name} - Manager: ${mr.manager}`, 10, 20 + i * 10);
      doc.text(`Sales: ${formatCurrency(mr.totalSales)}`, 10, 30 + i * 10);
      doc.text(`Commission: ${formatCurrency(mr.totalCommission)}`, 10, 40 + i * 10);
    });
    doc.save('commission_report.pdf');
    toast.success('PDF report downloaded');
  };
  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {viewMode === 'tots' && (
            <Button
              variant="ghost"
              onClick={() => {
                setViewMode('local-mrs');
                setSelectedMrId(null);
              }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Commission Overview
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={exportExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>
      {/* STATS */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Local MRs</p>
            <p className="text-2xl font-bold">{localMRSummaries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active TOTs</p>
            <p className="text-2xl font-bold">{totals.activeTots}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.sales)}</p>
          </CardContent>
        </Card>
        <Card variant="forest">
          <CardContent className="p-4">
            <p className="text-sm opacity-80">Commission</p>
            <p className="text-2xl font-bold">
              {formatCurrency(totals.commission)}
            </p>
          </CardContent>
        </Card>
      </div>
      {/* TABLE */}
      {viewMode === 'local-mrs' && (
        <Card>
          <CardHeader>
            <CardTitle>Local MR Commission Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Local MR</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localMRSummaries.map(mr => (
                  <TableRow
                    key={mr.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedMrId(mr.id);
                      setSelectedMrName(mr.name);
                      setViewMode('tots');
                    }}
                  >
                    <TableCell>{mr.name}</TableCell>
                    <TableCell>{mr.manager}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(mr.totalSales)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatCurrency(mr.totalCommission)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {viewMode === 'tots' && (
        <Card>
          <CardHeader>
            <CardTitle>TOTs in {selectedMrName}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedMRTots.map(tot => (
                  <TableRow key={tot.id}>
                    <TableCell>{tot.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tot.status === 'active' ? 'success' : 'secondary'}
                      >
                        {tot.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(tot.totalSales)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatCurrency(tot.totalCommission)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
