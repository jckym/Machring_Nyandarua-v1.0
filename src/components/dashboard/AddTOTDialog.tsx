// src/components/dashboard/AddTOTDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PasswordStrengthIndicator } from '@/components/ui/password-strength';
import { useToast } from '@/hooks/use-toast';
import { useCreateUser } from '@/hooks/api/useUsers';
import { useLocalMRs } from '@/hooks/api/useLocalMRs';
import { Loader2, UserPlus } from 'lucide-react';

interface AddTOTDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTOTDialog({ open, onOpenChange }: AddTOTDialogProps) {
  const { toast } = useToast();
  const createUser = useCreateUser();
  const { data: localMRs = [] } = useLocalMRs();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    localMrId: '',
    password: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      localMrId: '',
      password: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.localMrId || !formData.password) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    createUser.mutate(
      {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        role: 'tot',
        localMrId: formData.localMrId,
        password: formData.password,
      },
      {
        onSuccess: () => {
          toast({
            title: 'TOT Created Successfully',
            description: `${formData.name} has been added as a TOT`,
          });
          resetForm();
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to Create TOT',
            description: error.message || 'Please try again',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add New TOT
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tot-name">Full Name *</Label>
            <Input
              id="tot-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. John Kamau"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tot-email">Email *</Label>
            <Input
              id="tot-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.kamau@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tot-phone">Phone Number *</Label>
            <Input
              id="tot-phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+254712345678"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Assign Local MR *</Label>
            <Select
              value={formData.localMrId}
              onValueChange={(value) => setFormData({ ...formData, localMrId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Local MR" />
              </SelectTrigger>
              <SelectContent>
                {localMRs.map((mr) => (
                  <SelectItem key={mr.id} value={mr.id}>
                    {mr.name} ({mr.code || mr.region})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tot-password">Password *</Label>
            <Input
              id="tot-password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
            />
            <PasswordStrengthIndicator password={formData.password} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="forest"
              className="flex-1"
              disabled={createUser.isPending}
            >
              {createUser.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add TOT'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
