import { useState } from 'react';
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
import { Search, Plus, MoreHorizontal, UserCog, Shield, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useUsers, useLocalMRs, useCreateUser, useUpdateUser, useToggleUserStatus, useApiWithFallback } from '@/hooks/api';
import { User, UserRole, LocalMR } from '@/types';

// Fallback mock data
const mockUsers: User[] = [
  { id: 'admin-1', name: 'Admin User', email: 'admin@mr.ke', phone: '+254700000000', role: 'admin', status: 'active', createdAt: new Date('2023-01-01') },
  { id: 'mgr-1', name: 'John Kamau', email: 'john.kamau@mr.ke', phone: '+254700000001', role: 'manager', localMrId: 'mr-1', status: 'active', createdAt: new Date('2023-01-01') },
  { id: 'mgr-2', name: 'Mary Wanjiku', email: 'mary.wanjiku@mr.ke', phone: '+254700000002', role: 'manager', localMrId: 'mr-2', status: 'active', createdAt: new Date('2023-01-01') },
  { id: 'tot-1', name: 'Samuel Mwangi', email: 'samuel@mr.ke', phone: '+254712345001', role: 'tot', localMrId: 'mr-1', status: 'active', createdAt: new Date('2024-01-15') },
  { id: 'tot-2', name: 'Agnes Wairimu', email: 'agnes@mr.ke', phone: '+254712345002', role: 'tot', localMrId: 'mr-1', status: 'active', createdAt: new Date('2024-02-10') },
  { id: 'tot-3', name: 'Paul Kimani', email: 'paul@mr.ke', phone: '+254712345003', role: 'tot', localMrId: 'mr-2', status: 'active', createdAt: new Date('2024-01-20') },
];

const mockLocalMRs: LocalMR[] = [
  { id: 'mr-1', name: 'Nakuru Central MR', code: 'NK-001', subcounty: 'Nakuru East', ward: 'Bahati', managerId: 'mgr-1', managerName: 'John Kamau', totalTots: 5, totalFarmers: 120 },
  { id: 'mr-2', name: 'Nyeri Highland MR', code: 'NY-001', subcounty: 'Nyeri Central', ward: 'Ruring\'u', managerId: 'mgr-2', managerName: 'Mary Wanjiku', totalTots: 4, totalFarmers: 95 },
  { id: 'mr-3', name: 'Eldoret Valley MR', code: 'EL-001', subcounty: 'Eldoret East', ward: 'Pioneer', managerId: 'mgr-3', managerName: 'Peter Kipkoech', totalTots: 6, totalFarmers: 150 },
];

export function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'tot' as UserRole,
    localMrId: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Fetch data with fallback
  const usersQuery = useUsers();
  const { data: users, isUsingFallback } = useApiWithFallback(usersQuery, mockUsers);
  
  const localMRsQuery = useLocalMRs();
  const { data: localMRs } = useApiWithFallback(localMRsQuery, mockLocalMRs);
  
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const toggleStatusMutation = useToggleUserStatus();

  const filteredUsers = users.filter((user: User) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.localMrId && localMRs.find((mr: LocalMR) => mr.id === user.localMrId)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'tot',
      localMrId: '',
      status: 'active',
    });
  };

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
      <Badge variant={status === 'active' ? 'default' : 'secondary'} className={status === 'active' ? 'bg-green-500' : ''}>
        {status === 'active' ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const handleAddUser = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.role !== 'admin' && !formData.localMrId) {
      toast.error('Please select a Local MR for this user');
      return;
    }

    if (isUsingFallback) {
      toast.success(`${formData.role.toUpperCase()} ${formData.name} added successfully (demo mode)`);
      setIsAddDialogOpen(false);
      resetForm();
      return;
    }

    createMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password || 'TempPassword123!',
      role: formData.role,
      localMrId: formData.role !== 'admin' ? formData.localMrId : undefined,
    }, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        resetForm();
      }
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      role: user.role,
      localMrId: user.localMrId || '',
      status: user.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    if (isUsingFallback) {
      toast.success('User updated successfully (demo mode)');
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      return;
    }

    updateMutation.mutate({
      id: selectedUser.id,
      data: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        localMrId: formData.role !== 'admin' ? formData.localMrId : undefined,
        status: formData.status,
      }
    }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        resetForm();
      }
    });
  };

  const handleToggleStatus = (userId: string) => {
    const user = users.find((u: User) => u.id === userId);
    if (!user) return;

    if (isUsingFallback) {
      toast.success(`User ${user.name} ${user.status === 'active' ? 'deactivated' : 'activated'} (demo mode)`);
      return;
    }

    toggleStatusMutation.mutate({
      id: userId,
      status: user.status === 'active' ? 'inactive' : 'active'
    });
  };

  const getBranchName = (localMrId?: string) => {
    if (!localMrId) return 'HQ';
    const mr = localMRs.find((m: LocalMR) => m.id === localMrId);
    return mr?.name || 'Unknown';
  };

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u: User) => u.status === 'active').length;
  const adminCount = users.filter((u: User) => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage system users and permissions</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
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
                <TableHead>Local MR</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getBranchName(user.localMrId)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
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

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new system user with appropriate role and permissions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+254..."
              />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter temporary password"
              />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tot">TOT (Field Officer)</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.role !== 'admin' && (
              <div className="space-y-2">
                <Label>Local MR *</Label>
                <Select
                  value={formData.localMrId}
                  onValueChange={(value) => setFormData({ ...formData, localMrId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Local MR" />
                  </SelectTrigger>
                  <SelectContent>
                    {localMRs.map((mr: LocalMR) => (
                      <SelectItem key={mr.id} value={mr.id}>{mr.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleAddUser} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding...' : 'Add User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details and permissions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tot">TOT (Field Officer)</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.role !== 'admin' && (
              <div className="space-y-2">
                <Label>Local MR *</Label>
                <Select
                  value={formData.localMrId}
                  onValueChange={(value) => setFormData({ ...formData, localMrId: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {localMRs.map((mr: LocalMR) => (
                      <SelectItem key={mr.id} value={mr.id}>{mr.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setIsEditDialogOpen(false); setSelectedUser(null); resetForm(); }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUpdateUser} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
