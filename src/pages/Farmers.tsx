import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockFarmers } from '@/data/mockData';
import { Search, Plus, MapPin, Phone, MoreVertical, Filter, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Farmers() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFarmers = mockFarmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farmer.location.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'commercial':
        return 'wheat';
      case 'cooperative':
        return 'forest';
      default:
        return 'sage';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Farmers</h1>
          <p className="text-muted-foreground">Manage your registered farmers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="forest" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Farmer
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search farmers by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-2xl font-bold font-heading text-primary">{mockFarmers.length}</p>
          <p className="text-sm text-muted-foreground">Total Farmers</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold font-heading text-accent-foreground">
            {mockFarmers.filter(f => f.farmerCategory === 'smallholder').length}
          </p>
          <p className="text-sm text-muted-foreground">Smallholders</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold font-heading text-secondary">
            {mockFarmers.filter(f => f.farmerCategory === 'commercial').length}
          </p>
          <p className="text-sm text-muted-foreground">Commercial</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold font-heading text-forest">
            {mockFarmers.filter(f => f.farmerCategory === 'cooperative').length}
          </p>
          <p className="text-sm text-muted-foreground">Cooperatives</p>
        </Card>
      </div>

      {/* Farmers List */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg">All Farmers ({filteredFarmers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredFarmers.map((farmer, index) => (
              <div
                key={farmer.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {farmer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{farmer.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {farmer.location.village}, {farmer.location.county}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {farmer.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={getCategoryColor(farmer.farmerCategory) as any}>
                    {farmer.farmerCategory}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Record Sale</DropdownMenuItem>
                      <DropdownMenuItem>Book Service</DropdownMenuItem>
                      <DropdownMenuItem>Log Visit</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
