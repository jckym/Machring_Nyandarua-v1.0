import { useState } from 'react';
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

interface FloatingAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'forest' | 'wheat' | 'earth';
}

const pageActions: Record<string, FloatingAction[]> = {
  '/farmers': [
    { icon: Users, label: 'Add Farmer', onClick: () => {}, variant: 'forest' },
  ],
  '/sales': [
    { icon: ShoppingCart, label: 'Record Sale', onClick: () => {}, variant: 'wheat' },
  ],
  '/mechanisation': [
    { icon: Tractor, label: 'New Booking', onClick: () => {}, variant: 'earth' },
  ],
  '/visits': [
    { icon: MapPin, label: 'Log Visit', onClick: () => {}, variant: 'earth' },
  ],
  '/trainings': [
    { icon: GraduationCap, label: 'Schedule Training', onClick: () => {}, variant: 'forest' },
  ],
  '/products': [
    { icon: Package, label: 'Add Product', onClick: () => {}, variant: 'forest' },
  ],
  '/dashboard': [
    { icon: Users, label: 'Add Farmer', onClick: () => {}, variant: 'forest' },
    { icon: ShoppingCart, label: 'Record Sale', onClick: () => {}, variant: 'wheat' },
    { icon: Tractor, label: 'New Booking', onClick: () => {}, variant: 'earth' },
  ],
};

export function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const actions = pageActions[location.pathname] || [];
  
  if (actions.length === 0) return null;

  // Single action - show directly
  if (actions.length === 1) {
    const action = actions[0];
    return (
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <Button
          size="lg"
          variant={action.variant || 'forest'}
          className="h-14 w-14 rounded-full shadow-elevated"
          onClick={action.onClick}
        >
          <action.icon className="w-6 h-6" />
          <span className="sr-only">{action.label}</span>
        </Button>
      </div>
    );
  }

  // Multiple actions - show FAB menu
  return (
    <div className="fixed bottom-6 right-6 z-50 lg:hidden">
      {/* Action buttons */}
      <div
        className={cn(
          'flex flex-col-reverse gap-3 mb-3 transition-all duration-300',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {actions.map((action, index) => (
          <div key={index} className="flex items-center gap-3 justify-end">
            <span className="bg-card text-foreground text-sm font-medium px-3 py-1.5 rounded-lg shadow-card">
              {action.label}
            </span>
            <Button
              size="icon"
              variant={action.variant || 'forest'}
              className="h-12 w-12 rounded-full shadow-card"
              onClick={() => {
                action.onClick();
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
          'h-14 w-14 rounded-full shadow-elevated transition-transform duration-300',
          isOpen && 'rotate-45'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </Button>
    </div>
  );
}
