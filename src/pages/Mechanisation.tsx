import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Tractor, Calendar, Download, MapPin, Clock, FileSpreadsheet, FileText, FileCheck, CheckCircle } from 'lucide-react';
import { exportMechanisationToExcel, exportMechanisationToPDF } from '@/lib/exportUtils';
import { MechanisationFormDialog } from '@/components/forms/MechanisationFormDialog';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MechanisationJob } from '@/types';
import { useMechanisationJobs, useCreateMechanisation, useCompleteMechanisation } from '@/hooks/api';
import { useMechanisationRealtime } from '@/hooks/api/useMechanisationRealtime';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function Mechanisation() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<MechanisationJob | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const { addNotification } = useNotifications();
  const { user, isAdmin, canEdit } = useAuth();

  // Enable realtime updates
  useMechanisationRealtime();

  // API hooks
  const { data: jobs = [], isLoading } = useMechanisationJobs();
  const createMech = useCreateMechanisation();
  const completeMech = useCompleteMechanisation();

  const filteredJobs = jobs.filter(job => {
    const farmerName = job.farmerName ?? '';
    const matchesSearch = farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = jobs.reduce((acc, job) => acc + job.totalPrice, 0);
  const totalAcreage = jobs.reduce((acc, job) => acc + job.acreage, 0);

  const handleAddJob = (data: any) => {
    if (!canEdit) {
      toast.error('You do not have permission to create bookings');
      return;
    }
    createMech.mutate(data);
    addNotification({
      title: 'New Mechanisation Booking',
      message: `Booking created successfully`,
      type: 'mechanisation',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'approved': return 'forest';
      case 'pending-approval': return 'warning';
      case 'rejected': return 'destructive';
      default: return 'warning';
    }
  };

  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  // Manager and Coordinator can export reports
  const canExport = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'local_mr_coordinator';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Mechanisation</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Manage machinery service bookings' : 'View machinery service bookings'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => { exportMechanisationToExcel(filteredJobs); toast.success('Exported to Excel'); }}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { exportMechanisationToPDF(filteredJobs); toast.success('Exported to PDF'); }}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export to PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {/* Admin only: New Booking button */}
          {isAdmin && (
            <Button variant="earth" size="sm" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4" variant="earth">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary-foreground/20 flex items-center justify-center">
              <Tractor className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading">{jobs.length}</p>
              <p className="text-xs sm:text-sm opacity-80">Bookings</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-primary">{totalAcreage}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Acres</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-accent-foreground">
                {jobs.filter(j => j.status === 'pending-approval').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-2xl font-bold font-heading text-emerald-700 truncate">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Revenue</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by farmer or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending-approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filteredJobs.map((job, index) => (
          <Card 
            key={job.id}
            variant="elevated"
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary flex items-center justify-center text-secondary-foreground">
                  <Tractor className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <Badge variant={getStatusColor(job.status) as any} className="text-xs">{job.status}</Badge>
              </div>
              
              <h3 className="font-heading font-semibold capitalize mb-1 text-sm sm:text-base">{job.serviceType}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{job.farmerName}</p>
              
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Acreage:</span>
                  <span className="font-medium">{job.acreage || job.area_acres || 0} acres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price/Acre:</span>
                  <span className="font-medium">{formatCurrency(job.pricePerAcre || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold text-primary">{formatCurrency(job.totalPrice || job.total_cost || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TOT Commission:</span>
                  <span className="font-semibold text-success">{formatCurrency(job.tot_commission || (job.area_acres || 0) * (job.commission_per_acre || 100))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled:</span>
                  <span className="font-medium">{formatDate(job.scheduledDate || job.scheduled_date)}</span>
                </div>
              </div>
              
              {/* Completion Report for completed jobs */}
              {job.status === 'completed' && job.completionReport && (
                <div className="mt-3 p-3 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="w-4 h-4 text-success" />
                    <span className="text-xs font-semibold text-success">Completion Report</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{job.completionReport.summary}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 h-7 text-xs p-0 text-primary"
                    onClick={() => { setSelectedJob(job); setShowReportDialog(true); }}
                  >
                    View Full Report
                  </Button>
                </div>
              )}
              
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs h-8 sm:h-9"
                  onClick={() => navigate(`/mechanisation/${job.id}`)}
                >
                  Details
                </Button>
                {isAdmin && (job.status === 'approved' || job.status === 'in-progress') && (
                  <Button 
                    variant="success" 
                    size="sm" 
                    className="flex-1 text-xs h-8 sm:h-9"
                    onClick={() => completeMech.mutate({ 
                      id: job.id, 
                      report: { summary: 'Job completed', duration: '0', outcome: 'Successful' } 
                    })}
                    disabled={completeMech.isPending}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mechanisation Form Dialog - Admin only */}
      {isAdmin && (
        <MechanisationFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleAddJob}
        />
      )}

      {/* Completion Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-success" />
              Completion Report
            </DialogTitle>
          </DialogHeader>
          {selectedJob?.completionReport && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Summary</h4>
                <p className="text-sm">{selectedJob.completionReport.summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Duration</h4>
                  <p className="text-sm font-medium">{selectedJob.completionReport.duration}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Completed At</h4>
                  <p className="text-sm font-medium">
                    {new Date(selectedJob.completionReport.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Outcome</h4>
                <p className="text-sm">{selectedJob.completionReport.outcome}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
