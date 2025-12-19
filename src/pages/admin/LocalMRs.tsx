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
import { Search, Plus, MoreHorizontal, Building2, Users, MapPin, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { mockLocalMRs } from '@/data/mockData';

export function LocalMRs() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMRs = mockLocalMRs.filter(mr =>
    mr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mr.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mr.county.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMR = () => {
    toast.info('Add Local MR functionality coming soon');
  };

  const handleEditMR = (mrId: string) => {
    toast.info(`Edit Local MR ${mrId}`);
  };

  const handleViewDetails = (mrId: string) => {
    toast.info(`View details for Local MR ${mrId}`);
  };

  // Stats
  const totalMRs = mockLocalMRs.length;
  const totalFarmers = mockLocalMRs.reduce((sum, mr) => sum + mr.totalFarmers, 0);
  const totalTOTs = mockLocalMRs.reduce((sum, mr) => sum + mr.totalTots, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Local MR Management</h1>
          <p className="text-muted-foreground">Manage the 10 Local Machinery Rings across Kenya</p>
        </div>
        <Button onClick={handleAddMR}>
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
              <p className="text-sm text-muted-foreground">Counties Covered</p>
              <p className="text-2xl font-bold">{totalMRs}</p>
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

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search Local MRs by name, location, or county..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                <TableHead>County</TableHead>
                <TableHead>Location</TableHead>
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
                  <TableCell>{mr.county}</TableCell>
                  <TableCell>{mr.location}</TableCell>
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
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(mr.id)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditMR(mr.id)}>
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
    </div>
  );
}
