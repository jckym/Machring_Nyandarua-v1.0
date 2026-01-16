// src/components/forms/VisitFormDialog.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useFarmersAndTots } from '@/hooks/api/useFarmersAndTots';
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
  const [showTots, setShowTots] = useState(() => {
    const stored = localStorage.getItem('showTotsInVisits');
    return stored !== null ? JSON.parse(stored) : true;
  });

  // Persist showTots toggle to localStorage
  React.useEffect(() => {
    localStorage.setItem('showTotsInVisits', JSON.stringify(showTots));
  }, [showTots]);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLoadingGps, setIsLoadingGps] = useState(false);

  const { data: allFarmersAndTots = [], isLoading: farmersLoading, error: farmersError } = useFarmersAndTots();
  const { data: localMRs = [] } = useLocalMRs();

  // Filter by selected Local MR and TOT visibility toggle
  const filteredList = React.useMemo(() => {
    let list = allFarmersAndTots;
    
    // Filter by Local MR if selected
    if (formData.localMrId) {
      list = list.filter(item => item.local_mr_id === formData.localMrId);
    }
    
    // Filter out TOTs if toggle is off
    if (!showTots) {
      list = list.filter(item => item.type !== 'tot');
    }
    
    return list;
  }, [allFarmersAndTots, formData.localMrId, showTots]);

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

  const selectedFarmer = allFarmersAndTots.find((f) => f.id === formData.farmerId);
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

    // Determine participant type from selected farmer/TOT
    const participantType = selectedFarmer?.type || 'farmer';

    // Create visit DTO for Supabase - combine purposes into comma-separated string
    const visitData: CreateVisitDto = {
      participant_type: participantType,
      farmer_id: participantType === 'farmer' ? formData.farmerId : undefined,
      profile_id: participantType === 'tot' ? formData.farmerId : undefined,
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
                <Select 
                  value={formData.localMrId} 
                  onValueChange={(value) => setFormData({ ...formData, localMrId: value, farmerId: '' })}
                >
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
                <div className="flex items-center justify-between">
                  <Label>Select Farmer / TOT *</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="show-tots" className="text-xs text-muted-foreground cursor-pointer">
                      Include TOTs
                    </Label>
                    <Switch
                      id="show-tots"
                      checked={showTots}
                      onCheckedChange={setShowTots}
                    />
                  </div>
                </div>
                <Select value={formData.farmerId} onValueChange={(value) => setFormData({ ...formData, farmerId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={filteredList.length === 0 ? 'No farmers or TOTs in this MR' : 'Choose farmer or TOT'} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredList.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
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
                    <ScrollArea className="h-[250px] touch-pan-y">
                      <div className="p-2 space-y-1">
                        {visitPurposes.map((purpose) => (
                          <div
                            key={purpose}
                            className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted cursor-pointer active:bg-muted/80"
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
                    </ScrollArea>
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

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="earth"
              className="flex-1"
              disabled={farmersLoading || !!farmersError || filteredList.length === 0}
            >
              Log Visit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
