import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockMachinery } from '@/data/mockData';
import {
  Search, Plus, Tractor, Filter, Settings,
  CheckCircle, Clock, MoreVertical,
  CalendarDays, Wrench
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Machinery as MachineryType } from '@/types';

/* =======================
   Helpers
======================= */

const getStatusColor = (status: MachineryType['status']) => {
  switch (status) {
    case 'Available':
      return 'success';
    case 'Booked':
      return 'warning';
    case 'Maintenance':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusIcon = (status: MachineryType['status']) => {
  switch (status) {
    case 'Available':
      return <CheckCircle className="w-4 h-4" />;
    case 'Booked':
      return <Clock className="w-4 h-4" />;
    case 'Maintenance':
      return <Wrench className="w-4 h-4" />;
    default:
      return null;
  }
};

const formatCurrency = (value: number) =>
  `KES ${value.toLocaleString()}`;

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);

/* =======================
   Component
======================= */

export function Machinery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [machinery, setMachinery] = useState<MachineryType[]>(mockMachinery);

  const [newMachinery, setNewMachinery] = useState<{
    name: string;
    type: string;
    status: MachineryType['status'];
    pricePerAcre: string;
    description: string;
  }>({
    name: '',
    type: '',
    status: 'Available',
    pricePerAcre: '',
    description: '',
  });

  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const isAdmin = user?.role === 'admin';

  const filteredMachinery = machinery.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableCount = machinery.filter(m => m.status === 'Available').length;
  const bookedCount = machinery.filter(m => m.status === 'Booked').length;
  const maintenanceCount = machinery.filter(m => m.status === 'Maintenance').length;

  const handleAddMachinery = () => {
    if (!newMachinery.name || !newMachinery.type || !newMachinery.pricePerAcre) {
      toast.error('Please fill all required fields');
      return;
    }

    const newItem: MachineryType = {
      id: `mach-${Date.now()}`,
      name: newMachinery.name,
      type: newMachinery.type,
      status: newMachinery.status,
      pricePerAcre: Number(newMachinery.pricePerAcre),
      description: newMachinery.description,
    };

    setMachinery(prev => [...prev, newItem]);
    setIsAddDialogOpen(false);

    setNewMachinery({
      name: '',
      type: '',
      status: 'Available',
      pricePerAcre: '',
      description: '',
    });

    toast.success('Machinery added successfully');

    addNotification({
      title: 'New Machinery Added',
      message: `${newItem.name} has been added to the fleet`,
      type: 'system',
    });
  };

  const handleStatusChange = (
    machineryId: string,
    newStatus: MachineryType['status']
  ) => {
    setMachinery(prev =>
      prev.map(m =>
        m.id === machineryId ? { ...m, status: newStatus } : m
      )
    );
    toast.success('Status updated');
  };

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
        <Card><CardContent className="p-4">Available: {availableCount}</CardContent></Card>
        <Card><CardContent className="p-4">Booked: {bookedCount}</CardContent></Card>
        <Card><CardContent className="p-4">Maintenance: {maintenanceCount}</CardContent></Card>
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
                <h3 className="font-semibold">{machine.name}</h3>
                <Badge variant={getStatusColor(machine.status)}>
                  {getStatusIcon(machine.status)}
                  <span className="ml-1">{machine.status}</span>
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">{machine.type}</p>

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
                    <DropdownMenuItem onClick={() => handleStatusChange(machine.id, 'Available')}>
                      Set Available
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(machine.id, 'Booked')}>
                      Set Booked
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(machine.id, 'Maintenance')}>
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
              placeholder="Type"
              value={newMachinery.type}
              onChange={e => setNewMachinery(p => ({ ...p, type: e.target.value }))}
            />

            <Input
              type="number"
              placeholder="Price per acre"
              value={newMachinery.pricePerAcre}
              onChange={e => setNewMachinery(p => ({ ...p, pricePerAcre: e.target.value }))}
            />

            <Select
              value={newMachinery.status}
              onValueChange={(value) =>
                setNewMachinery(p => ({ ...p, status: value as MachineryType['status'] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Description"
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
