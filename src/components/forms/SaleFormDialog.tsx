// src/components/SaleFormDialog.tsx
import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Sale, Farmer, Product } from '@/types';
import { useFarmers } from '@/hooks/api/useFarmers'; // Real hook
import { useProducts } from '@/hooks/api/useProducts'; // Real hook
import { Upload, Loader2 } from 'lucide-react';

interface SaleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (sale: Partial<Sale>) => void;
}

export function SaleFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: SaleFormDialogProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    farmerId: '',
    productId: '',
    quantity: 1,
    date: new Date().toISOString().split('T')[0],
  });

  // Real data from MongoDB
  const {
    data: farmers = [],
    isLoading: farmersLoading,
    error: farmersError,
  } = useFarmers();

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useProducts();

  const selectedProduct = useMemo(
    () => products.find((p: Product) => p._id === formData.productId),
    [formData.productId, products]
  );

  const selectedFarmer = useMemo(
    () => farmers.find((f: Farmer) => f._id === formData.farmerId),
    [formData.farmerId, farmers]
  );

  const total = selectedProduct ? selectedProduct.unitPrice * formData.quantity : 0;
  const commission = selectedProduct ? selectedProduct.commission * formData.quantity : 0;

  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

  const isLoading = farmersLoading || productsLoading;
  const hasError = farmersError || productsError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.farmerId || !formData.productId || formData.quantity < 1) {
      toast({
        title: 'Validation Error',
        description: 'Please select a farmer, product, and valid quantity',
        variant: 'destructive',
      });
      return;
    }

    if (selectedProduct && formData.quantity > selectedProduct.inStock) {
      toast({
        title: 'Insufficient Stock',
        description: `Only ${selectedProduct.inStock} units available`,
        variant: 'destructive',
      });
      return;
    }

    onSubmit({
      farmerId: formData.farmerId,
      farmerName: selectedFarmer?.name || '',
      productId: formData.productId,
      productName: selectedProduct?.name || '',
      quantity: formData.quantity,
      unitPrice: selectedProduct?.unitPrice || 0,
      totalPrice: total,
      commissionAmount: commission, // Real commission from product
      date: new Date(formData.date),
      status: 'pending-approval', // Requires manager approval
    });

    toast({
      title: 'Sale Recorded',
      description: 'Sale submitted for manager approval',
    });

    onOpenChange(false);
    setFormData({
      farmerId: '',
      productId: '',
      quantity: 1,
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-heading">Record New Sale</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mr-3" />
              <span>Loading farmers and products...</span>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="text-center py-12 text-destructive">
              Failed to load data. Please try again.
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
                        {farmer.name} - {farmer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Selection */}
              <div className="space-y-2">
                <Label>Select Product *</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product: Product) => (
                      <SelectItem
                        key={product._id}
                        value={product._id}
                        disabled={product.inStock === 0}
                      >
                        <div className="flex justify-between w-full">
                          <span>{product.name}</span>
                          <span className="text-muted-foreground ml-2">
                            {formatCurrency(product.unitPrice)} ({product.inStock} in stock)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedProduct?.inStock || 999}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Sale Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Upload Proof */}
              <div className="space-y-2">
                <Label>Proof of Sale (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload receipt or photo</p>
                </div>
              </div>

              {/* Sale Summary */}
              {selectedProduct && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-sm">Sale Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unit Price:</span>
                    <span>{formatCurrency(selectedProduct.unitPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span>{formData.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">TOT Commission:</span>
                    <span className="text-emerald-600 font-medium">
                      +{formatCurrency(commission)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-3 mt-3">
                    <span>Total Sale:</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    * Sale requires manager approval. Commission credited upon completion.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 pb-2 sticky bottom-0 bg-background border-t -mx-4 sm:-mx-6 px-4 sm:px-6 mt-auto">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="wheat" className="flex-1" disabled={isLoading || hasError}>
              Submit Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
