import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FarmerApprovalRequest } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';
import { Search, CheckCircle, XCircle, Clock, User, MapPin } from 'lucide-react';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Fallback mock data
const mockFarmerApprovalRequests: FarmerApprovalRequest[] = [
  { 
    id: 'approval-1', 
    farmerData: { 
      name: 'New Test Farmer', 
      phone: '+254711999999', 
      location: { village: 'Test Village', ward: 'Test Ward', subcounty: 'Nakuru East', county: 'Nakuru' }, 
      valueChain: 'Maize', 
      farmerCategory: 'New' 
    }, 
    type: 'add', 
    status: 'pending', 
    requestedBy: 'tot-1', 
    requestedByName: 'Samuel Mwangi', 
    localMrId: 'mr-1', 
    localMrName: 'Nakuru Central MR', 
    createdAt: new Date('2025-06-18') 
  },
];

export function ApprovalRequests() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [requests, setRequests] = useState<FarmerApprovalRequest[]>(mockFarmerApprovalRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<FarmerApprovalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.farmerData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestedByName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const handleApprove = (requestId: string) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, status: 'approved' as const, reviewedBy: user?.id, reviewedAt: new Date() }
        : r
    ));
    const request = requests.find(r => r.id === requestId);
    toast.success('Farmer request approved');
    addNotification({
      title: 'Farmer Approved',
      message: `${request?.farmerData.name} has been approved and added to the system`,
      type: 'farmer',
    });
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    setRequests(prev => prev.map(r => 
      r.id === selectedRequest.id 
        ? { ...r, status: 'rejected' as const, reviewedBy: user?.id, reviewedAt: new Date(), rejectionReason: rejectReason }
        : r
    ));
    toast.info('Farmer request rejected');
    addNotification({
      title: 'Farmer Request Rejected',
      message: `Request for ${selectedRequest.farmerData.name} has been rejected`,
      type: 'farmer',
    });
    setShowRejectDialog(false);
    setSelectedRequest(null);
    setRejectReason('');
  };

  const openRejectDialog = (request: FarmerApprovalRequest) => {
    setSelectedRequest(request);
    setShowRejectDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'add':
        return <Badge variant="forest">New Farmer</Badge>;
      case 'edit':
        return <Badge variant="wheat">Edit Request</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Approval Requests</h1>
          <p className="text-sm text-muted-foreground">Review and approve farmer additions and edits from TOTs</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold font-heading">{pendingCount}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold font-heading text-success">{approvedCount}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold font-heading text-destructive">{rejectedCount}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by farmer name or requester..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="add">New Farmer</SelectItem>
                <SelectItem value="edit">Edit Request</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No approval requests found</p>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} variant="elevated">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeBadge(request.type)}
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{request.farmerData.name}</h3>
                        <p className="text-sm text-muted-foreground">{request.farmerData.phone}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{request.farmerData.location.village}, {request.farmerData.location.subcounty}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Value Chain: </span>
                        <span className="font-medium">{request.farmerData.valueChain}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requested by: </span>
                        <span className="font-medium">{request.requestedByName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date: </span>
                        <span className="font-medium">{formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                    {request.rejectionReason && (
                      <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
                        <p className="text-sm text-destructive">
                          <strong>Rejection Reason:</strong> {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRejectDialog(request)}
                        className="text-destructive hover:text-destructive"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        variant="forest"
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this farmer request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
