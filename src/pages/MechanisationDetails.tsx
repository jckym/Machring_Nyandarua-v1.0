import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, Tractor, User, MapPin, Calendar, Clock, 
  DollarSign, CheckCircle, AlertCircle, FileText
} from 'lucide-react';
import { useMechanisationJob, useCompleteMechanisation, useApproveMechanisation, useRejectMechanisation } from '@/hooks/api/useMechanisation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function MechanisationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const { data: job, isLoading, error } = useMechanisationJob(id || '');
  const completeMutation = useCompleteMechanisation();
  const approveMutation = useApproveMechanisation();
  const rejectMutation = useRejectMechanisation();
  
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completionData, setCompletionData] = useState({
    summary: '',
    duration: '',
    outcome: 'Successful',
  });

  const formatCurrency = (value: number) => `KES ${value?.toLocaleString() || 0}`;
  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'approved': return 'forest';
      case 'pending': case 'pending-approval': return 'warning';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleApprove = () => {
    if (!id) return;
    approveMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Job approved successfully');
      },
    });
  };

  const handleReject = () => {
    if (!id) return;
    rejectMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success('Job rejected');
      },
    });
  };

  const handleComplete = () => {
    if (!id || !completionData.summary) {
      toast.error('Please provide a completion summary');
      return;
    }
    completeMutation.mutate(
      { id, report: completionData },
      {
        onSuccess: () => {
          toast.success('Job marked as completed');
          setShowCompleteDialog(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-4">The mechanisation job could not be loaded.</p>
        <Button variant="outline" onClick={() => navigate('/mechanisation')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Mechanisation
        </Button>
      </div>
    );
  }

  const canMarkComplete = isAdmin && (job.status === 'approved' || job.status === 'in-progress');
  const canApprove = isAdmin && job.status === 'pending';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/mechanisation')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold capitalize">
              {job.service_type} Service
            </h1>
            <p className="text-sm text-muted-foreground">Job ID: {job.id?.slice(0, 8)}...</p>
          </div>
        </div>
        <Badge variant={getStatusColor(job.status) as any} className="text-sm px-4 py-1.5">
          {job.status}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tractor className="w-5 h-5" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Service Type</p>
                <p className="font-medium capitalize">{job.service_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Machinery</p>
                <p className="font-medium">{job.machineryName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Acreage</p>
                <p className="font-medium">{job.area_acres || 0} acres</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price per Acre</p>
                <p className="font-medium">{formatCurrency(job.pricePerAcre || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="font-semibold text-primary">{formatCurrency(job.total_cost || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">TOT Commission</p>
                <p className="font-semibold text-success">{formatCurrency(job.tot_commission || (job.area_acres || 0) * 100)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Farmer & Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Farmer & Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Farmer</p>
                <p className="font-medium">{job.farmerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Local MR</p>
                <p className="font-medium">{job.localMrName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Booked By (TOT)</p>
                <p className="font-medium">{job.totName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Date</p>
                <p className="font-medium">{formatDate(job.scheduled_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(job.created_at)}</p>
              </div>
              {job.completed_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="font-medium">{formatDate(job.completed_at)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completion Report */}
        {job.status === 'completed' && job.completion_notes && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                Completion Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Summary</p>
                  <p className="font-medium">{job.completion_notes}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{job.duration_hours || 0} hours</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed At</p>
                  <p className="font-medium">{job.completed_at ? formatDate(job.completed_at) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {canApprove && (
          <>
            <Button variant="earth" onClick={handleApprove} disabled={approveMutation.isPending}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
              Reject
            </Button>
          </>
        )}
        {canMarkComplete && (
          <Button variant="success" onClick={() => setShowCompleteDialog(true)}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Complete
          </Button>
        )}
      </div>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Mechanisation Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Completion Summary *</Label>
              <Textarea
                value={completionData.summary}
                onChange={(e) => setCompletionData({ ...completionData, summary: e.target.value })}
                placeholder="Describe how the job was completed..."
                rows={3}
              />
            </div>
            <div>
              <Label>Duration (hours)</Label>
              <Input
                type="number"
                value={completionData.duration}
                onChange={(e) => setCompletionData({ ...completionData, duration: e.target.value })}
                placeholder="e.g., 4"
              />
            </div>
            <div>
              <Label>Outcome</Label>
              <Input
                value={completionData.outcome}
                onChange={(e) => setCompletionData({ ...completionData, outcome: e.target.value })}
                placeholder="e.g., Successful"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>Cancel</Button>
            <Button variant="success" onClick={handleComplete} disabled={completeMutation.isPending}>
              {completeMutation.isPending ? 'Completing...' : 'Complete Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
