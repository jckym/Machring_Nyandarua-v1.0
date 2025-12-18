import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Plus, MoreHorizontal, Building2, Users, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Branch {
  id: string;
  name: string;
  location: string;
  region: string;
  managerId: string;
  managerName: string;
  totCount: number;
  farmerCount: number;
  status: 'Active' | 'Inactive';
}

const mockBranches: Branch[] = [
  { id: '1', name: 'Nairobi Central', location: 'Nairobi CBD', region: 'Central', managerId: '1', managerName: 'Jane Manager', totCount: 12, farmerCount: 450, status: 'Active' },
  { id: '2', name: 'Nakuru Branch', location: 'Nakuru Town', region: 'Rift Valley', managerId: '2', managerName: 'Peter Manager', totCount: 8, farmerCount: 320, status: 'Active' },
  { id: '3', name: 'Eldoret Branch', location: 'Eldoret Town', region: 'Rift Valley', managerId: '3', managerName: 'Mary Manager', totCount: 6, farmerCount: 280, status: 'Active' },
  { id: '4', name: 'Kisumu Branch', location: 'Kisumu City', region: 'Western', managerId: '4', managerName: 'John Manager', totCount: 10, farmerCount: 380, status: 'Active' },
  { id: '5', name: 'Mombasa Branch', location: 'Mombasa Island', region: 'Coast', managerId: '5', managerName: 'Sarah Manager', totCount: 5, farmerCount: 150, status: 'Inactive' },
];

export function Branches() {
  const [searchQuery, setSearchQuery] = useState('');
  const [branches] = useState<Branch[]>(mockBranches);

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBranch = () => {
    toast.info('Add branch functionality coming soon');
  };

  const handleEditBranch = (branchId: string) => {
    toast.info(`Edit branch ${branchId}`);
  };

  // Stats
  const totalBranches = branches.length;
  const activeBranches = branches.filter(b => b.status === 'Active').length;
  const totalFarmers = branches.reduce((sum, b) => sum + b.farmerCount, 0);
  const totalTOTs = branches.reduce((sum, b) => sum + b.totCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Branch Management</h1>
          <p className="text-muted-foreground">Manage company branches and locations</p>
        </div>
        <Button onClick={handleAddBranch}>
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
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
              <p className="text-sm text-muted-foreground">Total Branches</p>
              <p className="text-2xl font-bold">{totalBranches}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-500/10 p-3">
              <MapPin className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Branches</p>
              <p className="text-2xl font-bold">{activeBranches}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-blue-500/10 p-3">
              <Users className="h-6 w-6 text-blue-500" />
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

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search branches..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Branches Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Branches ({filteredBranches.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>TOTs</TableHead>
                <TableHead>Farmers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>{branch.location}</TableCell>
                  <TableCell>{branch.region}</TableCell>
                  <TableCell>{branch.managerName}</TableCell>
                  <TableCell>{branch.totCount}</TableCell>
                  <TableCell>{branch.farmerCount}</TableCell>
                  <TableCell>
                    <Badge variant={branch.status === 'Active' ? 'default' : 'secondary'} className={branch.status === 'Active' ? 'bg-green-500' : ''}>
                      {branch.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditBranch(branch.id)}>
                          Edit Branch
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
