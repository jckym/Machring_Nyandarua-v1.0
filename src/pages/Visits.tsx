import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockVisits } from '@/data/mockData';
import { Search, Plus, MapPin, Calendar, Filter, Camera, MessageSquare } from 'lucide-react';
import { VisitFormDialog } from '@/components/forms/VisitFormDialog';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';
import { Visit } from '@/types';

export function Visits() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [visits, setVisits] = useState(mockVisits);
  const { addNotification } = useNotifications();

  const filteredVisits = visits.filter(visit =>
    visit.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visit.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddVisit = (data: Partial<Visit>) => {
    const newVisit: Visit = {
      id: `visit-${Date.now()}`,
      ...data as any,
    };
    setVisits(prev => [newVisit, ...prev]);
    toast.success('Visit logged successfully');
    addNotification({
      title: 'Field Visit Logged',
      message: `Visit to ${newVisit.farmerName} recorded`,
      type: 'visit',
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Farm Visits</h1>
          <p className="text-sm text-muted-foreground">Track field visits and engagements</p>
        </div>
        <Button variant="earth" size="sm" onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Log Visit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4" variant="earth">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary-foreground/20 flex items-center justify-center">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading">{mockVisits.length}</p>
              <p className="text-xs sm:text-sm opacity-80">Total Visits</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-primary">12</p>
              <p className="text-xs sm:text-sm text-muted-foreground">This Week</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-accent-foreground">8</p>
              <p className="text-xs sm:text-sm text-muted-foreground">With Photos</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-emerald-700">95%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">GPS Tagged</p>
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
                placeholder="Search by farmer or purpose..."
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

      {/* Visits List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredVisits.map((visit, index) => (
          <Card 
            key={visit.id}
            variant="elevated"
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-secondary flex items-center justify-center text-secondary-foreground flex-shrink-0">
                    <MapPin className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start sm:items-center justify-between gap-2 flex-col sm:flex-row">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-semibold text-sm sm:text-base">{visit.farmerName}</h3>
                        <Badge variant="sage" className="text-xs">{visit.purpose}</Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" className="text-xs h-8">Details</Button>
                        <Button variant="forest" size="sm" className="text-xs h-8">Add Notes</Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {formatDate(visit.date)}
                      </span>
                      {visit.gpsLocation && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          GPS: {visit.gpsLocation.lat.toFixed(4)}, {visit.gpsLocation.lng.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground">{visit.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visit Form Dialog */}
      <VisitFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddVisit}
      />
    </div>
  );
}
