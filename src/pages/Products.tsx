import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockProducts } from '@/data/mockData';
import { Search, Plus, Package, Filter, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockProducts = mockProducts.filter(p => p.inStock < 100);
  const totalValue = mockProducts.reduce((acc, p) => acc + (p.inStock * p.unitPrice), 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `KES ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `KES ${(value / 1000).toFixed(0)}K`;
    }
    return `KES ${value.toLocaleString()}`;
  };

  const getStockStatus = (stock: number) => {
    if (stock < 50) return { variant: 'destructive' as const, label: 'Critical' };
    if (stock < 100) return { variant: 'warning' as const, label: 'Low' };
    return { variant: 'success' as const, label: 'In Stock' };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === 'admin' ? 'Manage catalog & stock' : 'View product catalog'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button variant="forest" size="sm" className="hidden lg:flex">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4" variant="forest">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading">{mockProducts.length}</p>
              <p className="text-xs sm:text-sm opacity-80">Products</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-2xl font-bold font-heading text-accent-foreground truncate">{formatCurrency(totalValue)}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Stock Value</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-amber-700">{lowStockProducts.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Low Stock</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-emerald-700">4</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Categories</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filteredProducts.map((product, index) => {
          const stockStatus = getStockStatus(product.inStock);
          
          return (
            <Card 
              key={product.id}
              variant="elevated"
              className="animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="h-24 sm:h-32 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 flex items-center justify-center">
                <Package className="w-12 h-12 sm:w-16 sm:h-16 text-primary/30" />
              </div>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <Badge variant="outline" className="text-xs">{product.category}</Badge>
                  <Badge variant={stockStatus.variant} className="text-xs">{stockStatus.label}</Badge>
                </div>
                
                <h3 className="font-heading font-semibold mb-1 text-sm sm:text-base line-clamp-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 sm:mb-4">SKU: {product.sku}</p>
                
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unit Price:</span>
                    <span className="font-semibold text-primary">{formatCurrency(product.unitPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">In Stock:</span>
                    <span className="font-medium">{product.inStock} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commission:</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(product.commission)}</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-3 sm:mt-4 line-clamp-2">{product.description}</p>
                
                {user?.role === 'admin' && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8 sm:h-9">Edit</Button>
                    <Button variant="forest" size="sm" className="flex-1 text-xs h-8 sm:h-9">Stock</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
