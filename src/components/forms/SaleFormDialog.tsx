import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sale } from '@/types';
import { mockFarmers, mockProducts } from '@/data/mockData';
import { Upload } from 'lucide-react';

interface SaleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (sale: Partial<Sale>) => void;
}

export function SaleFormDialog({ open, onOpenChange, onSubmit }: SaleFormDialogProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    farmerId: '',
    productId: '',
    quantity: 1,
    date: new Date().toISOString().split('T')[0],
  });

  const selectedProduct = useMemo(
    () => mockProducts.find(p => p.id === formData.productId),
    [formData.productId]
  );

  const selectedFarmer = useMemo(
    () => mockFarmers.find(f => f.id === formData.farmerId),
    [formData.farmerId]
  );

  const total = selectedProduct ? selectedProduct.unitPrice * formData.quantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.farmerId || !formData.productId || formData.quantity < 1) {
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
      productId: formData.productId,
      productName: selectedProduct?.name || '',
      quantity: formData.quantity,
      unitPrice: selectedProduct?.unitPrice || 0,
      total,
      commissionAmount: 0, // Commission is set by admin and applied when completed
      date: new Date(formData.date),
      status: 'pending',
    });

    toast({
      title: 'Sale Recorded',
      description: 'Sale has been submitted for approval',
    });

    onOpenChange(false);
    setFormData({
      farmerId: '',
      productId: '',
      quantity: 1,
      date: new Date().toISOString().split('T')[0],
    });
  };

  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-heading">Record New Sale</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
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
                {mockFarmers.map((farmer) => (
                  <SelectItem key={farmer.id} value={farmer.id}>
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
                {mockProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - {formatCurrency(product.unitPrice)}
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
            />
          </div>

          {/* Upload Proof */}
          <div className="space-y-2">
            <Label>Proof of Sale (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload image</p>
            </div>
          </div>

          {/* Summary */}
          {selectedProduct && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Sale Summary</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unit Price:</span>
                <span>{formatCurrency(selectedProduct.unitPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity:</span>
                <span>{formData.quantity}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Commission will be applied when sale is marked as completed by manager
              </p>
            </div>
          )}

          {/* Actions - Sticky on mobile */}
          <div className="flex gap-3 pt-4 pb-2 sticky bottom-0 bg-background border-t -mx-4 sm:-mx-6 px-4 sm:px-6 mt-auto">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="wheat" className="flex-1">
              Submit Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
