// src/components/forms/MechanisationFormDialog.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFarmers } from '@/hooks/api/useFarmers';
import { useMachinery } from '@/hooks/api/useMachinery';
import { useLocalMRs } from '@/hooks/api/useLocalMRs';
import { Tractor, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { CreateMechanisationDto } from '@/hooks/api/useMechanisation';

interface MechanisationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (job: CreateMechanisationDto) => void;
}

const serviceTypes = [
  { value: 'ploughing', label: 'Ploughing' },
  { value: 'harrowing', label: 'Harrowing' },
  { value: 'planting', label: 'Planting' },
  { value: 'harvesting', label: 'Harvesting' },
  { value: 'spraying', label: 'Spraying' },
] as const;

export function MechanisationFormDialog({ open, onOpenChange, onSubmit }: MechanisationFormDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    farmerId: '',
    machineryId: '',
    localMrId: '',
    serviceType: '',
    acreage: 1,
    scheduledDate: '',
    notes: '',
  });

  const { data: farmers = [], isLoading: farmersLoading, error: farmersError } = useFarmers();
  const { data: machinery = [], isLoading: machineryLoading, error: machineryError } = useMachinery();
  const { data: localMRs = [] } = useLocalMRs();

  const availableMachinery = machinery.filter((m) => m.status === 'available');
  const selectedMachinery = useMemo(() => machinery.find((m) => m.id === formData.machineryId), [formData.machineryId, machinery]);
  const selectedFarmer = useMemo(() => farmers.find((f) => f.id === formData.farmerId), [formData.farmerId, farmers]);

  const total = selectedMachinery ? (selectedMachinery.pricePerAcre || selectedMachinery.daily_rate || 0) * formData.acreage : 0;
  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;
  const isLoading = farmersLoading || machineryLoading;
  const hasError = farmersError || machineryError;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        farmerId: '',
        machineryId: '',
        localMrId: localMRs[0]?.id || '',
        serviceType: '',
        acreage: 1,
        scheduledDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [open, localMRs]);

  // Auto-select local MR from farmer
  useEffect(() => {
    if (selectedFarmer?.localMrId) {
      setFormData(prev => ({ ...prev, localMrId: selectedFarmer.localMrId || prev.localMrId }));
    }
  }, [selectedFarmer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farmerId || !formData.machineryId || !formData.serviceType || !formData.scheduledDate) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    if (!formData.localMrId) {
      toast({ title: 'Validation Error', description: 'Please select a Local MR', variant: 'destructive' });
      return;
    }

    // Create mechanisation DTO for Supabase
    const jobData: CreateMechanisationDto = {
      farmer_id: formData.farmerId,
      machinery_id: formData.machineryId,
      tot_id: user?.id || '',
      local_mr_id: formData.localMrId,
      service_type: formData.serviceType,
      scheduled_date: formData.scheduledDate,
      area_acres: formData.acreage,
      total_cost: total,
    };

    onSubmit(jobData);
    toast({ title: 'Booking Submitted', description: 'Sent for approval' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>New Mechanisation Booking</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 px-1">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mr-3" />
              <span>Loading...</span>
            </div>
          )}
          {hasError && (
            <div className="text-center py-12 text-destructive">Failed to load data.</div>
          )}
          {!isLoading && !hasError && (
            <>
              <div className="space-y-2">
                <Label>Select Local MR *</Label>
                <Select value={formData.localMrId} onValueChange={(value) => setFormData({ ...formData, localMrId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Local MR" />
                  </SelectTrigger>
                  <SelectContent>
                    {localMRs.map((mr) => (
                      <SelectItem key={mr.id} value={mr.id}>{mr.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Farmer *</Label>
                <Select value={formData.farmerId} onValueChange={(value) => setFormData({ ...formData, farmerId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={farmers.length === 0 ? 'No farmers' : 'Choose farmer'} />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map((farmer) => (
                      <SelectItem key={farmer.id} value={farmer.id}>{farmer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Machinery *</Label>
                <Select value={formData.machineryId} onValueChange={(value) => setFormData({ ...formData, machineryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose machinery" />
                  </SelectTrigger>
                  <SelectContent>
                    {machinery.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id} disabled={machine.status !== 'available'}>
                        <div className="flex items-center gap-2">
                          <Tractor className="w-4 h-4" />
                          <span>{machine.name}</span>
                          <Badge variant={machine.status === 'available' ? 'success' : 'secondary'} className="text-xs">
                            {machine.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{availableMachinery.length} of {machinery.length} available</p>
              </div>

              <div className="space-y-2">
                <Label>Service Type *</Label>
                <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Acreage *</Label>
                <Input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.acreage}
                  onChange={(e) => setFormData({ ...formData, acreage: parseFloat(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Date *</Label>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              {selectedMachinery && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm">Summary</h4>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="earth" className="flex-1" disabled={isLoading || !!hasError}>
              Submit Booking
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
