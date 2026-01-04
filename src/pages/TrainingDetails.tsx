import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, GraduationCap, Calendar, MapPin, Clock, Users, User, Building2, CheckCircle, UserPlus } from 'lucide-react';
import { useTraining, useCompleteTraining } from '@/hooks/api/useTrainings';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { AttendanceModal } from '@/components/trainings/AttendanceModal';
import { toast } from 'sonner';

export function TrainingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data: training, isLoading, error } = useTraining(id || '');
  const completeTraining = useCompleteTraining();
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  const handleMarkComplete = () => {
    if (!id) return;
    completeTraining.mutate(id, {
      onSuccess: () => {
        toast.success('Training marked as completed');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/trainings')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Trainings
        </Button>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Training not found or an error occurred.</p>
        </Card>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'field day': return 'wheat';
      case 'demonstration': return 'forest';
      default: return 'sage';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/trainings')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Training Details</h1>
            <p className="text-sm text-muted-foreground">View training information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && training.status === 'Completed' && (
            <Button variant="secondary" size="sm" onClick={() => setIsAttendanceOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Attendance
            </Button>
          )}
          {isAdmin && training.status === 'Upcoming' && (
            <Button 
              variant="success" 
              size="sm" 
              onClick={handleMarkComplete}
              disabled={completeTraining.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              {training.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={getTypeColor(training.type || '') as any}>{training.type}</Badge>
              <Badge variant={training.status === 'Completed' ? 'success' : 'sage'}>
                {training.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trainer</p>
                  <p className="font-medium">{training.trainerName || 'Unknown'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Local MR</p>
                  <p className="font-medium">{training.local_mr_name || 'Not assigned'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled Date</p>
                  <p className="font-medium">{formatDate(training.date)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Venue</p>
                  <p className="font-medium">{training.location || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{training.duration} hours</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attendees</p>
                  <p className="font-medium">{training.attendees?.length || 0} farmers</p>
                </div>
              </div>
            </div>
          </div>

          {training.topics && training.topics.length > 0 && (
            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground mb-3">Topics Covered</p>
              <div className="flex flex-wrap gap-2">
                {training.topics.map((topic: string, i: number) => (
                  <Badge key={i} variant="outline">{topic}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <AttendanceModal
          open={isAttendanceOpen}
          onOpenChange={setIsAttendanceOpen}
          trainingId={id || ''}
          trainingTitle={training.title}
          localMrId={training.local_mr_id || undefined}
        />
      )}
    </div>
  );
}
