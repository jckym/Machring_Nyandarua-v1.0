import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockMechanisationJobs } from '@/data/mockData';
import { Search, Plus, Tractor, Calendar, Filter, Download, MapPin, Clock, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import { MechanisationFormDialog } from '@/components/forms/MechanisationFormDialog';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MechanisationJob } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Mechanisation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [jobs, setJobs] = useState(mockMechanisationJobs);
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  const filteredJobs = jobs.filter(job =>
    job.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = jobs.reduce((acc, job) => acc + job.totalPrice, 0);
  const totalAcreage = jobs.reduce((acc, job) => acc + job.acreage, 0);

  const handleAddJob = (data: Partial<MechanisationJob>) => {
    const newJob: MechanisationJob = {
      id: `mech-${Date.now()}`,
      ...data as any,
      status: 'pending-approval',
    };
    setJobs(prev => [...prev, newJob]);
    toast.success('Booking submitted for approval');
    addNotification({
      title: 'New Mechanisation Booking',
      message: `${newJob.serviceType} booking for ${newJob.farmerName} pending approval`,
      type: 'mechanisation',
    });
  };

  const handleApprove = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'approved' as const } : j));
    const job = jobs.find(j => j.id === jobId);
    toast.success('Booking approved');
    addNotification({
      title: 'Booking Approved',
      message: `Mechanisation booking for ${job?.farmerName} has been approved`,
      type: 'mechanisation',
    });
  };

  const handleReject = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'rejected' as const } : j));
    toast.info('Booking rejected');
  };

  const handleComplete = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'completed' as const } : j));
    const job = jobs.find(j => j.id === jobId);
    toast.success('Job marked as completed');
    addNotification({
      title: 'Mechanisation Completed',
      message: `Job for ${job?.farmerName} completed. Commission awarded.`,
      type: 'commission',
    });
  };

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'approved':
        return 'forest';
      case 'pending-approval':
        return 'warning';
      case 'rejected':
        return 'destructive';
      default:
        return 'warning';
    }
  };

  const formatCurrency = (value: number) => {
    return `KES ${value.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Mechanisation</h1>
          <p className="text-sm text-muted-foreground">Track machinery service bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="earth" size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
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
              <p className="text-lg sm:text-2xl font-bold font-heading">{mockMechanisationJobs.length}</p>
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
                {mockMechanisationJobs.filter(j => j.status === 'pending-approval').length}
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
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
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
                  <span className="font-medium">{job.acreage} acres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price/Acre:</span>
                  <span className="font-medium">{formatCurrency(job.pricePerAcre)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold text-primary">{formatCurrency(job.totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled:</span>
                  <span className="font-medium">{formatDate(job.scheduledDate)}</span>
                </div>
              </div>
              
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8 sm:h-9">Details</Button>
                {job.status === 'pending-approval' && isManager && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="forest" size="sm" className="flex-1 text-xs h-8 sm:h-9">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleApprove(job.id)}>
                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReject(job.id)}>
                        <XCircle className="w-4 h-4 mr-2 text-red-600" />
                        Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {job.status === 'approved' && isManager && (
                  <Button variant="forest" size="sm" className="flex-1 text-xs h-8 sm:h-9" onClick={() => handleComplete(job.id)}>
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mechanisation Form Dialog */}
      <MechanisationFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddJob}
      />
    </div>
  );
}
