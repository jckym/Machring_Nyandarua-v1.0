// src/components/SaleFormDialog.tsx - Simplified
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sale, Farmer, Product } from '@/types';
import { useFarmers } from '@/hooks/api/useFarmers';
import { useProducts } from '@/hooks/api/useProducts';
import { Loader2 } from 'lucide-react';

interface SaleFormDialogProps { open: boolean; onOpenChange: (open: boolean) => void; onSubmit: (sale: Partial<Sale>) => void; }

export function SaleFormDialog({ open, onOpenChange, onSubmit }: SaleFormDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ farmerId: '', productId: '', quantity: 1, date: new Date().toISOString().split('T')[0] });
  const { data: farmers = [], isLoading: farmersLoading, error: farmersError } = useFarmers();
  const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts();

  const selectedProduct = useMemo(() => products.find((p) => p.id === formData.productId), [formData.productId, products]);
  const selectedFarmer = useMemo(() => farmers.find((f) => f.id === formData.farmerId), [formData.farmerId, farmers]);
  const total = selectedProduct ? selectedProduct.unitPrice * formData.quantity : 0;
  const commission = selectedProduct ? selectedProduct.commission * formData.quantity : 0;
  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;
  const isLoading = farmersLoading || productsLoading;
  const hasError = farmersError || productsError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farmerId || !formData.productId || formData.quantity < 1) {
      toast({ title: 'Validation Error', description: 'Please select farmer, product, and quantity', variant: 'destructive' });
      return;
    }
    onSubmit({
      farmerId: formData.farmerId, farmerName: selectedFarmer?.name || '', productId: formData.productId,
      productName: selectedProduct?.name || '', quantity: formData.quantity, unitPrice: selectedProduct?.unitPrice || 0,
      total, commissionAmount: commission, date: new Date(formData.date), status: 'pending',
    });
    toast({ title: 'Sale Recorded', description: 'Sale submitted for approval' });
    onOpenChange(false);
    setFormData({ farmerId: '', productId: '', quantity: 1, date: new Date().toISOString().split('T')[0] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader><DialogTitle>Record New Sale</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 px-1">
          {isLoading && <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin mr-3" /><span>Loading...</span></div>}
          {hasError && <div className="text-center py-12 text-destructive">Failed to load data.</div>}
          {!isLoading && !hasError && (<>
            <div className="space-y-2"><Label>Select Farmer *</Label>
              <Select value={formData.farmerId} onValueChange={(value) => setFormData({ ...formData, farmerId: value })}>
                <SelectTrigger><SelectValue placeholder={farmers.length === 0 ? 'No farmers' : 'Choose farmer'} /></SelectTrigger>
                <SelectContent>{farmers.map((farmer) => <SelectItem key={farmer.id} value={farmer.id}>{farmer.name} - {farmer.phone}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Select Product *</Label>
              <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                <SelectTrigger><SelectValue placeholder="Choose product" /></SelectTrigger>
                <SelectContent>{products.map((product) => <SelectItem key={product.id} value={product.id} disabled={product.inStock === 0}>{product.name} - {formatCurrency(product.unitPrice)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Quantity *</Label><Input type="number" min="1" max={selectedProduct?.inStock || 999} value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} /></div>
            <div className="space-y-2"><Label>Sale Date *</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} max={new Date().toISOString().split('T')[0]} /></div>
            {selectedProduct && <div className="bg-muted/50 rounded-lg p-4 space-y-2"><h4 className="font-medium text-sm">Summary</h4><div className="flex justify-between text-sm"><span>Total:</span><span className="font-semibold">{formatCurrency(total)}</span></div><div className="flex justify-between text-sm"><span>Commission:</span><span className="text-emerald-600">+{formatCurrency(commission)}</span></div></div>}
          </>)}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="wheat" className="flex-1" disabled={isLoading || !!hasError}>Submit Sale</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
