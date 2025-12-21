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

const valueChains: ValueChain[] = [
  'Maize', 'Wheat', 'Dairy', 'Poultry', 'Horticulture',
  'Coffee', 'Tea', 'Sugarcane', 'Livestock', 'Mixed Farming'
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

  useEffect(() => {
    if (farmer && open) {
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
    } else if (!farmer && open) {
      setFormData({
        name: '', phone: '', email: '', localMrId: '', subcounty: '', village: '', ward: '', county: '',
        valueChain: '' as ValueChain, farmerCategory: 'New',
      });
    }
  }, [farmer, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.localMrId || !formData.valueChain || !formData.subcounty) {
      toast({ title: 'Validation Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    const selectedLocalMR = localMRs.find(mr => mr.id === formData.localMrId);
    onSubmit({
      ...(farmer || {}),
      name: formData.name, phone: formData.phone, email: formData.email || undefined,
      localMrId: formData.localMrId, localMrName: selectedLocalMR?.name || '',
      location: { village: formData.village, ward: formData.ward, subcounty: formData.subcounty, county: formData.county },
      valueChain: formData.valueChain, farmerCategory: formData.farmerCategory,
    });
    toast({ title: isEditing ? 'Edit Request Sent' : 'Farmer Added', description: isEditing ? 'Request sent for approval.' : 'New farmer added.' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit Farmer Details' : 'Add New Farmer'}</DialogTitle>
          {isEditing && <DialogDescription className="flex items-start gap-2 text-orange-600"><AlertTriangle className="w-4 h-4" />Requires Admin approval.</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 px-1">
          {mrsLoading && <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /><span className="ml-2">Loading...</span></div>}
          {mrsError && <div className="text-center py-8 text-destructive">Failed to load Local MRs.</div>}
          {!mrsLoading && !mrsError && (<>
            <div className="space-y-2"><Label>Full Name *</Label><Input value={formData.name} disabled={isEditing} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. James Kiprotich" /></div>
            <div className="space-y-2"><Label>Local MR *</Label>
              <Select value={formData.localMrId} disabled={isEditing || localMRs.length === 0} onValueChange={(value) => setFormData({ ...formData, localMrId: value })}>
                <SelectTrigger><SelectValue placeholder={localMRs.length === 0 ? 'No Local MRs' : 'Select Local MR'} /></SelectTrigger>
                <SelectContent>{localMRs.map((mr) => <SelectItem key={mr.id} value={mr.id}>{mr.name} ({mr.code})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Phone *</Label><Input value={formData.phone} disabled={isEditing} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+2547XXXXXXXX" /></div>
            <div className="space-y-2"><Label>Email (Optional)</Label><Input type="email" value={formData.email} disabled={isEditing} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Subcounty *</Label><Input value={formData.subcounty} disabled={isEditing} onChange={(e) => setFormData({ ...formData, subcounty: e.target.value })} /></div>
              <div className="space-y-2"><Label>Village</Label><Input value={formData.village} disabled={isEditing} onChange={(e) => setFormData({ ...formData, village: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Value Chain *</Label>
              <Select value={formData.valueChain} disabled={isEditing} onValueChange={(value) => setFormData({ ...formData, valueChain: value as ValueChain })}>
                <SelectTrigger><SelectValue placeholder="Select value chain" /></SelectTrigger>
                <SelectContent>{valueChains.map((vc) => <SelectItem key={vc} value={vc}>{vc}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </>)}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant={isEditing ? 'default' : 'forest'} className="flex-1" disabled={mrsLoading || !!mrsError}>
              {isEditing ? <><Send className="w-4 h-4 mr-2" />Request Edit</> : 'Add Farmer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
