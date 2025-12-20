import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { Search, Plus, MoreHorizontal, Building2, Users, MapPin, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalMRs, useCreateLocalMR, useUpdateLocalMR, useApiWithFallback } from '@/hooks/api';
import { LocalMR } from '@/types';

// Fallback mock data
const mockLocalMRs: LocalMR[] = [
  { id: 'mr-1', name: 'Nakuru Central MR', code: 'NK-001', subcounty: 'Nakuru East', ward: 'Bahati', managerId: 'mgr-1', managerName: 'John Kamau', totalTots: 5, totalFarmers: 120 },
  { id: 'mr-2', name: 'Nyeri Highland MR', code: 'NY-001', subcounty: 'Nyeri Central', ward: 'Ruring\'u', managerId: 'mgr-2', managerName: 'Mary Wanjiku', totalTots: 4, totalFarmers: 95 },
  { id: 'mr-3', name: 'Eldoret Valley MR', code: 'EL-001', subcounty: 'Eldoret East', ward: 'Pioneer', managerId: 'mgr-3', managerName: 'Peter Kipkoech', totalTots: 6, totalFarmers: 150 },
  { id: 'mr-4', name: 'Meru Highlands MR', code: 'MR-001', subcounty: 'Meru Central', ward: 'Municipality', managerId: 'mgr-4', managerName: 'Grace Muthoni', totalTots: 3, totalFarmers: 80 },
  { id: 'mr-5', name: 'Kisumu Lakeside MR', code: 'KS-001', subcounty: 'Kisumu Central', ward: 'Milimani', managerId: 'mgr-5', managerName: 'James Odhiambo', totalTots: 5, totalFarmers: 110 },
  { id: 'mr-6', name: 'Nanyuki Plateau MR', code: 'NN-001', subcounty: 'Laikipia East', ward: 'Nanyuki', managerId: 'mgr-6', managerName: 'Sarah Njeri', totalTots: 4, totalFarmers: 75 },
  { id: 'mr-7', name: 'Kitale Western MR', code: 'KT-001', subcounty: 'Kitale', ward: 'Milimani', managerId: 'mgr-7', managerName: 'David Wekesa', totalTots: 5, totalFarmers: 130 },
  { id: 'mr-8', name: 'Narok Mara MR', code: 'NR-001', subcounty: 'Narok North', ward: 'Narok Town', managerId: 'mgr-8', managerName: 'Joseph Sankok', totalTots: 3, totalFarmers: 65 },
  { id: 'mr-9', name: 'Machakos Valley MR', code: 'MC-001', subcounty: 'Machakos Central', ward: 'Machakos Town', managerId: 'mgr-9', managerName: 'Ruth Mwikali', totalTots: 4, totalFarmers: 90 },
  { id: 'mr-10', name: 'Kericho Tea Belt MR', code: 'KC-001', subcounty: 'Kericho Central', ward: 'Kericho Town', managerId: 'mgr-10', managerName: 'Moses Langat', totalTots: 4, totalFarmers: 100 },
];

