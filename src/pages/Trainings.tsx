import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockTrainings } from '@/data/mockData';
import { Search, Plus, GraduationCap, Calendar, MapPin, Users, Clock, Filter } from 'lucide-react';

export function Trainings() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrainings = mockTrainings.filter(training =>
    training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    training.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAttendees = mockTrainings.reduce((acc, t) => acc + t.attendees.length, 0);
  const totalHours = mockTrainings.reduce((acc, t) => acc + t.duration, 0);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'workshop':
        return 'forest';
      case 'field day':
        return 'wheat';
      case 'seminar':
        return 'earth';
      default:
        return 'sage';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Trainings</h1>
          <p className="text-muted-foreground">Manage capacity building sessions</p>
        </div>
        <Button variant="forest" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Training
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4" variant="forest">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">{mockTrainings.length}</p>
              <p className="text-sm opacity-80">Total Sessions</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-accent-foreground">{totalAttendees}</p>
              <p className="text-sm text-muted-foreground">Total Attendees</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-secondary">{totalHours} hrs</p>
              <p className="text-sm text-muted-foreground">Training Hours</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-emerald-700">3</p>
              <p className="text-sm text-muted-foreground">This Month</p>
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
                placeholder="Search trainings..."
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

      {/* Trainings List */}
      <div className="space-y-4">
        {filteredTrainings.map((training, index) => (
          <Card 
            key={training.id}
            variant="elevated"
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold">{training.title}</h3>
                      <Badge variant={getTypeColor(training.type) as any}>{training.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Facilitated by {training.trainerName}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(training.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {training.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {training.duration} hours
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {training.attendees.length} attendees
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:flex-shrink-0">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button variant="forest" size="sm">Add Attendance</Button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Topics covered:</p>
                <div className="flex flex-wrap gap-2">
                  {training.topics.map((topic, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{topic}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
