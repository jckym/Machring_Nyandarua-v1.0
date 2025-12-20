import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { mockTrainings } from '@/data/mockData';
import { Search, Plus, GraduationCap, Calendar, MapPin, Users, Clock, Filter, Download, FileSpreadsheet, FileText, WifiOff } from 'lucide-react';
import { exportTrainingsToExcel, exportTrainingsToPDF } from '@/lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TrainingFormDialog } from '@/components/forms/TrainingFormDialog';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';
import { Training } from '@/types';
import { useTrainings, useCreateTraining, useApiWithFallback } from '@/hooks/api';

export function Trainings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [localTrainings, setLocalTrainings] = useState<Training[]>([]);
  const { addNotification } = useNotifications();

  // API hooks with fallback
  const trainingsQuery = useTrainings();
  const { data: trainings, isLoading, isUsingFallback } = useApiWithFallback(trainingsQuery, mockTrainings);
  const createTraining = useCreateTraining();

  useEffect(() => {
    if (trainings && Array.isArray(trainings)) {
      setLocalTrainings(trainings);
    }
  }, [trainings]);

  const filteredTrainings = localTrainings.filter(training =>
    training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    training.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAttendees = localTrainings.reduce((acc, t) => acc + t.attendees.length, 0);
  const totalHours = localTrainings.reduce((acc, t) => acc + t.duration, 0);

  const handleAddTraining = (data: Partial<Training>) => {
    if (!isUsingFallback) {
      createTraining.mutate(data as any);
    } else {
      const newTraining: Training = {
        id: `training-${Date.now()}`,
        ...data as any,
        attendees: [],
      };
      setLocalTrainings(prev => [...prev, newTraining]);
      toast.success('Training scheduled successfully (offline mode)');
    }
    addNotification({
      title: 'New Training Scheduled',
      message: `Training scheduled`,
      type: 'training',
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'workshop': return 'forest';
      case 'field day': return 'wheat';
      case 'seminar': return 'earth';
      default: return 'sage';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Offline Banner */}
      {isUsingFallback && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-center gap-2 text-warning">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">Using offline data. Changes will sync when connection is restored.</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Trainings</h1>
          <p className="text-sm text-muted-foreground">Manage capacity building sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { exportTrainingsToExcel(filteredTrainings); toast.success('Exported to Excel'); }}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { exportTrainingsToPDF(filteredTrainings); toast.success('Exported to PDF'); }}>
                <FileText className="w-4 h-4 mr-2" />
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="forest" size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Training
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4" variant="forest">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading">{localTrainings.length}</p>
              <p className="text-xs sm:text-sm opacity-80">Sessions</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-accent-foreground">{totalAttendees}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Attendees</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-secondary">{totalHours} hrs</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Hours</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-emerald-700">
                {localTrainings.filter(t => t.status === 'Upcoming').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Upcoming</p>
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
                placeholder="Search trainings..."
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

      {/* Trainings List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredTrainings.map((training, index) => (
          <Card 
            key={training.id}
            variant="elevated"
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
                    <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start sm:items-center justify-between gap-2 flex-col sm:flex-row">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-semibold text-sm sm:text-base">{training.title}</h3>
                        <Badge variant={getTypeColor(training.type) as any} className="text-xs">{training.type}</Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" className="text-xs h-8">Details</Button>
                        <Button variant="forest" size="sm" className="text-xs h-8">Attendance</Button>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Facilitated by {training.trainerName}
                    </p>
                  </div>
                </div>
                
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {formatDate(training.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {training.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {training.duration} hours
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {training.attendees.length} attendees
                  </span>
                </div>
                
                {/* Topics */}
                <div className="pt-3 sm:pt-4 border-t border-border">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">Topics covered:</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {training.topics.map((topic, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{topic}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Training Form Dialog */}
      <TrainingFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddTraining}
      />
    </div>
  );
}
