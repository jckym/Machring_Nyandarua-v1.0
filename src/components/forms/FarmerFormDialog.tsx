// src/components/FarmerFormDialog.tsx
import React, { useState, useEffect } from 'react';
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
import { Farmer, FarmerCategory, ValueChain, LocalMR } from '@/types';
import { AlertTriangle, Send, Loader2 } from 'lucide-react';
import { useLocalMRs } from '@/hooks/api/useLocalMRs';

// Full list matching the ValueChain type in types/index.ts
const valueChains: ValueChain[] = [
  'Maize',
  'Wheat',
  'Dairy',
  'Poultry',
  'Horticulture',
  'Coffee',
  'Tea',
  'Sugarcane',
  'Livestock',
  'Mixed Farming',
];

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

  const { data: localMRsData, isLoading: mrsLoading, error: mrsError } = useLocalMRs();
  const localMRs: LocalMR[] = Array.isArray(localMRsData) ? localMRsData : [];

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

  // Reset / populate form when dialog opens or farmer prop changes
  useEffect(() => {
    if (open) {
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
      } else {
        setFormData({
          name: '',
          phone: '',
          email: '',
          localMrId: '',
          subcounty: '',
          village: '',
          ward: '',
          county: '',
          valueChain: '' as ValueChain,
          farmerCategory: 'New',
        });
      }
    }
  }, [farmer, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Comprehensive validation – all required fields per Farmer type
    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.localMrId ||
      !formData.valueChain ||
      !formData.subcounty.trim() ||
      !formData.ward.trim() ||
      !formData.county.trim()
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    const selectedLocalMR = localMRs.find((mr) => mr.id === formData.localMrId);

    const submittedData: Partial<Farmer> = {
      ...(farmer || {}),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      localMrId: formData.localMrId,
      localMrName: selectedLocalMR?.name || '',
      location: {
        village: formData.village.trim(),
        ward: formData.ward.trim(),
        subcounty: formData.subcounty.trim(),
        county: formData.county.trim(),
      },
      valueChain: formData.valueChain,
      farmerCategory: formData.farmerCategory,
    };

    onSubmit(submittedData);

    toast({
      title: isEditing ? 'Edit Request Sent' : 'Farmer Added',
      description: isEditing
        ? 'Your edit request has been sent for approval.'
        : 'New farmer has been successfully added.',
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Farmer Details' : 'Add New Farmer'}</DialogTitle>
          {isEditing && (
            <DialogDescription className="flex items-start gap-2 text-orange-600">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Changes require Admin approval.
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 px-1">
          {mrsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading Local MRs...</span>
            </div>
          )}

          {mrsError && (
            <div className="text-center py-8 text-destructive">
              Failed to load Local MRs. Please try again later.
            </div>
          )}

          {!mrsLoading && !mrsError && (
            <>
              {/* Full Name */}
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. James Kiprotich"
                  disabled={isEditing} // Name usually immutable in edit requests
                />
              </div>

              {/* Local MR */}
              <div className="space-y-2">
                <Label>Local MR *</Label>
                <Select
                  value={formData.localMrId}
                  onValueChange={(value) => setFormData({ ...formData, localMrId: value })}
                  disabled={isEditing || localMRs.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={localMRs.length === 0 ? 'No Local MRs available' : 'Select Local MR'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {localMRs.map((mr) => (
                      <SelectItem key={mr.id} value={mr.id}>
                        {mr.name} ({mr.code})
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
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+2547XXXXXXXX"
                  disabled={isEditing}
                />
              </div>

              {/* Email (Optional) */}
              <div className="space-y-2">
                <Label>Email (Optional)</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isEditing}
                />
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Subcounty *</Label>
                  <Input
                    value={formData.subcounty}
                    onChange={(e) => setFormData({ ...formData, subcounty: e.target.value })}
                    disabled={isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>County *</Label>
                  <Input
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Ward *</Label>
                  <Input
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Village</Label>
                  <Input
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  />
                </div>
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

              {/* Farmer Category (optional but useful) */}
              <div className="space-y-2">
                <Label>Farmer Category</Label>
                <Select
                  value={formData.farmerCategory}
                  onValueChange={(value) => setFormData({ ...formData, farmerCategory: value as FarmerCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Existing">Existing</SelectItem>
                    <SelectItem value="Pioneer">Pioneer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isEditing ? 'default' : 'forest'}
              className="flex-1"
              disabled={mrsLoading || !!mrsError}
            >
              {isEditing ? (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Request Edit
                </>
              ) : (
                'Add Farmer'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
