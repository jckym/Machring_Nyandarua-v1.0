import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Tractor, CheckCircle, Clock, MoreVertical, Wrench, WifiOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useMachinery, useCreateMachinery, useUpdateMachineryStatus, useApiWithFallback } from '@/hooks/api';
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
import { MachineryStatus } from '@/types';

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
    case 'booked': return 'warning';
    case 'maintenance': return 'destructive';
    default: return 'secondary';
  }
};

const getStatusIcon = (status: MachineryStatus) => {
  switch (status) {
    case 'available': return <CheckCircle className="w-4 h-4" />;
    case 'booked': return <Clock className="w-4 h-4" />;
    case 'maintenance': return <Wrench className="w-4 h-4" />;
    default: return null;
  }
};

const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

export function Machinery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [localMachinery, setLocalMachinery] = useState<MachineryItem[]>([]);

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

  // API hooks with fallback
  const machineryQuery = useMachinery();
  const { data: machinery, isLoading, isUsingFallback } = useApiWithFallback(machineryQuery, [] as MachineryItem[]);
  const createMachinery = useCreateMachinery();
  const updateStatus = useUpdateMachineryStatus();

  useEffect(() => {
    if (machinery && Array.isArray(machinery)) {
      setLocalMachinery(machinery);
    }
  }, [machinery]);

  const filteredMachinery = localMachinery.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableCount = localMachinery.filter(m => m.status === 'available').length;
  const bookedCount = localMachinery.filter(m => m.status === 'booked').length;
  const maintenanceCount = localMachinery.filter(m => m.status === 'maintenance').length;

  const handleAddMachinery = () => {
    if (!newMachinery.name || !newMachinery.category || !newMachinery.pricePerAcre) {
      toast.error('Please fill all required fields');
      return;
    }

    const newItem: MachineryItem = {
      id: `mach-${Date.now()}`,
      name: newMachinery.name,
      category: newMachinery.category,
      status: newMachinery.status,
      pricePerAcre: Number(newMachinery.pricePerAcre),
      description: newMachinery.description,
    };

    if (!isUsingFallback) {
      createMachinery.mutate(newItem as any);
    } else {
      setLocalMachinery(prev => [...prev, newItem]);
      toast.success('Machinery added successfully (offline mode)');
    }

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

  const handleStatusChange = (machineryId: string, newStatus: MachineryStatus) => {
    if (!isUsingFallback) {
      updateStatus.mutate({ id: machineryId, status: newStatus });
    } else {
      setLocalMachinery(prev =>
        prev.map(m => m.id === machineryId ? { ...m, status: newStatus } : m)
      );
      toast.success('Status updated (offline mode)');
    }
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
      {/* Offline Banner */}
      {isUsingFallback && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-center gap-2 text-warning">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">Using offline data. Changes will sync when connection is restored.</span>
        </div>
      )}

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
              <p className="text-2xl font-bold">{bookedCount}</p>
              <p className="text-sm text-muted-foreground">Booked</p>
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

      {/* Search */}
      <Input
        placeholder="Search machinery..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredMachinery.map(machine => (
          <Card key={machine.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Tractor className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{machine.name}</h3>
                </div>
                <Badge variant={getStatusColor(machine.status) as any}>
                  {getStatusIcon(machine.status)}
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
                    <DropdownMenuItem onClick={() => handleStatusChange(machine.id, 'booked')}>
                      Set Booked
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(machine.id, 'maintenance')}>
                      Set Maintenance
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

            <Input
              placeholder="Category (e.g., Tractor, Harvester)"
              value={newMachinery.category}
              onChange={e => setNewMachinery(p => ({ ...p, category: e.target.value }))}
            />

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
                <SelectItem value="maintenance">Maintenance</SelectItem>
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
