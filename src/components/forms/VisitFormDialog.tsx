import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Visit, Farmer } from '@/types';
import { useFarmers, useApiWithFallback } from '@/hooks/api';
import { Upload, MapPin, Loader2 } from 'lucide-react';

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
];

export function VisitFormDialog({ open, onOpenChange, onSubmit }: VisitFormDialogProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    farmerId: '',
    purpose: '',
    notes: '',
  });

  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingGps, setIsLoadingGps] = useState(false);

  // API hooks with fallback
  const farmersQuery = useFarmers();
  const { data: farmers } = useApiWithFallback(farmersQuery, [] as Farmer[]);

  useEffect(() => {
    if (open && 'geolocation' in navigator) {
      setIsLoadingGps(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoadingGps(false);
        },
        (error) => {
          console.error('GPS Error:', error);
          setIsLoadingGps(false);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [open]);

  const selectedFarmer = (farmers as Farmer[]).find(f => f.id === formData.farmerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.farmerId || !formData.purpose || !formData.notes) {
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
      purpose: formData.purpose,
      notes: formData.notes,
      date: new Date(),
      gpsLocation: gpsLocation || undefined,
    });

    toast({
      title: 'Visit Logged',
      description: 'Field visit has been recorded successfully',
    });

    onOpenChange(false);
    setFormData({
      farmerId: '',
      purpose: '',
      notes: '',
    });
    setGpsLocation(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-heading">Log Field Visit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
          {/* GPS Status */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            {isLoadingGps ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Getting GPS location...</span>
              </>
            ) : gpsLocation ? (
              <>
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  Location: {gpsLocation.lat.toFixed(4)}, {gpsLocation.lng.toFixed(4)}
                </span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">GPS location not available</span>
              </>
            )}
          </div>

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
              placeholder="Describe the visit activities, observations, and recommendations..."
              rows={4}
            />
          </div>

          {/* Upload Photos */}
          <div className="space-y-2">
            <Label>Photos (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload photos</p>
            </div>
          </div>

          {/* Timestamp Display */}
          <div className="text-xs text-muted-foreground">
            Visit timestamp: {new Date().toLocaleString('en-KE')}
          </div>

          {/* Actions - Sticky on mobile */}
          <div className="flex gap-3 pt-4 pb-2 sticky bottom-0 bg-background border-t -mx-4 sm:-mx-6 px-4 sm:px-6 mt-auto">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="earth" className="flex-1">
              Log Visit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
