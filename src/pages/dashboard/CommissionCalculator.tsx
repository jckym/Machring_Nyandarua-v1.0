// src/pages/dashboard/CommissionCalculator.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Plus, Trash2 } from 'lucide-react';
import { useProducts } from '@/hooks/api';
import { toast } from 'sonner';
import { Product } from '@/types';

interface SoldItem {
  productId: string;
  productName: string;
  quantity: number;
  commissionPerUnit: number;
}

export function CommissionCalculator() {
  const [totName, setTotName] = useState('');
  const [soldItems, setSoldItems] = useState<SoldItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // API hook - data is already normalized by select transform
  const { data: products = [], isLoading } = useProducts();

  const availableProducts = (products as Product[]).filter(p => p.commission > 0);

  const addProduct = () => {
    if (!selectedProductId || quantity < 1) {
      toast.error('Please select a product and valid quantity');
      return;
    }

    const product = availableProducts.find(p => p.id === selectedProductId);
    if (!product) return;

    const existingIndex = soldItems.findIndex(item => item.productId === selectedProductId);

    if (existingIndex >= 0) {
      const updated = [...soldItems];
      updated[existingIndex].quantity += quantity;
      setSoldItems(updated);
    } else {
      setSoldItems([
        ...soldItems,
        {
          productId: product.id,
          productName: product.name,
          quantity,
          commissionPerUnit: product.commission,
        },
      ]);
    }

    setSelectedProductId('');
    setQuantity(1);
    toast.success(`${product.name} added`);
  };

  const removeItem = (index: number) => {
    setSoldItems(soldItems.filter((_, i) => i !== index));
  };

  const totalCommission = soldItems.reduce(
    (sum, item) => sum + item.quantity * item.commissionPerUnit,
    0
  );

  const downloadReport = () => {
    if (!totName.trim()) {
      toast.error('Please enter TOT name');
      return;
    }

    const reportLines = [
      `TOT Commission Report`,
      `TOT Name: ${totName}`,
      `Date: ${new Date().toLocaleDateString('en-KE')}`,
      '',
      'Sold Products:',
      ...soldItems.map(
        item =>
          `- ${item.productName}: ${item.quantity} unit(s) × KES ${item.commissionPerUnit.toFixed(
            2
          )} = KES ${(item.quantity * item.commissionPerUnit).toFixed(2)}`
      ),
      '',
      `TOTAL COMMISSION: KES ${totalCommission.toFixed(2)}`,
    ];

    const reportData = reportLines.join('\n');
    const blob = new Blob([reportData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${totName.replace(/\s+/g, '_')}_commission_report_${new Date()
      .toISOString()
      .slice(0, 10)}.txt`;
    link.click();

    toast.success('Report downloaded');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          TOT Commission Calculator
        </h1>
        <p className="text-muted-foreground">
          Calculate earned commission based on products sold (commission set per product by admin)
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Input Section */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Calculate Commission for TOT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totName">TOT Name</Label>
              <Input
                id="totName"
                type="text"
                placeholder="Enter TOT full name"
                value={totName}
                onChange={(e) => setTotName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product">Select Product Sold</Label>
              <select
                id="product"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={isLoading || availableProducts.length === 0}
              >
                <option value="">
                  {isLoading
                    ? 'Loading products...'
                    : availableProducts.length === 0
                    ? 'No products with commission'
                    : 'Choose a product'}
                </option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (KES {p.commission} commission/unit)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Sold</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>

            <Button onClick={addProduct} className="w-full" disabled={!selectedProductId}>
              <Plus className="mr-2 w-4 h-4" />
              Add Product
            </Button>
          </CardContent>
        </Card>

        {/* Right: Summary & Report */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg">Commission Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {soldItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No products added yet. Select products sold by the TOT.
              </p>
            ) : (
              <div className="space-y-3">
                {soldItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × KES {item.commissionPerUnit.toFixed(2)} ={' '}
                        <strong>KES {(item.quantity * item.commissionPerUnit).toFixed(2)}</strong>
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(index)}
                      className="ml-2"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <p className="text-xl font-bold text-center">
                    Total Commission: <span className="text-primary">KES {totalCommission.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={downloadReport} disabled={totalCommission === 0 || !totName}>
                <Download className="mr-2 w-4 h-4" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}