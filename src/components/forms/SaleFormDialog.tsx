import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sale, Farmer, Product } from '@/types';
import { useFarmers, useProducts, useApiWithFallback } from '@/hooks/api';
import { Upload } from 'lucide-react';

// Fallback data
const fallbackFarmers: Farmer[] = [
  { id: 'farmer-1', name: 'Peter Kamau', phone: '+254711100001', location: { village: 'Bahati', ward: 'Bahati', subcounty: 'Nakuru East', county: 'Nakuru' }, localMrId: 'mr-1', localMrName: 'Nakuru Central MR', valueChain: 'Maize', farmerCategory: 'Pioneer', farmerRating: 'High-Value', registeredBy: 'tot-1', totalPurchases: 25, mechanisationCount: 8, trainingsAttended: 12, visitsCount: 6, createdAt: new Date('2023-06-15'), lastActivityDate: new Date('2025-06-15'), approvalStatus: 'approved' },
  { id: 'farmer-2', name: 'Mary Njeri', phone: '+254711100002', location: { village: 'Subukia', ward: 'Subukia', subcounty: 'Nakuru East', county: 'Nakuru' }, localMrId: 'mr-1', localMrName: 'Nakuru Central MR', valueChain: 'Dairy', farmerCategory: 'Existing', farmerRating: 'Active', registeredBy: 'tot-1', totalPurchases: 15, mechanisationCount: 5, trainingsAttended: 8, visitsCount: 4, createdAt: new Date('2023-08-20'), lastActivityDate: new Date('2025-06-10'), approvalStatus: 'approved' },
];

const fallbackProducts: Product[] = [
  { id: 'prod-1', name: 'Maize Seeds (10kg)', sku: 'MS-001', inStock: 500, unitPrice: 3500, description: 'High-yield hybrid maize seeds', commission: 175, category: 'Seeds', createdAt: new Date('2024-01-01') },
  { id: 'prod-2', name: 'DAP Fertilizer (50kg)', sku: 'DF-001', inStock: 300, unitPrice: 4500, description: 'Di-ammonium phosphate fertilizer', commission: 225, category: 'Fertilizers', createdAt: new Date('2024-01-01') },
];

interface SaleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (sale: Partial<Sale>) => void;
}

export function SaleFormDialog({ open, onOpenChange, onSubmit }: SaleFormDialogProps) {
  const { toast } = useToast();

  // Fetch data with fallback
  const farmersQuery = useFarmers();
  const { data: farmers } = useApiWithFallback(farmersQuery, fallbackFarmers);
  
  const productsQuery = useProducts();
  const { data: products } = useApiWithFallback(productsQuery, fallbackProducts);

  const [formData, setFormData] = useState({
    farmerId: '',
    productId: '',
    quantity: 1,
    date: new Date().toISOString().split('T')[0],
  });

  const selectedProduct = useMemo(
    () => products.find((p: Product) => p.id === formData.productId),
    [formData.productId, products]
  );

  const selectedFarmer = useMemo(
    () => farmers.find((f: Farmer) => f.id === formData.farmerId),
    [formData.farmerId, farmers]
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
                {farmers.map((farmer: Farmer) => (
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
                {products.map((product: Product) => (
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
