import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockVisits } from '@/data/mockData';
import { Search, Plus, MapPin, Calendar, Filter, Camera, MessageSquare } from 'lucide-react';

export function Visits() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVisits = mockVisits.filter(visit =>
    visit.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visit.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="font-heading text-2xl font-bold text-foreground">Farm Visits</h1>
          <p className="text-muted-foreground">Track field visits and farmer engagements</p>
        </div>
        <Button variant="earth" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Log Visit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4" variant="earth">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary-foreground/20 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">{mockVisits.length}</p>
              <p className="text-sm opacity-80">Total Visits</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-primary">12</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-accent-foreground">8</p>
              <p className="text-sm text-muted-foreground">With Photos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-emerald-700">95%</p>
              <p className="text-sm text-muted-foreground">GPS Tagged</p>
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
                placeholder="Search by farmer or purpose..."
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

      {/* Visits List */}
      <div className="space-y-4">
        {filteredVisits.map((visit, index) => (
          <Card 
            key={visit.id}
            variant="elevated"
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-secondary-foreground flex-shrink-0">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold">{visit.farmerName}</h3>
                      <Badge variant="sage">{visit.purpose}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(visit.date)}
                      </span>
                      {visit.gpsLocation && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          GPS: {visit.gpsLocation.lat.toFixed(4)}, {visit.gpsLocation.lng.toFixed(4)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                      <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{visit.notes}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:flex-shrink-0">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button variant="forest" size="sm">Add Notes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
