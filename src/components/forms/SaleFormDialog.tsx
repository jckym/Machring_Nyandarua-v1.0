// src/components/forms/SaleFormDialog.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFarmers } from '@/hooks/api/useFarmers';
import { useProducts } from '@/hooks/api/useProducts';
import { useLocalMRs } from '@/hooks/api/useLocalMRs';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CreateSaleDto } from '@/hooks/api/useSales';

interface SaleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (sale: CreateSaleDto) => void;
}

export function SaleFormDialog({ open, onOpenChange, onSubmit }: SaleFormDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    farmerId: '',
    productId: '',
    localMrId: '',
    quantity: 1,
    date: new Date().toISOString().split('T')[0],
  });

  const { data: farmers = [], isLoading: farmersLoading, error: farmersError, refetch: refetchFarmers } = useFarmers();
  const { data: products = [], isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts();
  const { data: localMRs = [] } = useLocalMRs();

  const selectedProduct = useMemo(() => products.find((p) => p.id === formData.productId), [formData.productId, products]);
  const selectedFarmer = useMemo(() => farmers.find((f) => f.id === formData.farmerId), [formData.farmerId, farmers]);

  const total = selectedProduct ? selectedProduct.unitPrice * formData.quantity : 0;
  const commission = selectedProduct ? selectedProduct.commission * formData.quantity : 0;
  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;
  const isLoading = farmersLoading || productsLoading;
  const hasError = farmersError || productsError;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        farmerId: '',
        productId: '',
        localMrId: localMRs[0]?.id || '',
        quantity: 1,
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [open, localMRs]);

  // Auto-select local MR from farmer
  useEffect(() => {
    if (selectedFarmer?.localMrId) {
      setFormData(prev => ({ ...prev, localMrId: selectedFarmer.localMrId || prev.localMrId }));
    }
  }, [selectedFarmer]);

  // Validate quantity against stock
  useEffect(() => {
    if (selectedProduct && formData.quantity > selectedProduct.inStock) {
      setFormData(prev => ({ ...prev, quantity: Math.max(1, selectedProduct.inStock) }));
    }
  }, [selectedProduct, formData.quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.farmerId || !formData.productId || formData.quantity < 1) {
      toast({ title: 'Validation Error', description: 'Please select farmer, product, and quantity', variant: 'destructive' });
      return;
    }

    if (!formData.localMrId) {
      toast({ title: 'Validation Error', description: 'Please select a Local MR', variant: 'destructive' });
      return;
    }

    if (formData.quantity > (selectedProduct?.inStock || 0)) {
      toast({ title: 'Stock Error', description: 'Quantity exceeds available stock', variant: 'destructive' });
      return;
    }

    // Create sale DTO for Supabase
    const saleData: CreateSaleDto = {
      farmer_id: formData.farmerId,
      product_id: formData.productId,
      tot_id: user?.id || '',
      local_mr_id: formData.localMrId,
      quantity: formData.quantity,
    };

    try {
      onSubmit(saleData);
      onOpenChange(false);
    } catch {
      toast({ title: 'Submission Error', description: 'Failed to submit sale', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 px-1">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mr-3" />
              <span>Loading...</span>
            </div>
          )}
          {farmersError && (
            <div className="text-center py-12 text-destructive">
              Failed to load farmers. <Button onClick={() => refetchFarmers()}>Retry</Button>
            </div>
          )}
          {productsError && (
            <div className="text-center py-12 text-destructive">
              Failed to load products. <Button onClick={() => refetchProducts()}>Retry</Button>
            </div>
          )}
          {!isLoading && !hasError && (
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
                        {farmer.name} - {farmer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Product *</Label>
                <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id} disabled={product.inStock === 0}>
                        {product.name} - {formatCurrency(product.unitPrice)} ({product.inStock} in stock)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  max={selectedProduct?.inStock || 999}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Sale Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {selectedProduct && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm">Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-semibold">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Commission:</span>
                    <span className="text-emerald-600">+{formatCurrency(commission)}</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="wheat" className="flex-1" disabled={isLoading || !!hasError}>
              Submit Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
