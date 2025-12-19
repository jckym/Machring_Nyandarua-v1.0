import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { mockFarmers, mockLocalMRs } from '@/data/mockData';
import { exportFarmersToExcel, exportFarmersToPDF } from '@/lib/exportUtils';
import { FarmerFormDialog } from '@/components/forms/FarmerFormDialog';
import { Farmer } from '@/types';
import {
  Search,
  Plus,
  MapPin,
  Phone,
  MoreVertical,
  Download,
  Users,
  FileSpreadsheet,
  FileText,
  Star,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
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

interface PendingRequest {
  id: string;
  type: 'add' | 'edit';
  farmerId?: string; // for edits
  data: Partial<Farmer>;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
}

export function Farmers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [localMrFilter, setLocalMrFilter] = useState('all');
  const [valueChainFilter, setValueChainFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [farmers, setFarmers] = useState(mockFarmers);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [previewRequest, setPreviewRequest] = useState<PendingRequest | null>(null);

  // Auto-open add modal from Quick Actions
  useEffect(() => {
    if (searchParams.get('add') === 'new') {
      setIsFormOpen(true);
      searchParams.delete('add');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.location.village.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocalMr = localMrFilter === 'all' || farmer.localMrId === localMrFilter;
    const matchesValueChain = valueChainFilter === 'all' || farmer.valueChain === valueChainFilter;
    const matchesRating = ratingFilter === 'all' || farmer.farmerRating === ratingFilter;
    return matchesSearch && matchesLocalMr && matchesValueChain && matchesRating;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Pioneer': return 'wheat';
      case 'Existing': return 'forest';
      default: return 'sage';
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'High-Value': return 'success';
      case 'Active': return 'forest';
      default: return 'warning';
    }
  };

  // Unified handler for both add and edit (with approval)
  const handleSubmitRequest = (data: Partial<Farmer>, type: 'add' | 'edit', originalFarmer?: Farmer) => {
    if (user?.role === 'manager' || user?.role === 'admin') {
      if (type === 'add') {
        const newFarmer: Farmer = {
          id: `farmer-${Date.now()}`,
          ...data as any,
          createdAt: new Date(),
          farmerRating: 'Active',
          totalPurchases: 0,
          mechanisationCount: 0,
          trainingsAttended: 0,
          visitsCount: 0,
        };
        setFarmers(prev => [...prev, newFarmer]);
        toast.success('Farmer added successfully');
      } else if (type === 'edit' && originalFarmer) {
        setFarmers(prev => prev.map(f => f.id === originalFarmer.id ? { ...f, ...data } : f));
        toast.success('Farmer updated successfully');
      }
    } else {
      // TOT: Create pending request
      const request: PendingRequest = {
        id: `req-${Date.now()}`,
        type,
        farmerId: originalFarmer?.id,
        data,
        requestedBy: user?.name || 'TOT',
        requestedAt: new Date(),
        status: 'pending',
      };
      setPendingRequests(prev => [...prev, request]);

      const action = type === 'add' ? 'New farmer registration' : 'Edit request';
      toast.success(`${action} sent for approval`);

      // Notify managers/admins
      addNotification({
        title: 'Pending Approval Required',
        message: `${user?.name} submitted a ${type === 'add' ? 'new farmer' : 'farmer edit'} request`,
        type: 'farmer',
      });
    }
  };

  // Approval actions
  const approveRequest = (reqId: string) => {
    const req = pendingRequests.find(r => r.id === reqId);
    if (!req) return;

    if (req.type === 'add') {
      const newFarmer: Farmer = {
        id: `farmer-${Date.now()}`,
        ...req.data as any,
        createdAt: new Date(),
        farmerRating: 'Active',
        totalPurchases: 0,
        mechanisationCount: 0,
        trainingsAttended: 0,
        visitsCount: 0,
      };
      setFarmers(prev => [...prev, newFarmer]);
    } else if (req.type === 'edit' && req.farmerId) {
      setFarmers(prev => prev.map(f => f.id === req.farmerId ? { ...f, ...req.data } : f));
    }

    setPendingRequests(prev => prev.map(r =>
      r.id === reqId ? { ...r, status: 'approved', reviewedBy: user?.name, reviewedAt: new Date() } : r
    ));
    toast.success('Request approved');
  };

  const rejectRequest = (reqId: string) => {
    setPendingRequests(prev => prev.map(r =>
      r.id === reqId ? { ...r, status: 'rejected', reviewedBy: user?.name, reviewedAt: new Date() } : r
    ));
    toast.success('Request rejected');
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    if (filteredFarmers.length === 0) {
      toast.error('No farmers to export');
      return;
    }
    try {
      if (format === 'excel') exportFarmersToExcel(filteredFarmers, 'farmers_export');
      else exportFarmersToPDF(filteredFarmers, 'farmers_export');
      toast.success(`Exported ${filteredFarmers.length} farmers to ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export: ${error}`);
    }
  };

  const pendingToReview = pendingRequests.filter(r => r.status === 'pending');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Farmers</h1>
          <p className="text-sm text-muted-foreground">Manage your registered farmers</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="w-4 h-4 mr-2" /> Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="forest" size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Farmer
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={localMrFilter} onValueChange={setLocalMrFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Local MR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Local MRs</SelectItem>
                {mockLocalMRs.map(mr => (
                  <SelectItem key={mr.id} value={mr.id}>{mr.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="High-Value">High-Value</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Dormant">Dormant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests Table (Manager/Admin only) */}
      {(user?.role === 'manager' || user?.role === 'admin') && pendingToReview.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
              <Clock className="w-5 h-5" />
              Pending Requests ({pendingToReview.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Farmer</th>
                    <th className="text-left py-3 px-4">Requested By</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingToReview.map(req => {
                    const farmerName = req.type === 'add'
                      ? (req.data as any).name || 'New Farmer'
                      : farmers.find(f => f.id === req.farmerId)?.name || 'Unknown';

                    return (
                      <tr key={req.id} className="border-b hover:bg-orange-50">
                        <td className="py-3 px-4">
                          <Badge variant={req.type === 'add' ? 'default' : 'secondary'}>
                            {req.type === 'add' ? 'New Registration' : 'Edit'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">{farmerName}</td>
                        <td className="py-3 px-4">{req.requestedBy}</td>
                        <td className="py-3 px-4">{formatDate(req.requestedAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setPreviewRequest(req)}>
                              <Eye className="w-4 h-4" /> View
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => rejectRequest(req.id)}>
                              <XCircle className="w-4 h-4" /> Reject
                            </Button>
                            <Button size="sm" onClick={() => approveRequest(req.id)}>
                              <CheckCircle className="w-4 h-4" /> Approve
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4" variant="forest">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading">{filteredFarmers.length}</p>
              <p className="text-xs sm:text-sm opacity-80">Total Farmers</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-primary">
                {filteredFarmers.filter(f => f.farmerRating === 'High-Value').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">High-Value</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-secondary">
                {filteredFarmers.filter(f => f.farmerCategory === 'Pioneer').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Pioneers</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-orange-600">{pendingToReview.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Farmers List */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg">All Farmers ({filteredFarmers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Farmer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Value Chain</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Rating</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarmers.map((farmer, index) => (
                  <tr 
                    key={farmer.id}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 0.03}s` }}
                    onClick={() => navigate(`/farmers/${farmer.id}`)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {farmer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{farmer.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {farmer.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {farmer.location.village}, {farmer.location.county}
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <Badge variant="outline">{farmer.valueChain}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getCategoryColor(farmer.farmerCategory) as any}>
                        {farmer.farmerCategory}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <Badge variant={getRatingColor(farmer.farmerRating) as any} className="flex items-center gap-1 w-fit">
                        <Star className="w-3 h-3" />
                        {farmer.farmerRating}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/farmers/${farmer.id}`); }}>
                            <Eye className="w-4 h-4 mr-2" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditingFarmer(farmer); 
                            setIsFormOpen(true); 
                          }}>
                            Edit Farmer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredFarmers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No farmers found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Dialogs */}
      <FarmerFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingFarmer(null);
        }}
        onSubmit={(data) => {
          if (editingFarmer) {
            handleSubmitRequest(data, 'edit', editingFarmer);
          } else {
            handleSubmitRequest(data, 'add');
          }
          setIsFormOpen(false);
        }}
        farmer={editingFarmer || undefined}
      />

      {/* Preview Dialog */}
      <Dialog open={!!previewRequest} onOpenChange={() => setPreviewRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Preview {previewRequest?.type === 'add' ? 'New Registration' : 'Edit Request'}
            </DialogTitle>
          </DialogHeader>
          {previewRequest && (
            <div className="space-y-4">
              <p><strong>Requested by:</strong> {previewRequest.requestedBy}</p>
              <p><strong>Date:</strong> {formatDate(previewRequest.requestedAt)}</p>
              {previewRequest.type === 'edit' && previewRequest.farmerId && (
                <p><strong>Affected Farmer:</strong> {farmers.find(f => f.id === previewRequest.farmerId)?.name}</p>
              )}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Submitted Data:</h4>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(previewRequest.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
