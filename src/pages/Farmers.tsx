import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { exportFarmersToExcel, exportFarmersToPDF } from '@/lib/exportUtils';
import { FarmerFormDialog } from '@/components/forms/FarmerFormDialog';
import { BulkUploadDialog } from '@/components/bulk-upload/BulkUploadDialog';
import { Farmer } from '@/types';
import { useFarmers, useCreateFarmer, useUpdateFarmer, useLocalMRs } from '@/hooks/api';
import { supabase } from '@/integrations/supabase/client';
import {
  Search,
  Plus,
  MapPin,
  Phone,
  Download,
  Users,
  FileSpreadsheet,
  FileText,
  Star,
  Eye,
  Upload,
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

export function Farmers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAdmin, canEdit } = useAuth();
  const { addNotification } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [localMrFilter, setLocalMrFilter] = useState('all');
  const [valueChainFilter, setValueChainFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);

  // API hooks
  const { data: farmers = [], isLoading } = useFarmers({ 
    search: searchQuery, 
    localMrId: localMrFilter !== 'all' ? localMrFilter : undefined 
  });
  const { data: localMRs = [] } = useLocalMRs();
  const createFarmer = useCreateFarmer();
  const updateFarmer = useUpdateFarmer();

  // Auto-open add modal from Quick Actions (Admin only)
  useEffect(() => {
    if (searchParams.get('add') === 'new' && isAdmin) {
      setIsFormOpen(true);
      searchParams.delete('add');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams, isAdmin]);

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.location.village.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocalMr = localMrFilter === 'all' || farmer.localMrId === localMrFilter;
    const matchesValueChain = valueChainFilter === 'all' || farmer.valueChain === valueChainFilter;
    const matchesRating = ratingFilter === 'all' || farmer.farmerRating === ratingFilter;
    return matchesSearch && matchesLocalMr && matchesValueChain && matchesRating;
  });

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'High-Value': return 'success';
      case 'Active': return 'forest';
      default: return 'warning';
    }
  };

  const handleSubmitFarmer = (data: Partial<Farmer>) => {
    if (!canEdit) {
      toast.error('You do not have permission to add farmers');
      return;
    }
    
    if (editingFarmer) {
      updateFarmer.mutate({ id: editingFarmer.id, data: data as any });
    } else {
      createFarmer.mutate(data as any);
      addNotification({
        title: 'Farmer Added',
        message: `New farmer registered successfully`,
        type: 'farmer',
      });
    }
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
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Farmers</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Manage registered farmers' : 'View registered farmers'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canExport && (
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
          )}
          {/* Admin only: Add Farmer button */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsBulkUploadOpen(true)}>
                <Upload className="w-4 h-4 mr-2" /> Bulk Upload
              </Button>
              <Button variant="forest" size="sm" onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Farmer
              </Button>
            </div>
          )}
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
            {/* Hide Local MR filter for TOTs - they only see their MR farmers via RLS */}
            {user?.role !== 'tot' && (
              <Select value={localMrFilter} onValueChange={setLocalMrFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Local MR" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Local MRs</SelectItem>
                  {localMRs.map(mr => (
                    <SelectItem key={mr.id} value={mr.id}>{mr.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-emerald-600">
                {filteredFarmers.filter(f => f.farmerRating === 'Active').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rating</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Value Chain</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarmers.map((farmer, index) => (
                  <tr 
                    key={farmer.id}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
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
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {farmer.location.village}{farmer.location.ward ? `, ${farmer.location.ward}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getRatingColor(farmer.farmerRating) as any} className="flex items-center gap-1 w-fit">
                        <Star className="w-3 h-3" />
                        {farmer.farmerRating}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{farmer.valueChain}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/farmers/${farmer.id}`)}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        {/* Only Admin can edit farmers */}
                        {isAdmin && (
                          <Button variant="outline" size="sm" onClick={() => {
                            setEditingFarmer(farmer as any);
                            setIsFormOpen(true);
                          }}>
                            Edit
                          </Button>
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

      {/* Farmer Form Dialog - Admin only */}
      {isAdmin && (
        <FarmerFormDialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingFarmer(null);
          }}
          onSubmit={handleSubmitFarmer}
          farmer={editingFarmer}
        />
      )}

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
        entityType="farmers"
        onUpload={async (data) => {
          const farmersToInsert = data.map(row => ({
            name: String(row.name),
            county: 'Nyandarua',
            sub_county: row.sub_county ? String(row.sub_county) : null,
            ward: row.ward ? String(row.ward) : null,
            village: row.village ? String(row.village) : null,
            phone: row.phone ? String(row.phone) : null,
            email: row.email ? String(row.email) : null,
            farming_type: row.farming_type ? String(row.farming_type) : null,
            farm_size: row.farm_size ? Number(row.farm_size) : null,
          }));
          
          const { error } = await supabase.from('farmers').insert(farmersToInsert);
          if (error) throw error;
        }}
      />
    </div>
  );
}
