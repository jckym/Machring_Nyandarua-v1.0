// src/components/TrainingFormDialog.tsx - Simplified
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Training, TrainingStatus, TrainingType } from '@/types';

interface TrainingFormDialogProps { open: boolean; onOpenChange: (open: boolean) => void; training?: Training | null; onSubmit: (training: Partial<Training>) => void; }
const trainingTypes: TrainingType[] = ['Workshop', 'Field Day', 'Seminar', 'Demonstration', 'Online Training'];
const trainingStatuses: TrainingStatus[] = ['Upcoming', 'Completed'];

export function TrainingFormDialog({ open, onOpenChange, training, onSubmit }: TrainingFormDialogProps) {
  const { toast } = useToast();
  const isEditing = !!training;
  const [formData, setFormData] = useState({ title: '', type: '' as TrainingType | '', date: '', location: '', duration: 2, status: 'Upcoming' as TrainingStatus, topics: '' });

  useEffect(() => {
    if (training && open) {
      setFormData({ title: training.title || '', type: training.type || '', date: training.date ? new Date(training.date).toISOString().split('T')[0] : '', location: training.location || '', duration: training.duration || 2, status: training.status || 'Upcoming', topics: training.topics?.join(', ') || '' });
    } else if (!training && open) {
      setFormData({ title: '', type: '', date: new Date().toISOString().split('T')[0], location: '', duration: 2, status: 'Upcoming', topics: '' });
    }
  }, [training, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.date || !formData.location) {
      toast({ title: 'Validation Error', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    onSubmit({
      ...(training || {}), title: formData.title, type: formData.type as TrainingType, date: new Date(formData.date), location: formData.location,
      duration: formData.duration, status: formData.status, topics: formData.topics.split(',').map((t) => t.trim()).filter(Boolean), attendees: training?.attendees || [],
    });
    toast({ title: isEditing ? 'Training Updated' : 'Training Scheduled' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit Training' : 'Schedule New Training'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 px-1">
          <div className="space-y-2"><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Training title" required /></div>
          <div className="space-y-2"><Label>Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as TrainingType })}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{trainingTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Date *</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} min={new Date().toISOString().split('T')[0]} required /></div>
            <div className="space-y-2"><Label>Duration (hrs) *</Label><Input type="number" min="1" max="12" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })} /></div>
          </div>
          <div className="space-y-2"><Label>Location *</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Venue" required /></div>
          <div className="space-y-2"><Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as TrainingStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{trainingStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Topics (comma-separated)</Label><Textarea value={formData.topics} onChange={(e) => setFormData({ ...formData, topics: e.target.value })} rows={3} /></div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="forest" className="flex-1">{isEditing ? 'Update' : 'Schedule'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
