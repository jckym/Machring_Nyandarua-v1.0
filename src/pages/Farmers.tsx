import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { mockFarmers, mockBranches } from '@/data/mockData';
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
  const [branchFilter, setBranchFilter] = useState('all');
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
    const matchesBranch = branchFilter === 'all' || farmer.branchId === branchFilter;
    const matchesValueChain = valueChainFilter === 'all' || farmer.valueChain === valueChainFilter;
    const matchesRating = ratingFilter === 'all' || farmer.farmerRating === ratingFilter;
    return matchesSearch && matchesBranch && matchesValueChain && matchesRating;
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
          registrationDate: new Date(),
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
        type: 'approval',
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
        registrationDate: new Date(),
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
      {/* ... (keep your existing search/filter card unchanged) ... */}

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
                        <td className="py-3 px-4">{new Date(req.requestedAt).toLocaleDateString()}</td>
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

      {/* Main Farmers List */}
      {/* ... (keep your existing stats cards and farmers list unchanged) ... */}

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
        <DialogHeader>
          <DialogTitle>
            Preview {previewRequest?.type === 'add' ? 'New Registration' : 'Edit Request'}
          </DialogTitle>
        </DialogHeader>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {previewRequest && (
            <div className="space-y-4">
              <p><strong>Requested by:</strong> {previewRequest.requestedBy}</p>
              <p><strong>Date:</strong> {new Date(previewRequest.requestedAt).toLocaleString()}</p>
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
