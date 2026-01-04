// src/components/forms/VisitFormDialog.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useFarmers } from '@/hooks/api/useFarmers';
import { useLocalMRs } from '@/hooks/api/useLocalMRs';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CreateVisitDto } from '@/hooks/api/useVisits';

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

  useEffect(() => {
    if (open) {
      captureLocation();
      setFormData({
        farmerId: '',
        localMrId: localMRs[0]?.id || '',
        purposes: [],
        notes: '',
      });
      setGpsLocation(null);
      setGpsError(null);
    }
  }, [open, localMRs]);

  const selectedFarmer = farmers.find((f) => f.id === formData.farmerId);

  // Auto-select local MR from farmer
  useEffect(() => {
    if (selectedFarmer?.localMrId) {
      setFormData(prev => ({ ...prev, localMrId: selectedFarmer.localMrId || prev.localMrId }));
    }
  }, [selectedFarmer]);

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
      <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Log Field Visit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 px-1">
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
                <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-muted/30">
                  {visitPurposes.map((purpose) => (
                    <div 
                      key={purpose}
                      className="flex items-center space-x-2 cursor-pointer"
                      onClick={() => handlePurposeToggle(purpose)}
                    >
                      <Checkbox
                        checked={formData.purposes.includes(purpose)}
                        onCheckedChange={() => handlePurposeToggle(purpose)}
                      />
                      <span className="text-sm">{purpose}</span>
                    </div>
                  ))}
                </div>
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

          <div className="flex gap-3 pt-4">
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
