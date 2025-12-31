// src/components/forms/TrainingFormDialog.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLocalMRs } from '@/hooks/api/useLocalMRs';
import { useAuth } from '@/contexts/AuthContext';
import { CreateTrainingDto } from '@/hooks/api/useTrainings';

interface TrainingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training?: any | null;
  onSubmit: (training: CreateTrainingDto) => void;
}

const trainingTypes = ['Workshop', 'Field Day', 'Seminar', 'Demonstration', 'Online Training'];
const trainingStatuses = ['upcoming', 'completed'];

export function TrainingFormDialog({ open, onOpenChange, training, onSubmit }: TrainingFormDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: localMRs = [] } = useLocalMRs();
  const isEditing = !!training;

  const [formData, setFormData] = useState({
    title: '',
    type: '',
    date: '',
    time: '',
    localMrId: '',
    location: '',
    duration: 2,
    maxAttendees: 50,
    status: 'upcoming',
    description: '',
  });

  useEffect(() => {
    if (training && open) {
      setFormData({
        title: training.title || '',
        type: training.training_type || training.type || '',
        date: training.scheduled_date ? new Date(training.scheduled_date).toISOString().split('T')[0] : '',
        time: training.scheduled_time || '',
        localMrId: training.local_mr_id || '',
        location: training.venue || training.location || '',
        duration: training.duration_hours || training.duration || 2,
        maxAttendees: training.max_attendees || 50,
        status: training.status || 'upcoming',
        description: training.description || '',
      });
    } else if (!training && open) {
      setFormData({
        title: '',
        type: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        localMrId: localMRs[0]?.id || '',
        location: '',
        duration: 2,
        maxAttendees: 50,
        status: 'upcoming',
        description: '',
      });
    }
  }, [training, open, localMRs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.date || !formData.location) {
      toast({ title: 'Validation Error', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    // Create training DTO for Supabase
    const trainingData: CreateTrainingDto = {
      title: formData.title,
      description: formData.description || undefined,
      training_type: formData.type,
      trainer_id: user?.id || '',
      local_mr_id: formData.localMrId || undefined,
      scheduled_date: formData.date,
      scheduled_time: formData.time || undefined,
      duration_hours: formData.duration,
      venue: formData.location,
      max_attendees: formData.maxAttendees,
    };

    onSubmit(trainingData);
    toast({ title: isEditing ? 'Training Updated' : 'Training Scheduled' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Training' : 'Schedule New Training'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 px-1">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Training title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {trainingTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Local MR</Label>
            <Select value={formData.localMrId} onValueChange={(value) => setFormData({ ...formData, localMrId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Local MR (optional)" />
              </SelectTrigger>
              <SelectContent>
                {localMRs.map((mr) => (
                  <SelectItem key={mr.id} value={mr.id}>{mr.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (hrs) *</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Attendees</Label>
              <Input
                type="number"
                min="1"
                value={formData.maxAttendees}
                onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) || 50 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location/Venue *</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Training venue"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {trainingStatuses.map((s) => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description/Topics (comma-separated)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Topics to be covered..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="forest" className="flex-1">
              {isEditing ? 'Update' : 'Schedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
