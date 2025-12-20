import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Farmer, FarmerCategory, ValueChain } from '@/types';
import { mockLocalMRs, valueChains } from '@/data/mockData';
import { AlertTriangle, Send } from 'lucide-react';

interface FarmerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmer?: Farmer | null;
  onSubmit: (farmer: Partial<Farmer>) => void;
}

export function FarmerFormDialog({
  open,
  onOpenChange,
  farmer,
  onSubmit,
}: FarmerFormDialogProps) {
  const { toast } = useToast();
  const isEditing = !!farmer;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    localMrId: '',
    subcounty: '',
    village: '',
    ward: '',
    county: '',
    valueChain: '' as ValueChain,
    farmerCategory: 'New' as FarmerCategory,
  });

  // ✅ Sync form when farmer changes
  useEffect(() => {
    if (farmer) {
      setFormData({
        name: farmer.name || '',
        phone: farmer.phone || '',
        email: farmer.email || '',
        localMrId: farmer.localMrId || '',
        subcounty: farmer.location?.subcounty || '',
        village: farmer.location?.village || '',
        ward: farmer.location?.ward || '',
        county: farmer.location?.county || '',
        valueChain: farmer.valueChain,
        farmerCategory: farmer.farmerCategory,
      });
    }
  }, [farmer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.phone ||
      !formData.localMrId ||
      !formData.valueChain ||
      !formData.subcounty
    ) {
      toast({
        title: 'Validation Error',
        description:
          'Please fill all required fields (Name, Phone, Local MR, Subcounty, Value Chain)',
        variant: 'destructive',
      });
      return;
    }

    const selectedLocalMR = mockLocalMRs.find(
      (mr) => mr.id === formData.localMrId
    );

    onSubmit({
      ...(farmer || {}),
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      localMrId: formData.localMrId,
      localMrName: selectedLocalMR?.name || '',
      location: {
        village: formData.village,
        ward: formData.ward,
        subcounty: formData.subcounty,
        county: formData.county || selectedLocalMR?.subcounty || '',
      },
      valueChain: formData.valueChain,
      farmerCategory: formData.farmerCategory,
    });

    toast({
      title: 'Request Sent',
      description:
        'Your edit request has been sent to Admin for approval.',
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-heading">
            {isEditing ? 'Farmer Details' : 'Add New Farmer'}
          </DialogTitle>

          {isEditing && (
            <DialogDescription className="flex items-start gap-2 text-warning">
              <AlertTriangle className="w-4 h-4 mt-0.5" />
              Editing farmer details requires Admin approval.
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
          {/* Name */}
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              value={formData.name}
              disabled={isEditing}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* Local MR */}
          <div className="space-y-2">
            <Label>Local MR *</Label>
            <Select
              value={formData.localMrId}
              disabled={isEditing}
              onValueChange={(value) =>
                setFormData({ ...formData, localMrId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Local MR" />
              </SelectTrigger>
              <SelectContent>
                {mockLocalMRs.map((mr) => (
                  <SelectItem key={mr.id} value={mr.id}>
                    {mr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input
              value={formData.phone}
              disabled={isEditing}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email (Optional)</Label>
            <Input
              value={formData.email}
              disabled={isEditing}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Subcounty *</Label>
              <Input
                value={formData.subcounty}
                disabled={isEditing}
                onChange={(e) =>
                  setFormData({ ...formData, subcounty: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Village</Label>
              <Input
                value={formData.village}
                disabled={isEditing}
                onChange={(e) =>
                  setFormData({ ...formData, village: e.target.value })
                }
              />
            </div>
          </div>

          {/* Value Chain */}
          <div className="space-y-2">
            <Label>Value Chain *</Label>
            <Select
              value={formData.valueChain}
              disabled={isEditing}
              onValueChange={(value) =>
                setFormData({ ...formData, valueChain: value as ValueChain })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select value chain" />
              </SelectTrigger>
              <SelectContent>
                {valueChains.map((vc) => (
                  <SelectItem key={vc} value={vc}>
                    {vc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions - Sticky on mobile */}
          <div className="flex gap-3 pt-4 pb-2 sticky bottom-0 bg-background border-t -mx-4 sm:-mx-6 px-4 sm:px-6 mt-auto">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>

            {isEditing ? (
              <Button type="submit" className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Request Edit Approval
              </Button>
            ) : (
              <Button type="submit" variant="forest" className="flex-1">
                Add Farmer
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
