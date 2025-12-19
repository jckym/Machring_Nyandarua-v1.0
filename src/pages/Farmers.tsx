import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockFarmers, mockLocalMRs } from '@/data/mockData';
import {
  Search,
  Plus,
  MapPin,
  Phone,
  MoreVertical,
  Download,
  Users,
  FileSpreadsheet,
  Star,
  FileText,
  Send
} from 'lucide-react';
import { exportFarmersToExcel, exportFarmersToPDF } from '@/lib/exportUtils';
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
import { FarmerFormDialog } from '@/components/forms/FarmerFormDialog';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';
import { Farmer } from '@/types';

export function Farmers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [valueChainFilter, setValueChainFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [farmers, setFarmers] = useState(mockFarmers);

  const { addNotification } = useNotifications();

  // Auto open add farmer
  useEffect(() => {
    if (searchParams.get('add') === 'new') {
      setIsFormOpen(true);
      searchParams.delete('add');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const filteredFarmers = farmers.filter(farmer => {
    return (
      farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (branchFilter === 'all' || farmer.localMrId === branchFilter) &&
      (valueChainFilter === 'all' || farmer.valueChain === valueChainFilter) &&
      (ratingFilter === 'all' || farmer.farmerRating === ratingFilter)
    );
  });

  const getRatingColor = (rating: string) => {
    if (rating === 'High-Value') return 'success';
    if (rating === 'Active') return 'forest';
    return 'warning';
  };

  // ✅ ADD FARMER (Allowed)
  const handleAddFarmer = (data: Partial<Farmer>) => {
    const newFarmer: Farmer = {
      id: `farmer-${Date.now()}`,
      ...data as Farmer,
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
      message: `${newFarmer.name} was registered by a TOT`,
      type: 'farmer',
    });
  };

  // ❌ DIRECT EDIT BLOCKED → REQUEST INSTEAD
  const requestEditApproval = (farmer: Farmer) => {
    addNotification({
      title: 'Farmer Edit Request',
      message: `Edit request submitted for ${farmer.name}`,
      type: 'approval',
    });

    toast.info('Edit request sent to Admin for approval');
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    if (!filteredFarmers.length) {
      toast.error('No farmers to export');
      return;
    }
    format === 'excel'
      ? exportFarmersToExcel(filteredFarmers, 'farmers')
      : exportFarmersToPDF(filteredFarmers, 'farmers');

    toast.success(`Exported ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Farmers</h1>
          <p className="text-muted-foreground">Manage registered farmers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Farmer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="grid sm:grid-cols-4 gap-3 p-4">
          <Input
            placeholder="Search farmers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger><SelectValue placeholder="Local MR" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All MRs</SelectItem>
              {mockLocalMRs.map(mr => (
                <SelectItem key={mr.id} value={mr.id}>{mr.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={valueChainFilter} onValueChange={setValueChainFilter}>
            <SelectTrigger><SelectValue placeholder="Value Chain" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chains</SelectItem>
              <SelectItem value="Crops">Crops</SelectItem>
              <SelectItem value="Livestock">Livestock</SelectItem>
              <SelectItem value="Dairy">Dairy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger><SelectValue placeholder="Rating" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="High-Value">High-Value</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Dormant">Dormant</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Farmer List */}
      <Card>
        <CardHeader>
          <CardTitle>Farmers ({filteredFarmers.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredFarmers.map(farmer => (
            <div key={farmer.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{farmer.name}</p>
                <p className="text-sm text-muted-foreground">{farmer.phone}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={getRatingColor(farmer.farmerRating) as any}>
                  <Star className="w-3 h-3 mr-1" /> {farmer.farmerRating}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/farmers/${farmer.id}`)}>
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/sales/new?farmerId=${farmer.id}`)}>
                      Record Sale
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/mechanisation/new?farmerId=${farmer.id}`)}>
                      Book Service
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/visits/new?farmerId=${farmer.id}`)}>
                      Log Visit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => requestEditApproval(farmer)}>
                      <Send className="w-4 h-4 mr-2" /> Request Edit Approval
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Farmer Form */}
      <FarmerFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddFarmer}
        farmer={editingFarmer || undefined}
        scrollable
      />
    </div>
  );
}
