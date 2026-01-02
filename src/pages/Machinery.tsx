import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Tractor, CheckCircle, Clock, MoreVertical, Wrench } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useMachinery, useCreateMachinery, useUpdateMachineryStatus } from '@/hooks/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
type MachineryStatus = 'available' | 'in_use' | 'maintenance' | 'retired';

const MACHINERY_CATEGORIES = [
  'Tractors',
  'Harvesters',
  'Ploughs',
  'Planters',
  'Sprayers',
  'Irrigation Equipment',
  'Threshers',
  'Transport',
  'Other',
] as const;

interface MachineryItem {
  id: string;
  name: string;
  category: string;
  type?: string;
  status: MachineryStatus;
  pricePerAcre: number;
  localMrId?: string;
  description?: string;
  createdAt?: Date;
}

const getStatusColor = (status: MachineryStatus) => {
  switch (status) {
    case 'available': return 'success';
    case 'in_use': return 'warning';
    case 'maintenance': return 'destructive';
    case 'retired': return 'secondary';
    default: return 'secondary';
  }
};

const getStatusIcon = (status: MachineryStatus) => {
  switch (status) {
    case 'available': return <CheckCircle className="w-4 h-4" />;
    case 'in_use': return <Clock className="w-4 h-4" />;
    case 'maintenance': return <Wrench className="w-4 h-4" />;
    case 'retired': return null;
    default: return null;
  }
};

const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

export function Machinery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newMachinery, setNewMachinery] = useState<{
    name: string;
    category: string;
    status: MachineryStatus;
    pricePerAcre: string;
    description: string;
  }>({
    name: '',
    category: '',
    status: 'available',
    pricePerAcre: '',
    description: '',
  });

  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const isAdmin = user?.role === 'admin';

  // API hooks
  const { data: machinery = [], isLoading } = useMachinery();
  const createMachinery = useCreateMachinery();
  const updateStatus = useUpdateMachineryStatus();

  // Get unique categories from machinery for filter
  const uniqueCategories = [...new Set(machinery.map(m => m.category))].filter(Boolean).sort();

  const filteredMachinery = machinery.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const availableCount = machinery.filter(m => m.status === 'available').length;
  const inUseCount = machinery.filter(m => m.status === 'in_use').length;
  const maintenanceCount = machinery.filter(m => m.status === 'maintenance').length;

  const handleAddMachinery = () => {
    if (!newMachinery.name || !newMachinery.category || !newMachinery.pricePerAcre) {
      toast.error('Please fill all required fields');
      return;
    }

    const newItem = {
      name: newMachinery.name,
      category: newMachinery.category,
      status: newMachinery.status,
      daily_rate: Number(newMachinery.pricePerAcre),
    };

    createMachinery.mutate(newItem as any);

    setIsAddDialogOpen(false);
    setNewMachinery({
      name: '',
      category: '',
      status: 'available',
      pricePerAcre: '',
      description: '',
    });

    addNotification({
      title: 'New Machinery Added',
      message: `${newItem.name} has been added to the fleet`,
      type: 'system',
    });
  };

  const handleStatusChange = (machineryId: string, newStatus: 'available' | 'in_use' | 'maintenance' | 'retired') => {
    updateStatus.mutate({ id: machineryId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Machinery Management</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage fleet availability' : 'View machinery availability'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Machinery
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{availableCount}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{inUseCount}</p>
              <p className="text-sm text-muted-foreground">In Use</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Wrench className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-2xl font-bold">{maintenanceCount}</p>
              <p className="text-sm text-muted-foreground">Maintenance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search machinery..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {uniqueCategories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredMachinery.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No machinery found matching your filters
          </div>
        ) : filteredMachinery.map(machine => (
          <Card key={machine.id}>
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Tractor className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{machine.name}</h3>
                  </div>
                  <Badge variant={getStatusColor(machine.status as MachineryStatus) as any}>
                    {getStatusIcon(machine.status as MachineryStatus)}
                    <span className="ml-1 capitalize">{machine.status}</span>
                  </Badge>
                </div>

              <p className="text-sm text-muted-foreground">{machine.category}</p>

              <p className="font-semibold text-primary">
                {formatCurrency(machine.pricePerAcre)} / acre
              </p>

              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleStatusChange(machine.id, 'available')}>
                      Set Available
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(machine.id, 'in_use')}>
                      Set In Use
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(machine.id, 'maintenance')}>
                      Set Maintenance
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(machine.id, 'retired')}>
                      Set Retired
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Machinery Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Machinery</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Machinery name"
              value={newMachinery.name}
              onChange={e => setNewMachinery(p => ({ ...p, name: e.target.value }))}
            />

            <Select
              value={newMachinery.category}
              onValueChange={(value) => setNewMachinery(p => ({ ...p, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {MACHINERY_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Price per acre (KES)"
              value={newMachinery.pricePerAcre}
              onChange={e => setNewMachinery(p => ({ ...p, pricePerAcre: e.target.value }))}
            />

            <Select
              value={newMachinery.status}
              onValueChange={(value) =>
                setNewMachinery(p => ({ ...p, status: value as MachineryStatus }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in_use">In Use</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Description (optional)"
              value={newMachinery.description}
              onChange={e => setNewMachinery(p => ({ ...p, description: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMachinery}>
              Add Machinery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
