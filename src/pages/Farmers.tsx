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

interface PendingFarmer {
  id: string;
  data: Partial<Farmer>;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
}

interface PendingEdit {
  id: string;
  farmerId: string;
  requestedBy: string;
  changes: Partial<Farmer>;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
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
  const [pendingFarmers, setPendingFarmers] = useState<PendingFarmer[]>([]);
  const [pendingEdits, setPendingEdits] = useState<PendingEdit[]>([]);

  // Auto-open modal from Quick Actions (?add=new)
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
      case 'Pioneer':
        return 'wheat';
      case 'Existing':
        return 'forest';
      default:
        return 'sage';
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'High-Value':
        return 'success';
      case 'Active':
        return 'forest';
      default:
        return 'warning';
    }
  };

  // Handle Add Farmer (with approval for TOTs)
  const handleAddFarmer = (data: Partial<Farmer>) => {
    if (user?.role === 'manager' || user?.role === 'admin') {
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
      addNotification({
        title: 'New Farmer Registered',
        message: `${newFarmer.name} has been registered directly by ${user?.name}`,
        type: 'farmer',
      });
    } else {
      const pending: PendingFarmer = {
        id: `pending-farmer-${Date.now()}`,
        data,
        requestedBy: user?.name || 'TOT',
        requestedAt: new Date(),
        status: 'pending',
      };
      setPendingFarmers(prev => [...prev, pending]);
      toast.success('New farmer registration sent for approval');
      addNotification({
        title: 'Pending Farmer Registration',
        message: `${user?.name} submitted ${data.name} for approval`,
        type: 'approval',
      });
    }
  };

  // Handle Edit Farmer (with approval for TOTs)
  const handleEditFarmer = (data: Partial<Farmer>) => {
    if (!editingFarmer) return;

    if (user?.role === 'manager' || user?.role === 'admin') {
      setFarmers(prev => prev.map(f => f.id === editingFarmer.id ? { ...f, ...data } : f));
      setEditingFarmer(null);
      toast.success('Farmer updated successfully');
    } else {
      const newPending: PendingEdit = {
        id: `pending-edit-${Date.now()}`,
        farmerId: editingFarmer.id,
        requestedBy: user?.name || 'TOT',
        changes: data,
        status: 'pending',
        requestedAt: new Date(),
      };
      setPendingEdits(prev => [...prev, newPending]);
      setEditingFarmer(null);
      toast.success('Edit request sent for manager approval');
      addNotification({
        title: 'Farmer Edit Request',
        message: `${user?.name} requested changes to ${editingFarmer.name}`,
        type: 'approval',
      });
    }
  };

  // Approval functions
  const approveFarmer = (pendingId: string) => {
    const pending = pendingFarmers.find(p => p.id === pendingId);
    if (!pending) return;

    const newFarmer: Farmer = {
      id: `farmer-${Date.now()}`,
      ...pending.data as any,
      registrationDate: new Date(),
      farmerRating: 'Active',
      totalPurchases: 0,
      mechanisationCount: 0,
      trainingsAttended: 0,
      visitsCount: 0,
    };

    setFarmers(prev => [...prev, newFarmer]);
    setPendingFarmers(prev => prev.map(p =>
      p.id === pendingId ? { ...p, status: 'approved', reviewedBy: user?.name, reviewedAt: new Date() } : p
    ));
    toast.success('New farmer approved and added');
  };

  const rejectFarmer = (pendingId: string) => {
    setPendingFarmers(prev => prev.map(p =>
      p.id === pendingId ? { ...p, status: 'rejected', reviewedBy: user?.name, reviewedAt: new Date() } : p
    ));
    toast.success('Registration request rejected');
  };

  const approveEdit = (pendingId: string) => {
    const pending = pendingEdits.find(p => p.id === pendingId);
    if (!pending) return;

    setFarmers(prev => prev.map(f =>
      f.id === pending.farmerId ? { ...f, ...pending.changes } : f
    ));

    setPendingEdits(prev => prev.map(p =>
      p.id === pendingId ? { ...p, status: 'approved', reviewedBy: user?.name, reviewedAt: new Date() } : p
    ));
    toast.success('Edit approved and applied');
  };

  const rejectEdit = (pendingId: string) => {
    setPendingEdits(prev => prev.map(p =>
      p.id === pendingId ? { ...p, status: 'rejected', reviewedBy: user?.name, reviewedAt: new Date() } : p
    ));
    toast.success('Edit request rejected');
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    if (filteredFarmers.length === 0) {
      toast.error('No farmers to export');
      return;
    }
    try {
      if (format === 'excel') {
        exportFarmersToExcel(filteredFarmers, 'farmers_export');
      } else {
        exportFarmersToPDF(filteredFarmers, 'farmers_export');
      }
      toast.success(`Exported ${filteredFarmers.length} farmers to ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export: ${error}`);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Farmers</h1>
          <p className="text-sm text-muted-foreground">Manage your registered farmers</p>
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
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="w-4 h-4 mr-2" />
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="forest" size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Farmer
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search farmers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {mockBranches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={valueChainFilter} onValueChange={setValueChainFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Value Chain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chains</SelectItem>
                  <SelectItem value="Crops">Crops</SelectItem>
                  <SelectItem value="Livestock">Livestock</SelectItem>
                  <SelectItem value="Poultry">Poultry</SelectItem>
                  <SelectItem value="Dairy">Dairy</SelectItem>
                  <SelectItem value="Horticulture">Horticulture</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[140px] h-9">
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
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-primary">{mockFarmers.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-sage/30 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-sage" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-accent-foreground">
                {mockFarmers.filter(f => f.farmerCategory === 'New').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">New</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-secondary">
                {mockFarmers.filter(f => f.farmerCategory === 'Existing').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Existing</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-forest" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-forest">
                {mockFarmers.filter(f => f.farmerCategory === 'Pioneer').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Pioneer</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending New Farmer Registrations (Manager/Admin only) */}
      {(user?.role === 'manager' || user?.role === 'admin') && pendingFarmers.filter(p => p.status === 'pending').length > 0 && (
        <Card className="mt-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
              <Clock className="w-5 h-5" />
              Pending Farmer Registrations ({pendingFarmers.filter(p => p.status === 'pending').length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingFarmers.filter(p => p.status === 'pending').map(pending => (
              <div key={pending.id} className="p-4 border rounded-lg bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-lg">{(pending.data as any).name}</p>
                    <p className="text-sm text-muted-foreground">
                      Submitted by {pending.requestedBy} on {new Date(pending.requestedAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm mt-1">
                      Phone: {(pending.data as any).phone} | Location: {(pending.data as any).location?.village}, {(pending.data as any).location?.county}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => rejectFarmer(pending.id)}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => approveFarmer(pending.id)}>
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Farmer Edits (Manager/Admin only) */}
      {(user?.role === 'manager' || user?.role === 'admin') && pendingEdits.filter(p => p.status === 'pending').length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Farmer Edit Requests ({pendingEdits.filter(p => p.status === 'pending').length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingEdits.filter(p => p.status === 'pending').map(pending => {
              const farmer = farmers.find(f => f.id === pending.farmerId);
              return (
                <div key={pending.id} className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{farmer?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Requested by {pending.requestedBy} on {new Date(pending.requestedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-2">
                        Changes: {Object.keys(pending.changes).join(', ')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => rejectEdit(pending.id)}>
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => approveEdit(pending.id)}>
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Farmers List */}
      <Card variant="elevated">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">All Farmers ({filteredFarmers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="space-y-3">
            {filteredFarmers.map((farmer, index) => (
              <div
                key={farmer.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-fade-in gap-3 sm:gap-4"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0 text-sm sm:text-base">
                    {farmer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm sm:text-base">{farmer.name}</p>
                      <Badge variant={getCategoryColor(farmer.farmerCategory) as any} className="text-xs">
                        {farmer.farmerCategory}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                      <span className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {farmer.location.village}, {farmer.location.county}
                      </span>
                      <span className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {farmer.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Badge variant={getRatingColor(farmer.farmerRating) as any} className="text-xs flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {farmer.farmerRating}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/farmers/${farmer.id}`)}>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Record Sale</DropdownMenuItem>
                      <DropdownMenuItem>Book Service</DropdownMenuItem>
                      <DropdownMenuItem>Log Visit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setEditingFarmer(farmer); setIsFormOpen(true); }}>
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Farmer Form Dialog */}
      <FarmerFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingFarmer(null);
        }}
        onSubmit={editingFarmer ? handleEditFarmer : handleAddFarmer}
        farmer={editingFarmer || undefined}
      />
    </div>
  );
}
