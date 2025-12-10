import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  HelpCircle, 
  Plus, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  MessageSquare,
  Upload,
  Send
} from 'lucide-react';

interface SupportRequest {
  id: string;
  category: string;
  priority: string;
  description: string;
  status: 'open' | 'in-progress' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const mockRequests: SupportRequest[] = [
  {
    id: 'SR-001',
    category: 'System Failure',
    priority: 'high',
    description: 'Unable to sync sales data from mobile app',
    status: 'in-progress',
    createdAt: new Date('2024-12-08'),
    updatedAt: new Date('2024-12-09'),
  },
  {
    id: 'SR-002',
    category: 'Missing Data',
    priority: 'medium',
    description: 'Farmer records from last week not showing',
    status: 'open',
    createdAt: new Date('2024-12-07'),
    updatedAt: new Date('2024-12-07'),
  },
  {
    id: 'SR-003',
    category: 'Permission Error',
    priority: 'low',
    description: 'Cannot access reports section',
    status: 'closed',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-03'),
  },
];

export function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Request Submitted',
      description: 'Your support request has been sent to the admin team.',
    });
    
    setShowForm(false);
    setCategory('');
    setDescription('');
    setPriority('medium');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="warning">Open</Badge>;
      case 'in-progress':
        return <Badge variant="info">In Progress</Badge>;
      case 'closed':
        return <Badge variant="success">Closed</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'low':
        return <Badge variant="sage">Low</Badge>;
      default:
        return null;
    }
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
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Support</h1>
          <p className="text-sm text-muted-foreground">Report issues and track your support requests</p>
        </div>
        <Button variant="forest" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-amber-700">
                {mockRequests.filter(r => r.status === 'open').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Open</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-blue-700">
                {mockRequests.filter(r => r.status === 'in-progress').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-emerald-700">
                {mockRequests.filter(r => r.status === 'closed').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Resolved</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold font-heading text-primary">
                {mockRequests.length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>
      </div>

      {/* New Request Form */}
      {showForm && (
        <Card variant="elevated" className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Report an Issue
            </CardTitle>
            <CardDescription>Describe your issue and our team will assist you</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Issue Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system-failure">System Failure</SelectItem>
                      <SelectItem value="app-crash">App Crash</SelectItem>
                      <SelectItem value="missing-data">Missing Data</SelectItem>
                      <SelectItem value="incorrect-data">Incorrect Data</SelectItem>
                      <SelectItem value="permission-error">Permission Error</SelectItem>
                      <SelectItem value="sync-issue">Sync Issue</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minor inconvenience</SelectItem>
                      <SelectItem value="medium">Medium - Affects work</SelectItem>
                      <SelectItem value="high">High - Blocking work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail. What were you trying to do? What happened instead?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Screenshot (optional)</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" variant="forest" className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg">My Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRequests.map((request, index) => (
              <div
                key={request.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors gap-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {getStatusIcon(request.status)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{request.id}</span>
                      {getStatusBadge(request.status)}
                      {getPriorityBadge(request.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground">{request.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {formatDate(request.createdAt)} • Updated {formatDate(request.updatedAt)}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
