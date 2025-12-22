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
  Search, Plus, MoreHorizontal, UserCog, Shield, Users as UsersIcon
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

  /** ================= ACTIONS ================= */
  const handleAddUser = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('All fields are required');
      return;
    }

    if (!isPasswordValid) {
      toast.error('Password does not meet security requirements');
      return;
    }

    createUser.mutate(
      {
        ...formData,
        localMrId: formData.role === 'admin' ? undefined : formData.localMrId,
      },
      {
        onSuccess: () => {
          toast.success('User created successfully');
          setIsAddDialogOpen(false);
          resetForm();
        },
      }
    );
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    updateUser.mutate(
      {
        id: selectedUser.id,
        data: {
          ...formData,
          localMrId: formData.role === 'admin' ? undefined : formData.localMrId,
        },
      },
      {
        onSuccess: () => {
          toast.success('User updated');
          setIsEditDialogOpen(false);
          setSelectedUser(null);
          resetForm();
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

  /** ================= STATS ================= */
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  if (usersLoading) {
    return <p className="text-muted-foreground">Loading users...</p>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">MongoDB-powered user system</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
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
      <Input
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

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
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
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
                        <DropdownMenuItem onClick={() => {
                          setSelectedUser(user);
                          setFormData({ ...user, password: '' });
                          setIsEditDialogOpen(true);
                        }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
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

      {/* ADD & EDIT DIALOGS → unchanged UI logic */}
      {/* (Dialogs remain exactly the same as your version) */}
    </div>
  );
}

/** ================= SMALL STAT CARD ================= */
function StatCard({ icon: Icon, label, value }: any) {
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
