import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin, Calendar, MessageSquare, User, Building2 } from 'lucide-react';
import { useVisit } from '@/hooks/api/useVisits';

export function VisitDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: visit, isLoading, error } = useVisit(id || '');

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/visits')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Visits
        </Button>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Visit not found or an error occurred.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/visits')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Visit Details</h1>
          <p className="text-sm text-muted-foreground">View visit information</p>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Field Visit
            </CardTitle>
            <Badge variant="sage">{visit.purpose}</Badge>
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
                  <p className="text-sm text-muted-foreground">Farmer</p>
                  <p className="font-medium">{visit.farmerName || visit.farmer_name || 'Unknown'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Local MR</p>
                  <p className="font-medium">{visit.local_mr_name || 'Not assigned'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Visit Date</p>
                  <p className="font-medium">{formatDate(visit.date || visit.visit_date)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {visit.follow_up_required && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Follow-up Required</p>
                    <p className="font-medium">
                      {visit.follow_up_date ? formatDate(visit.follow_up_date) : 'Yes'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{visit.notes || 'No notes recorded.'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
