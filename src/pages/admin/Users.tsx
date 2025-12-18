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
import { Search, Plus, MoreHorizontal, UserCog, Shield, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'tot';
  branch: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'John Admin', email: 'john@company.com', role: 'admin', branch: 'HQ', status: 'Active', lastLogin: '2024-01-15' },
  { id: '2', name: 'Jane Manager', email: 'jane@company.com', role: 'manager', branch: 'Nairobi', status: 'Active', lastLogin: '2024-01-14' },
  { id: '3', name: 'Mike TOT', email: 'mike@company.com', role: 'tot', branch: 'Nakuru', status: 'Active', lastLogin: '2024-01-13' },
  { id: '4', name: 'Sarah TOT', email: 'sarah@company.com', role: 'tot', branch: 'Eldoret', status: 'Inactive', lastLogin: '2024-01-01' },
  { id: '5', name: 'Peter Manager', email: 'peter@company.com', role: 'manager', branch: 'Kisumu', status: 'Active', lastLogin: '2024-01-12' },
];

export function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users] = useState<User[]>(mockUsers);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      admin: 'default',
      manager: 'secondary',
      tot: 'outline',
    };
    return <Badge variant={variants[role] || 'outline'}>{role.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'Active' ? 'default' : 'secondary'} className={status === 'Active' ? 'bg-green-500' : ''}>
        {status}
      </Badge>
    );
  };

  const handleAddUser = () => {
    toast.info('Add user functionality coming soon');
  };

  const handleEditUser = (userId: string) => {
    toast.info(`Edit user ${userId}`);
  };

  const handleDeactivateUser = (userId: string) => {
    toast.success(`User ${userId} deactivated`);
  };

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage system users and permissions</p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-primary/10 p-3">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-500/10 p-3">
              <UserCog className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">{activeUsers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-purple-500/10 p-3">
              <Shield className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Administrators</p>
              <p className="text-2xl font-bold">{adminCount}</p>
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
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{user.branch}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeactivateUser(user.id)}
                          className="text-destructive"
                        >
                          Deactivate
                        </DropdownMenuItem>
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
