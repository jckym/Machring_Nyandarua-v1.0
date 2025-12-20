// src/components/VisitFormDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Visit, Farmer } from '@/types';
import { useFarmers } from '@/hooks/api/useFarmers'; // Real hook
import { Upload, MapPin, Loader2, AlertCircle } from 'lucide-react';

interface VisitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (visit: Partial<Visit>) => void;
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

export function VisitFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: VisitFormDialogProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    farmerId: '',
    purpose: '',
    notes: '',
  });

  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLoadingGps, setIsLoadingGps] = useState(false);

  // Real farmers from MongoDB
  const {
    data: farmers = [],
    isLoading: farmersLoading,
    error: farmersError,
  } = useFarmers();

  // GPS Location Capture
  const captureLocation = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation not supported');
      return;
    }

    setIsLoadingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoadingGps(false);
        toast({
          title: 'Location Captured',
          description: 'GPS coordinates recorded successfully',
        });
      },
      (error) => {
        let message = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        setGpsError(message);
        setIsLoadingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    if (open) {
      captureLocation();
      // Reset form
      setFormData({ farmerId: '', purpose: '', notes: '' });
      setGpsLocation(null);
      setGpsError(null);
    }
  }, [open]);

  const selectedFarmer = farmers.find((f: Farmer) => f._id === formData.farmerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.farmerId || !formData.purpose || !formData.notes.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please select a farmer, purpose, and add visit notes',
        variant: 'destructive',
      });
      return;
    }

    onSubmit({
      farmerId: formData.farmerId,
      farmerName: selectedFarmer?.name || '',
      purpose: formData.purpose,
      notes: formData.notes.trim(),
      date: new Date(),
      gpsLocation: gpsLocation || undefined,
    });

    toast({
      title: 'Visit Logged',
      description: `Visit to ${selectedFarmer?.name} recorded successfully`,
    });

    onOpenChange(false);
  };

  const isLoading = farmersLoading || isLoadingGps;
  const hasError = farmersError || gpsError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-heading text-xl">Log Field Visit</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto space-y-5 -mx-4 sm:-mx-6 px-4 sm:px-6"
        >
          {/* GPS Status */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isLoadingGps ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm">Capturing GPS location...</span>
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
                    <div>
                      <p className="text-sm font-medium text-destructive">GPS Error</p>
                      <p className="text-xs text-muted-foreground">{gpsError}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Location not captured</span>
                  </>
                )}
              </div>
              {!isLoadingGps && !gpsLocation && (
                <Button size="sm" variant="ghost" onClick={captureLocation}>
                  Retry
                </Button>
              )}
            </div>
          </div>

          {/* Loading/Error State for Farmers */}
          {farmersLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading farmers...</span>
            </div>
          )}

          {farmersError && (
            <div className="text-center py-8 text-destructive">
              Failed to load farmers list
            </div>
          )}

          {/* Form Fields */}
          {!isLoading && !hasError && (
            <>
              {/* Farmer Selection */}
              <div className="space-y-2">
                <Label>Select Farmer *</Label>
                <Select
                  value={formData.farmerId}
                  onValueChange={(value) => setFormData({ ...formData, farmerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={farmers.length === 0 ? 'No farmers available' : 'Choose a farmer'} />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map((farmer: Farmer) => (
                      <SelectItem key={farmer._id} value={farmer._id}>
                        {farmer.name} - {farmer.location?.village || 'No village'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Visit Purpose */}
              <div className="space-y-2">
                <Label>Purpose of Visit *</Label>
                <Select
                  value={formData.purpose}
                  onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {visitPurposes.map((purpose) => (
                      <SelectItem key={purpose} value={purpose}>
                        {purpose}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Visit Notes *</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Describe observations, recommendations, farmer concerns, and next steps..."
                  rows={5}
                  required
                />
              </div>

              {/* Upload Photos */}
              <div className="space-y-2">
                <Label>Photos (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/20">
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Click to upload visit photos</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</p>
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-sm text-muted-foreground text-center">
                Visit will be recorded at: {new Date().toLocaleString('en-KE')}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 pb-2 sticky bottom-0 bg-background border-t -mx-4 sm:-mx-6 px-4 sm:px-6 mt-auto">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="earth"
              className="flex-1"
              disabled={isLoading || hasError || farmers.length === 0}
            >
              Log Visit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
