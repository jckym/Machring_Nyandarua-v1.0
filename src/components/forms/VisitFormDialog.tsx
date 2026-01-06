// src/components/forms/VisitFormDialog.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useFarmers } from '@/hooks/api/useFarmers';
import { useLocalMRs } from '@/hooks/api/useLocalMRs';
import { MapPin, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CreateVisitDto } from '@/hooks/api/useVisits';
import { cn } from '@/lib/utils';

interface VisitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (visit: CreateVisitDto) => void;
}

const visitPurposes = [
  'Follow-up',
  'Soil Testing',
  'Crop Monitoring',
  'Product Delivery',
  'Training',
  'Group Meeting',
  'Problem Solving',
  'New Registration',
] as const;

export function VisitFormDialog({ open, onOpenChange, onSubmit }: VisitFormDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    farmerId: '',
    localMrId: '',
    purposes: [] as string[],
    notes: '',
  });
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLoadingGps, setIsLoadingGps] = useState(false);

  const { data: farmers = [], isLoading: farmersLoading, error: farmersError } = useFarmers();
  const { data: localMRs = [] } = useLocalMRs();

  const captureLocation = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation not supported');
      return;
    }
    setIsLoadingGps(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLoadingGps(false);
        toast({ title: 'Location Captured' });
      },
      (error) => {
        setGpsError(error.message);
        setIsLoadingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Reset form when dialog opens - only depend on open state
  useEffect(() => {
    if (open) {
      captureLocation();
      setFormData({
        farmerId: '',
        localMrId: '',
        purposes: [],
        notes: '',
      });
      setGpsLocation(null);
      setGpsError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Set default local MR when data loads - use ref to track if default has been set
  const defaultLocalMrSet = React.useRef(false);
  
  useEffect(() => {
    if (open && localMRs.length > 0 && !defaultLocalMrSet.current) {
      defaultLocalMrSet.current = true;
      setFormData(prev => ({ ...prev, localMrId: localMRs[0]?.id || '' }));
    }
    if (!open) {
      defaultLocalMrSet.current = false;
    }
  }, [open, localMRs.length]);

  const selectedFarmer = farmers.find((f) => f.id === formData.farmerId);
  const selectedFarmerLocalMrId = selectedFarmer?.local_mr_id;

  // Auto-select local MR from farmer - use stable primitive dependency
  useEffect(() => {
    if (selectedFarmerLocalMrId) {
      setFormData(prev => {
        if (prev.localMrId !== selectedFarmerLocalMrId) {
          return { ...prev, localMrId: selectedFarmerLocalMrId };
        }
        return prev;
      });
    }
  }, [selectedFarmerLocalMrId]);

  const handlePurposeToggle = (purpose: string) => {
    setFormData(prev => ({
      ...prev,
      purposes: prev.purposes.includes(purpose)
        ? prev.purposes.filter(p => p !== purpose)
        : [...prev.purposes, purpose]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farmerId || formData.purposes.length === 0 || !formData.notes.trim()) {
      toast({ title: 'Validation Error', description: 'Please fill all required fields (Farmer, at least one Purpose, and Notes)', variant: 'destructive' });
      return;
    }

    // Create visit DTO for Supabase - combine purposes into comma-separated string
    const visitData: CreateVisitDto = {
      farmer_id: formData.farmerId,
      tot_id: user?.id || '',
      local_mr_id: formData.localMrId || undefined,
      purpose: formData.purposes.join(', '),
      notes: formData.notes.trim(),
      visit_date: new Date().toISOString(),
    };

    onSubmit(visitData);
    toast({ title: 'Visit Logged', description: `Visit to ${selectedFarmer?.name} recorded` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Log Field Visit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 px-1 pb-2">
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-3">
              {isLoadingGps ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Capturing GPS...</span>
                </>
              ) : gpsLocation ? (
                <>
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium">Location Captured</p>
                    <p className="text-xs text-muted-foreground">
                      {gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </>
              ) : gpsError ? (
                <>
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <p className="text-sm text-destructive">{gpsError}</p>
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Location not captured</span>
                </>
              )}
              {!isLoadingGps && !gpsLocation && (
                <Button size="sm" variant="ghost" onClick={captureLocation}>
                  Retry
                </Button>
              )}
            </div>
          </div>

          {farmersLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading farmers...</span>
            </div>
          )}

          {farmersError && (
            <div className="text-center py-8 text-destructive">Failed to load farmers</div>
          )}

          {!farmersLoading && !farmersError && (
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
                      <SelectItem key={farmer.id} value={farmer.id}>
                        {farmer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Purpose * (select one or more)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between font-normal",
                        formData.purposes.length === 0 && "text-muted-foreground"
                      )}
                    >
                      {formData.purposes.length > 0
                        ? formData.purposes.length === 1
                          ? formData.purposes[0]
                          : `${formData.purposes.length} purposes selected`
                        : "Select purposes"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-popover z-50" align="start">
                    <div className="p-2 space-y-1 max-h-[200px] overflow-y-auto">
                      {visitPurposes.map((purpose) => (
                        <div
                          key={purpose}
                          className={cn(
                            "p-2 rounded-md cursor-pointer text-sm transition-colors",
                            formData.purposes.includes(purpose)
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                          onClick={() => handlePurposeToggle(purpose)}
                        >
                          {purpose}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                {formData.purposes.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {formData.purposes.join(', ')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Notes *</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Visit observations..."
                  rows={5}
                  required
                />
              </div>
            </>
          )}

          <div className="sticky bottom-0 bg-background pt-4 pb-2 flex gap-3 border-t mt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="earth"
              className="flex-1"
              disabled={farmersLoading || !!farmersError || farmers.length === 0}
            >
              Log Visit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
