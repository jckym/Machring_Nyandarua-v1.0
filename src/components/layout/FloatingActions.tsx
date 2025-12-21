// src/components/FloatingActions.tsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Plus,
  X,
  Users,
  ShoppingCart,
  Tractor,
  MapPin,
  GraduationCap,
  Package,
} from 'lucide-react';
import { FarmerFormDialog } from '@/components/forms/FarmerFormDialog';
import { SaleFormDialog } from '@/components/forms/SaleFormDialog';
import { MechanisationFormDialog } from '@/components/forms/MechanisationFormDialog';
import { VisitFormDialog } from '@/components/forms/VisitFormDialog';
import { TrainingFormDialog } from '@/components/forms/TrainingFormDialog';
import { useAuth } from '@/contexts/AuthContext';

interface FloatingAction {
  icon: React.ElementType;
  label: string;
  dialog: React.ReactNode;
  roles?: ('tot' | 'manager' | 'admin')[]; // Restrict to roles
}

export function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const userRole = user?.role;

  // Dialog states
  const [farmerDialogOpen, setFarmerDialogOpen] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [mechanisationDialogOpen, setMechanisationDialogOpen] = useState(false);
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);

  const actions: FloatingAction[] = [
    {
      icon: Users,
      label: 'Add Farmer',
      dialog: <FarmerFormDialog open={farmerDialogOpen} onOpenChange={setFarmerDialogOpen} onSubmit={() => {}} />,
      roles: ['tot', 'manager'],
    },
    {
      icon: ShoppingCart,
      label: 'Record Sale',
      dialog: <SaleFormDialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen} onSubmit={() => {}} />,
      roles: ['tot'],
    },
    {
      icon: Tractor,
      label: 'New Booking',
      dialog: <MechanisationFormDialog open={mechanisationDialogOpen} onOpenChange={setMechanisationDialogOpen} onSubmit={() => {}} />,
      roles: ['tot'],
    },
    {
      icon: MapPin,
      label: 'Log Visit',
      dialog: <VisitFormDialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen} onSubmit={() => {}} />,
      roles: ['tot'],
    },
    {
      icon: GraduationCap,
      label: 'Schedule Training',
      dialog: <TrainingFormDialog open={trainingDialogOpen} onOpenChange={setTrainingDialogOpen} onSubmit={() => {}} />,
      roles: ['tot', 'manager'],
    },
  ];

  // Filter actions by current page and user role
  const currentPath = location.pathname.split('/')[1]; // e.g., 'farmers' from '/farmers'
  const relevantActions = actions.filter(action => {
    if (!action.roles || action.roles.includes(userRole as any)) {
      // Show on relevant pages or dashboard
      const relevantPages: Record<string, boolean> = {
        farmers: action.label.includes('Farmer'),
        sales: action.label.includes('Sale'),
        mechanisation: action.label.includes('Booking'),
        visits: action.label.includes('Visit'),
        trainings: action.label.includes('Training'),
        products: action.label.includes('Product'),
        dashboard: true,
      };
      return relevantPages[currentPath] || currentPath === 'dashboard';
    }
    return false;
  });

  if (relevantActions.length === 0) return null;

  // Single action
  if (relevantActions.length === 1) {
    const action = relevantActions[0];
    return (
      <>
        {action.dialog}
        <div className="fixed bottom-6 right-6 z-50 lg:hidden">
          <Button
            size="lg"
            variant={action.label.includes('Product') ? 'forest' : action.label.includes('Sale') ? 'wheat' : 'earth'}
            className="h-14 w-14 rounded-full shadow-elevated"
            onClick={() => {
              const setOpen: Record<string, React.Dispatch<React.SetStateAction<boolean>>> = {
                'Add Farmer': setFarmerDialogOpen,
                'Record Sale': setSaleDialogOpen,
                'New Booking': setMechanisationDialogOpen,
                'Log Visit': setVisitDialogOpen,
                'Schedule Training': setTrainingDialogOpen,
              };
              setOpen[action.label]?.(true);
            }}
          >
            <action.icon className="w-6 h-6" />
            <span className="sr-only">{action.label}</span>
          </Button>
        </div>
      </>
    );
  }

  // Multiple actions FAB menu
  return (
    <>
      {/* Render all dialogs */}
      {relevantActions.map(action => action.dialog)}

      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        {/* Secondary actions */}
        <div
          className={cn(
            'flex flex-col-reverse gap-3 mb-3 transition-all duration-300 ease-out',
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          )}
        >
          {relevantActions.map((action, index) => (
            <div
              key={action.label}
              className="flex items-center gap-3 justify-end animate-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="bg-card text-foreground text-sm font-medium px-3 py-1.5 rounded-lg shadow-card whitespace-nowrap">
                {action.label}
              </span>
              <Button
                size="icon"
                variant={action.label.includes('Product') ? 'forest' : action.label.includes('Sale') ? 'wheat' : 'earth'}
                className="h-12 w-12 rounded-full shadow-card"
                onClick={() => {
                  const setOpen: Record<string, React.Dispatch<React.SetStateAction<boolean>>> = {
                    'Add Farmer': setFarmerDialogOpen,
                    'Record Sale': setSaleDialogOpen,
                    'New Booking': setMechanisationDialogOpen,
                    'Log Visit': setVisitDialogOpen,
                    'Schedule Training': setTrainingDialogOpen,
                  };
                  setOpen[action.label]?.(true);
                  setIsOpen(false);
                }}
              >
                <action.icon className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>

        {/* Main FAB */}
        <Button
          size="lg"
          variant="forest"
          className={cn(
            'h-14 w-14 rounded-full shadow-elevated transition-all duration-300',
            isOpen && 'rotate-45 scale-110'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          <span className="sr-only">Open actions menu</span>
        </Button>
      </div>
    </>
  );
}
