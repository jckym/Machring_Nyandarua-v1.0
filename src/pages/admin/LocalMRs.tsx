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
import { mockLocalMRs as initialMRs } from '@/data/mockData';
import { LocalMR } from '@/types';

export function LocalMRs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [subcountyFilter, setSubcountyFilter] = useState('all');
  const [wardFilter, setWardFilter] = useState('all');
  const [localMRs, setLocalMRs] = useState<LocalMR[]>(initialMRs);
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

  const subcounties = [...new Set(localMRs.map(mr => mr.subcounty))];
  const wards = [...new Set(localMRs.map(mr => mr.ward))];

  const filteredMRs = localMRs.filter(mr => {
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

    const newMR: LocalMR = {
      id: `mr-${Date.now()}`,
      name: formData.name,
      code: formData.code,
      subcounty: formData.subcounty,
      ward: formData.ward,
      managerId: '',
      managerName: formData.managerName || 'TBA',
      totalTots: 0,
      totalFarmers: 0,
    };

    setLocalMRs(prev => [...prev, newMR]);
    toast.success('Local MR added successfully');
    setIsAddDialogOpen(false);
    resetForm();
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

    setLocalMRs(prev => prev.map(mr => 
      mr.id === selectedMR.id 
        ? { ...mr, ...formData }
        : mr
    ));
    toast.success('Local MR updated successfully');
    setIsEditDialogOpen(false);
    setSelectedMR(null);
    resetForm();
  };

  const handleViewDetails = (mrId: string) => {
    navigate(`/local-mrs/${mrId}`);
  };

  // Stats
  const totalMRs = localMRs.length;
  const totalFarmers = localMRs.reduce((sum, mr) => sum + mr.totalFarmers, 0);
  const totalTOTs = localMRs.reduce((sum, mr) => sum + mr.totalTots, 0);

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
                {subcounties.map(sc => (
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
                {wards.map(ward => (
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
              {filteredMRs.map((mr) => (
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
              <Button className="flex-1" onClick={handleAddMR}>
                Add Local MR
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
              <Button className="flex-1" onClick={handleUpdateMR}>
                Update Local MR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
