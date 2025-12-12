import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockMachinery } from '@/data/mockData';
import { 
  Search, Plus, Tractor, Calendar, Filter, Settings, 
  CheckCircle, XCircle, Clock, AlertTriangle, MoreVertical,
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

export function Machinery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedMachinery, setSelectedMachinery] = useState<MachineryType | null>(null);
  const [machinery, setMachinery] = useState(mockMachinery);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [newMachinery, setNewMachinery] = useState({
    name: '',
    type: '',
    status: 'Available' as const,
    pricePerAcre: '',
    description: '',
  });

  const filteredMachinery = machinery.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableCount = machinery.filter(m => m.status === 'Available').length;
  const bookedCount = machinery.filter(m => m.status === 'Booked').length;
  const maintenanceCount = machinery.filter(m => m.status === 'Maintenance').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'booked':
        return 'warning';
      case 'maintenance':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'booked':
        return <Clock className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatCurrency = (value: number) => {
    return `KES ${value.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const handleAddMachinery = () => {
    if (!newMachinery.name || !newMachinery.type || !newMachinery.pricePerAcre) {
      toast.error('Please fill all required fields');
      return;
    }

    const newItem: MachineryType = {
      id: `mach-${Date.now()}`,
      name: newMachinery.name,
      type: newMachinery.type as any,
      status: newMachinery.status,
      pricePerAcre: parseFloat(newMachinery.pricePerAcre),
      description: newMachinery.description,
    };

    setMachinery(prev => [...prev, newItem]);
    setIsAddDialogOpen(false);
    setNewMachinery({ name: '', type: '', status: 'available', pricePerAcre: '', description: '' });
    
    toast.success('Machinery added successfully');
    addNotification({
      title: 'New Machinery Added',
      message: `${newItem.name} has been added to the fleet`,
      type: 'system',
    });
  };

  const handleStatusChange = (machineryId: string, newStatus: MachineryType['status']) => {
    setMachinery(prev => 
      prev.map(m => m.id === machineryId ? { ...m, status: newStatus } : m)
    );
    toast.success('Status updated');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Machinery Management</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Manage fleet availability and scheduling' : 'View machinery availability'}
          </p>
        </div>
        {isAdmin && (
          <Button variant="earth" size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Machinery
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4" variant="earth">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary-foreground/20 flex items-center justify-center">
              <Tractor className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading">{machinery.length}</p>
              <p className="text-xs sm:text-sm opacity-80">Total Fleet</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-emerald-700">{availableCount}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Available</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-amber-700">{bookedCount}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Booked</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-red-700" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-red-700">{maintenanceCount}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Maintenance</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search machinery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Machinery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filteredMachinery.map((machine, index) => (
          <Card 
            key={machine.id}
            variant="elevated"
            className="animate-fade-in overflow-hidden"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="h-24 sm:h-32 bg-gradient-to-br from-secondary/30 via-accent/20 to-primary/10 flex items-center justify-center relative">
              <Tractor className="w-12 h-12 sm:w-16 sm:h-16 text-secondary/50" />
              <Badge 
                variant={getStatusColor(machine.status) as any} 
                className="absolute top-3 right-3 text-xs flex items-center gap-1"
              >
                {getStatusIcon(machine.status)}
                {machine.status}
              </Badge>
            </div>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-2 gap-2">
                <div>
                  <h3 className="font-heading font-semibold text-sm sm:text-base">{machine.name}</h3>
                  <Badge variant="outline" className="text-xs mt-1">{machine.type}</Badge>
                </div>
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStatusChange(machine.id, 'Available')}>
                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                        Set Available
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(machine.id, 'Booked')}>
                        <Clock className="w-4 h-4 mr-2 text-amber-600" />
                        Set Booked
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(machine.id, 'Maintenance')}>
                        <Wrench className="w-4 h-4 mr-2 text-red-600" />
                        Set Maintenance
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CalendarDays className="w-4 h-4 mr-2" />
                        View Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              {machine.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{machine.description}</p>
              )}
              
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-semibold text-primary">{formatCurrency(machine.pricePerAcre)}/acre</span>
                </div>
                {machine.nextAvailableDate && machine.status === 'Booked' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next Available:</span>
                    <span className="font-medium">{formatDate(machine.nextAvailableDate)}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8 sm:h-9">View Schedule</Button>
                {machine.status === 'Available' && (
                  <Button variant="forest" size="sm" className="flex-1 text-xs h-8 sm:h-9">Book Now</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Machinery Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Machinery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Machinery Name *</Label>
              <Input
                placeholder="e.g., John Deere Tractor 5075E"
                value={newMachinery.name}
                onChange={(e) => setNewMachinery(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={newMachinery.type}
                onValueChange={(value) => setNewMachinery(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tractor">Tractor</SelectItem>
                  <SelectItem value="harvester">Harvester</SelectItem>
                  <SelectItem value="planter">Planter</SelectItem>
                  <SelectItem value="sprayer">Sprayer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price Per Acre (KES) *</Label>
              <Input
                type="number"
                placeholder="e.g., 3500"
                value={newMachinery.pricePerAcre}
                onChange={(e) => setNewMachinery(prev => ({ ...prev, pricePerAcre: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Initial Status</Label>
              <Select
                value={newMachinery.status}
                onValueChange={(value: any) => setNewMachinery(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Add details about this machinery..."
                value={newMachinery.description}
                onChange={(e) => setNewMachinery(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button variant="forest" onClick={handleAddMachinery}>Add Machinery</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}