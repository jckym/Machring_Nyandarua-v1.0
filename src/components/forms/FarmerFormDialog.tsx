import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Farmer, FarmerCategory, ValueChain } from '@/types';
import { mockLocalMRs, valueChains } from '@/data/mockData';

interface FarmerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmer?: Farmer | null;
  onSubmit: (farmer: Partial<Farmer>) => void;
}

export function FarmerFormDialog({ open, onOpenChange, farmer, onSubmit }: FarmerFormDialogProps) {
  const { toast } = useToast();
  const isEditing = !!farmer;

  const [formData, setFormData] = useState({
    name: farmer?.name || '',
    phone: farmer?.phone || '',
    email: farmer?.email || '',
    localMrId: farmer?.localMrId || '',
    subcounty: farmer?.location?.subcounty || '',
    village: farmer?.location?.village || '',
    ward: farmer?.location?.ward || '',
    county: farmer?.location?.county || '',
    farmingActivity: farmer?.farmingActivity || '',
    valueChain: farmer?.valueChain || '' as ValueChain,
    farmerCategory: farmer?.farmerCategory || 'New' as FarmerCategory,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.localMrId || !formData.valueChain || !formData.subcounty) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Name, Phone, Local MR, Subcounty, Value Chain)',
        variant: 'destructive',
      });
      return;
    }

    const selectedLocalMR = mockLocalMRs.find(mr => mr.id === formData.localMrId);

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
        subcounty: formData.subcounty || selectedLocalMR?.subcounty || '',
        county: formData.county || selectedLocalMR?.county || '',
      },
      farmingActivity: formData.farmingActivity,
      valueChain: formData.valueChain,
      farmerCategory: formData.farmerCategory,
    });

    toast({
      title: isEditing ? 'Farmer Updated' : 'Farmer Added',
      description: `${formData.name} has been ${isEditing ? 'updated' : 'registered'} successfully`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEditing ? 'Edit Farmer' : 'Add New Farmer'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter farmer's full name"
            />
          </div>

          {/* Local MR (Required) */}
          <div className="space-y-2">
            <Label>Local MR *</Label>
            <Select
              value={formData.localMrId}
              onValueChange={(value) => setFormData({ ...formData, localMrId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Local MR" />
              </SelectTrigger>
              <SelectContent>
                {mockLocalMRs.map((mr) => (
                  <SelectItem key={mr.id} value={mr.id}>
                    {mr.name} ({mr.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+254..."
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="farmer@email.com"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="subcounty">Subcounty *</Label>
              <Input
                id="subcounty"
                value={formData.subcounty}
                onChange={(e) => setFormData({ ...formData, subcounty: e.target.value })}
                placeholder="Subcounty"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="village">Village</Label>
              <Input
                id="village"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="Village"
              />
            </div>
          </div>

          {/* Farming Activity */}
          <div className="space-y-2">
            <Label htmlFor="farmingActivity">Farming Activity</Label>
            <Input
              id="farmingActivity"
              value={formData.farmingActivity}
              onChange={(e) => setFormData({ ...formData, farmingActivity: e.target.value })}
              placeholder="e.g., Crop Production, Mixed Farming"
            />
          </div>

          {/* Value Chain */}
          <div className="space-y-2">
            <Label>Value Chain *</Label>
            <Select
              value={formData.valueChain}
              onValueChange={(value) => setFormData({ ...formData, valueChain: value as ValueChain })}
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

          {/* Farmer Category */}
          <div className="space-y-2">
            <Label>Farmer Type *</Label>
            <Select
              value={formData.farmerCategory}
              onValueChange={(value) => setFormData({ ...formData, farmerCategory: value as FarmerCategory })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Existing">Existing</SelectItem>
                <SelectItem value="Pioneer">Pioneer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="forest" className="flex-1">
              {isEditing ? 'Update Farmer' : 'Add Farmer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}