import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockMechanisationJobs } from '@/data/mockData';
import { Search, Plus, Tractor, Calendar, Filter, Download, MapPin, Clock } from 'lucide-react';

export function Mechanisation() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = mockMechanisationJobs.filter(job =>
    job.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = mockMechanisationJobs.reduce((acc, job) => acc + job.totalPrice, 0);
  const totalAcreage = mockMechanisationJobs.reduce((acc, job) => acc + job.acreage, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'destructive';
    }
  };

  const getServiceIcon = (service: string) => {
    return Tractor;
  };

  const formatCurrency = (value: number) => {
    return `KES ${value.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Mechanisation</h1>
          <p className="text-muted-foreground">Track machinery service bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="earth" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4" variant="earth">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary-foreground/20 flex items-center justify-center">
              <Tractor className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">{mockMechanisationJobs.length}</p>
              <p className="text-sm opacity-80">Total Bookings</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-primary">{totalAcreage}</p>
              <p className="text-sm text-muted-foreground">Total Acreage</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-accent-foreground">
                {mockMechanisationJobs.filter(j => j.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-emerald-700">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-muted-foreground">Revenue</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by farmer or service type..."
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

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job, index) => (
          <Card 
            key={job.id}
            variant="elevated"
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-secondary-foreground">
                  <Tractor className="w-6 h-6" />
                </div>
                <Badge variant={getStatusColor(job.status) as any}>{job.status}</Badge>
              </div>
              
              <h3 className="font-heading font-semibold capitalize mb-1">{job.serviceType}</h3>
              <p className="text-sm text-muted-foreground mb-4">{job.farmerName}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Acreage:</span>
                  <span className="font-medium">{job.acreage} acres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price/Acre:</span>
                  <span className="font-medium">{formatCurrency(job.pricePerAcre)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold text-primary">{formatCurrency(job.totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled:</span>
                  <span className="font-medium">{formatDate(job.scheduledDate)}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                {job.status === 'pending' && (
                  <Button variant="forest" size="sm" className="flex-1">Start Job</Button>
                )}
                {job.status === 'in-progress' && (
                  <Button variant="success" size="sm" className="flex-1">Complete</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
