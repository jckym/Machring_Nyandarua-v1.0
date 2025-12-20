// src/components/TrainingFormDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Training, TrainingStatus } from '@/types';
import { Upload } from 'lucide-react';

interface TrainingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training?: Training | null;
  onSubmit: (training: Partial<Training>) => void;
}

const trainingTypes = [
  'Workshop',
  'Field Day',
  'Seminar',
  'Demonstration',
  'Online Training',
] as const;

const trainingStatuses: TrainingStatus[] = ['Upcoming', 'Completed', 'Cancelled'];

export function TrainingFormDialog({
  open,
  onOpenChange,
  training,
  onSubmit,
}: TrainingFormDialogProps) {
  const { toast } = useToast();
  const isEditing = !!training;

  const [formData, setFormData] = useState({
    title: '',
    type: '' as typeof trainingTypes[number],
    date: '',
    location: '',
    duration: 2,
    status: 'Upcoming' as TrainingStatus,
    topics: '',
  });

  // Sync form with incoming training data (edit mode) or reset (add mode)
  useEffect(() => {
    if (training && open) {
      setFormData({
        title: training.title || '',
        type: training.type || '',
        date: training.date ? new Date(training.date).toISOString().split('T')[0] : '',
        location: training.location || '',
        duration: training.duration || 2,
        status: training.status || 'Upcoming',
        topics: training.topics?.join(', ') || '',
      });
    } else if (!training && open) {
      // Reset for new training
      setFormData({
        title: '',
        type: '' as typeof trainingTypes[number],
        date: new Date().toISOString().split('T')[0],
        location: '',
        duration: 2,
        status: 'Upcoming',
        topics: '',
      });
    }
  }, [training, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.type || !formData.date || !formData.location) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields: Title, Type, Date, and Location',
        variant: 'destructive',
      });
      return;
    }

    onSubmit({
      ...(training || {}),
      title: formData.title,
      type: formData.type,
      date: new Date(formData.date),
      location: formData.location,
      duration: formData.duration,
      status: formData.status,
      topics: formData.topics
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      attendees: training?.attendees || [], // Preserve existing attendees
    });

    toast({
      title: isEditing ? 'Training Updated' : 'Training Scheduled',
      description: `${formData.title} has been ${isEditing ? 'updated' : 'scheduled'} successfully`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-heading text-xl">
            {isEditing ? 'Edit Training Session' : 'Schedule New Training'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto space-y-5 -mx-4 sm:-mx-6 px-4 sm:px-6"
        >
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Training Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Sustainable Soil Management Workshop"
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Training Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as typeof trainingTypes[number] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select training type" />
              </SelectTrigger>
              <SelectContent>
                {trainingTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="12"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Bahati Community Hall, Nakuru"
              required
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as TrainingStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {trainingStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topics */}
          <div className="space-y-2">
            <Label htmlFor="topics">Topics Covered (comma-separated)</Label>
            <Textarea
              id="topics"
              value={formData.topics}
              onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
              placeholder="e.g., Crop Rotation, Organic Fertilizers, Pest Control"
              rows={3}
            />
          </div>

          {/* Upload Images */}
          <div className="space-y-2">
            <Label>Training Photos (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/20">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Click to upload photos from the session</p>
              <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG up to 10MB</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 pb-2 sticky bottom-0 bg-background border-t -mx-4 sm:-mx-6 px-4 sm:px-6 mt-auto">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="forest" className="flex-1">
              {isEditing ? 'Update Training' : 'Schedule Training'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