export function LocalMRs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [subcountyFilter, setSubcountyFilter] = useState('all');
  const [wardFilter, setWardFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMR, setSelectedMR] = useState<LocalMR | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    subcounty: '',
    ward: '',
    managerName: '',
  });

  // Fetch data with fallback
  const localMRsQuery = useLocalMRs();
  const { data: localMRs, isUsingFallback } = useApiWithFallback(localMRsQuery, mockLocalMRs);
  
  const createMutation = useCreateLocalMR();
  const updateMutation = useUpdateLocalMR();

  const subcounties = [...new Set(localMRs.map((mr: LocalMR) => mr.subcounty))];
  const wards = [...new Set(localMRs.map((mr: LocalMR) => mr.ward))];

  const filteredMRs = localMRs.filter((mr: LocalMR) => {
    const matchesSearch = mr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mr.subcounty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mr.ward.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubcounty = subcountyFilter === 'all' || mr.subcounty === subcountyFilter;
    const matchesWard = wardFilter === 'all' || mr.ward === wardFilter;
    return matchesSearch && matchesSubcounty && matchesWard;
  });

  const resetForm = () => {
    setFormData({ name: '', code: '', subcounty: '', ward: '', managerName: '' });
  };

  const handleAddMR = () => {
    if (!formData.name || !formData.code || !formData.subcounty || !formData.ward) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isUsingFallback) {
      // If using fallback, just show success and close
      toast.success('Local MR added successfully (demo mode)');
      setIsAddDialogOpen(false);
      resetForm();
      return;
    }

    createMutation.mutate({
      name: formData.name,
      code: formData.code,
      subcounty: formData.subcounty,
      ward: formData.ward,
      managerId: '',
    }, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        resetForm();
      }
    });
  };

  const handleEditMR = (mr: LocalMR) => {
    setSelectedMR(mr);
    setFormData({
      name: mr.name,
      code: mr.code,
      subcounty: mr.subcounty,
      ward: mr.ward,
      managerName: mr.managerName,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMR = () => {
    if (!selectedMR) return;

    if (isUsingFallback) {
      toast.success('Local MR updated successfully (demo mode)');
      setIsEditDialogOpen(false);
      setSelectedMR(null);
      resetForm();
      return;
    }

    updateMutation.mutate({
      id: selectedMR.id,
      data: {
        name: formData.name,
        code: formData.code,
        subcounty: formData.subcounty,
        ward: formData.ward,
      }
    }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedMR(null);
        resetForm();
      }
    });
  };

  const handleViewDetails = (mrId: string) => {
    navigate(`/local-mrs/${mrId}`);
  };

  // Stats
  const totalMRs = localMRs.length;
  const totalFarmers = localMRs.reduce((sum: number, mr: LocalMR) => sum + mr.totalFarmers, 0);
  const totalTOTs = localMRs.reduce((sum: number, mr: LocalMR) => sum + mr.totalTots, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Local MR Management</h1>
          <p className="text-muted-foreground">Manage the 10 Local Machinery Rings across Kenya</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Local MR
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Local MRs</p>
              <p className="text-2xl font-bold">{totalMRs}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-500/10 p-3">
              <MapPin className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subcounties</p>
              <p className="text-2xl font-bold">{subcounties.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-blue-500/10 p-3">
              <UserCog className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total TOTs</p>
              <p className="text-2xl font-bold">{totalTOTs}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-purple-500/10 p-3">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Farmers</p>
              <p className="text-2xl font-bold">{totalFarmers.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search Local MRs by name, subcounty, or ward..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={subcountyFilter} onValueChange={setSubcountyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Subcounty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subcounties</SelectItem>
                {subcounties.map((sc: string) => (
                  <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={wardFilter} onValueChange={setWardFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {wards.map((ward: string) => (
                  <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Local MRs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Local MRs ({filteredMRs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subcounty</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>TOTs</TableHead>
                <TableHead>Farmers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMRs.map((mr: LocalMR) => (
                <TableRow key={mr.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {mr.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{mr.name}</TableCell>
                  <TableCell>{mr.subcounty}</TableCell>
                  <TableCell>{mr.ward}</TableCell>
                  <TableCell>{mr.managerName}</TableCell>
                  <TableCell>{mr.totalTots}</TableCell>
                  <TableCell>{mr.totalFarmers}</TableCell>
                  <TableCell>
                    <Badge variant="success">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background">
                        <DropdownMenuItem onClick={() => handleViewDetails(mr.id)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditMR(mr)}>
                          Edit Local MR
                        </DropdownMenuItem>
                        <DropdownMenuItem>Manage TOTs</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add MR Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Local MR</DialogTitle>
            <DialogDescription>Create a new Local Machinery Ring.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Nakuru Central MR"
              />
            </div>
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., NK-001"
              />
            </div>
            <div className="space-y-2">
              <Label>Subcounty *</Label>
              <Input
                value={formData.subcounty}
                onChange={(e) => setFormData({ ...formData, subcounty: e.target.value })}
                placeholder="Enter subcounty"
              />
            </div>
            <div className="space-y-2">
              <Label>Ward *</Label>
              <Input
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                placeholder="Enter ward"
              />
            </div>
            <div className="space-y-2">
              <Label>Manager Name</Label>
              <Input
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                placeholder="Enter manager name"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleAddMR} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding...' : 'Add Local MR'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit MR Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Local MR</DialogTitle>
            <DialogDescription>Update Local MR details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Subcounty *</Label>
              <Input
                value={formData.subcounty}
                onChange={(e) => setFormData({ ...formData, subcounty: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ward *</Label>
              <Input
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Manager Name</Label>
              <Input
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setIsEditDialogOpen(false); setSelectedMR(null); resetForm(); }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUpdateMR} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Local MR'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
