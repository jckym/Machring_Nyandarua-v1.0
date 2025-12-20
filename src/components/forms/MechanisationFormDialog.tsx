import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MechanisationJob, Farmer } from '@/types';
import { useFarmers, useMachinery, useApiWithFallback } from '@/hooks/api';
import { Upload, Tractor } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MachineryItem {
  id: string;
  name: string;
  status: 'available' | 'booked' | 'maintenance';
  pricePerAcre: number;
}

interface MechanisationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (job: Partial<MechanisationJob>) => void;
}

const serviceTypes = [
  { value: 'ploughing', label: 'Ploughing' },
  { value: 'harrowing', label: 'Harrowing' },
  { value: 'planting', label: 'Planting' },
  { value: 'harvesting', label: 'Harvesting' },
  { value: 'spraying', label: 'Spraying' },
];

export function MechanisationFormDialog({ open, onOpenChange, onSubmit }: MechanisationFormDialogProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    farmerId: '',
    machineryId: '',
    serviceType: '' as MechanisationJob['serviceType'],
    acreage: 1,
    scheduledDate: '',
    notes: '',
  });

  // API hooks with fallback
  const farmersQuery = useFarmers();
  const { data: farmers } = useApiWithFallback(farmersQuery, [] as Farmer[]);
  
  const machineryQuery = useMachinery();
  const { data: machinery } = useApiWithFallback(machineryQuery, [] as MachineryItem[]);

  const availableMachinery = (machinery as MachineryItem[]).filter(m => m.status === 'available');

  const selectedMachinery = useMemo(
    () => (machinery as MachineryItem[]).find(m => m.id === formData.machineryId),
    [formData.machineryId, machinery]
  );

  const selectedFarmer = useMemo(
    () => (farmers as Farmer[]).find(f => f.id === formData.farmerId),
    [formData.farmerId, farmers]
  );

  const total = selectedMachinery ? selectedMachinery.pricePerAcre * formData.acreage : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.farmerId || !formData.machineryId || !formData.serviceType || !formData.scheduledDate) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    onSubmit({
      farmerId: formData.farmerId,
      farmerName: selectedFarmer?.name || '',
      machineryId: formData.machineryId,
      machineryName: selectedMachinery?.name || '',
      serviceType: formData.serviceType,
      acreage: formData.acreage,
      pricePerAcre: selectedMachinery?.pricePerAcre || 0,
      totalPrice: total,
      commissionAmount: 0,
      status: 'pending-approval',
      scheduledDate: new Date(formData.scheduledDate),
      notes: formData.notes || undefined,
    });

    toast({
      title: 'Booking Submitted',
      description: 'Your mechanisation booking has been sent for approval',
    });

    onOpenChange(false);
    setFormData({
      farmerId: '',
      machineryId: '',
      serviceType: '' as MechanisationJob['serviceType'],
      acreage: 1,
      scheduledDate: '',
      notes: '',
    });
  };

  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'booked': return 'warning';
      case 'maintenance': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-heading">New Mechanisation Booking</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
          {/* Farmer Selection */}
          <div className="space-y-2">
            <Label>Select Farmer *</Label>
            <Select
              value={formData.farmerId}
              onValueChange={(value) => setFormData({ ...formData, farmerId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a farmer" />
              </SelectTrigger>
              <SelectContent>
                {(farmers as Farmer[]).map((farmer) => (
                  <SelectItem key={farmer.id} value={farmer.id}>
                    {farmer.name} - {farmer.location.village}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Machinery Selection */}
          <div className="space-y-2">
            <Label>Select Machinery *</Label>
            <Select
              value={formData.machineryId}
              onValueChange={(value) => setFormData({ ...formData, machineryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose machinery" />
              </SelectTrigger>
              <SelectContent>
                {(machinery as MachineryItem[]).map((machine) => (
                  <SelectItem 
                    key={machine.id} 
                    value={machine.id}
                    disabled={machine.status !== 'available'}
                  >
                    <div className="flex items-center gap-2">
                      <Tractor className="w-4 h-4" />
                      <span>{machine.name}</span>
                      <Badge variant={getStatusColor(machine.status) as any} className="text-xs ml-auto capitalize">
                        {machine.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {availableMachinery.length} machinery available
            </p>
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label>Service Type *</Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) => setFormData({ ...formData, serviceType: value as MechanisationJob['serviceType'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((service) => (
                  <SelectItem key={service.value} value={service.value}>
                    {service.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Acreage */}
          <div className="space-y-2">
            <Label htmlFor="acreage">Acreage *</Label>
            <Input
              id="acreage"
              type="number"
              min="0.5"
              step="0.5"
              value={formData.acreage}
              onChange={(e) => setFormData({ ...formData, acreage: parseFloat(e.target.value) || 1 })}
            />
          </div>

          {/* Scheduled Date */}
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Preferred Date *</Label>
            <Input
              id="scheduledDate"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requirements or instructions..."
              rows={3}
            />
          </div>

          {/* Upload Photo */}
          <div className="space-y-2">
            <Label>Photo (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload farm photo</p>
            </div>
          </div>

          {/* Summary */}
          {selectedMachinery && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Booking Summary</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Machinery:</span>
                <span>{selectedMachinery.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per Acre:</span>
                <span>{formatCurrency(selectedMachinery.pricePerAcre)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Acreage:</span>
                <span>{formData.acreage} acres</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Estimated Total:</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Booking requires manager approval before confirmation
              </p>
            </div>
          )}

          {/* Actions - Sticky on mobile */}
          <div className="flex gap-3 pt-4 pb-2 sticky bottom-0 bg-background border-t -mx-4 sm:-mx-6 px-4 sm:px-6 mt-auto">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="earth" className="flex-1">
              Submit Booking
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
