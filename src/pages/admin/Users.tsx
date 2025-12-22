import { useState } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Search, Plus, MoreHorizontal, UserCog, Shield, Users as UsersIcon, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useUsers,
  useLocalMRs,
  useCreateUser,
  useUpdateUser,
  useToggleUserStatus
} from '@/hooks/api';

import { User, UserRole, LocalMR } from '@/types';
import {
  PasswordStrengthIndicator,
  usePasswordValidation
} from '@/components/ui/password-strength';

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

  /** ================= API HOOKS ================= */
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: localMRs = [] } = useLocalMRs();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const toggleStatus = useToggleUserStatus();

  /** ================= HELPERS ================= */
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

  const { isValid: isPasswordValid } = usePasswordValidation(formData.password);

  const filteredUsers = users.filter((user: User) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBranchName = (id?: string) =>
    localMRs.find((m: LocalMR) => m.id === id)?.name || 'HQ';

  const roleBadge = (role: string) => (
    <Badge variant={role === 'admin' ? 'default' : role === 'manager' ? 'secondary' : 'outline'}>
      {role.toUpperCase()}
    </Badge>
  );

  const statusBadge = (status: string) => (
    <Badge className={status === 'active' ? 'bg-green-500' : ''}>
      {status}
    </Badge>
  );

  /** ================= VALIDATION ================= */
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  /** ================= ACTIONS ================= */
  const handleAddUser = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      toast.error('Name must be between 2 and 100 characters');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (!validatePhone(formData.phone)) {
      toast.error('Please enter a valid phone number (10-15 digits)');
      return;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return;
    }
    if (!isPasswordValid) {
      toast.error('Password does not meet security requirements');
      return;
    }
    if (formData.role !== 'admin' && !formData.localMrId) {
      toast.error('Please assign a Local MR for TOT or Manager');
      return;
    }

    createUser.mutate(
      {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
        localMrId: formData.role === 'admin' ? undefined : formData.localMrId,
      },
      {
        onSuccess: () => {
          toast.success(`${formData.role.toUpperCase()} account created successfully`);
          setIsAddDialogOpen(false);
          resetForm();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || error.message || 'Failed to create user');
        },
      }
    );
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    // Validate fields
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.phone.trim() || !validatePhone(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    if (formData.role !== 'admin' && !formData.localMrId) {
      toast.error('Please assign a Local MR for TOT or Manager');
      return;
    }

    updateUser.mutate(
      {
        id: selectedUser.id,
        data: {
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim(),
          role: formData.role,
          status: formData.status,
          localMrId: formData.role === 'admin' ? undefined : formData.localMrId,
        },
      },
      {
        onSuccess: () => {
          toast.success('User updated successfully');
          setIsEditDialogOpen(false);
          setSelectedUser(null);
          resetForm();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || error.message || 'Failed to update user');
        },
      }
    );
  };

  const handleToggleStatus = (user: User) => {
    toggleStatus.mutate({
      id: user.id,
      status: user.status === 'active' ? 'inactive' : 'active',
    });
  };

  const openEditDialog = (user: User) => {
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

  /** ================= STATS ================= */
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Create and manage TOT, Manager, and Admin accounts</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={UsersIcon} label="Total Users" value={totalUsers} />
        <StatCard icon={UserCog} label="Active Users" value={activeUsers} />
        <StatCard icon={Shield} label="Admins" value={adminCount} />
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
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
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found. Click "Add User" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{roleBadge(user.role)}</TableCell>
                    <TableCell>{getBranchName(user.localMrId)}</TableCell>
                    <TableCell>{statusBadge(user.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ADD USER DIALOG */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new TOT, Manager, or Admin to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Full Name *</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Kamau"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-email">Email *</Label>
              <Input
                id="add-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.kamau@example.com"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-phone">Phone Number *</Label>
              <Input
                id="add-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+254712345678"
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole, localMrId: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tot">TOT (Technical Officer)</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role && formData.role !== 'admin' && (
              <div className="space-y-2">
                <Label>Assign to Local MR *</Label>
                <Select
                  value={formData.localMrId}
                  onValueChange={(value) => setFormData({ ...formData, localMrId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Local MR" />
                  </SelectTrigger>
                  <SelectContent>
                    {localMRs.map((mr: LocalMR) => (
                      <SelectItem key={mr.id} value={mr.id}>
                        {mr.name} ({mr.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="add-password">Password *</Label>
              <Input
                id="add-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            <Button
              onClick={handleAddUser}
              className="w-full"
              disabled={createUser.isPending}
            >
              {createUser.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT USER DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole, localMrId: '' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tot">TOT (Technical Officer)</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role && formData.role !== 'admin' && (
              <div className="space-y-2">
                <Label>Assign to Local MR *</Label>
                <Select
                  value={formData.localMrId}
                  onValueChange={(value) => setFormData({ ...formData, localMrId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Local MR" />
                  </SelectTrigger>
                  <SelectContent>
                    {localMRs.map((mr: LocalMR) => (
                      <SelectItem key={mr.id} value={mr.id}>
                        {mr.name} ({mr.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
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

            <Button
              onClick={handleUpdateUser}
              className="w-full"
              disabled={updateUser.isPending}
            >
              {updateUser.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** ================= SMALL STAT CARD ================= */
function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
