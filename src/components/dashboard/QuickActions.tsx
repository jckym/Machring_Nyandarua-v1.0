// src/components/QuickActions.tsx
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  ShoppingCart,
  Tractor,
  GraduationCap,
  MapPin,
  FileText,
} from 'lucide-react';

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  color: string;
}

const actions: QuickAction[] = [
  {
    icon: UserPlus,
    label: 'Add Farmer',
    path: '/farmers?add=new',
    color: 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300',
  },
  {
    icon: ShoppingCart,
    label: 'Record Sale',
    path: '/sales?add=new',
    color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300',
  },
  {
    icon: Tractor,
    label: 'New Booking',
    path: '/mechanisation?add=new',
    color: 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300',
  },
  {
    icon: GraduationCap,
    label: 'Add Training',
    path: '/trainings?add=new',
    color: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300',
  },
  {
    icon: MapPin,
    label: 'Log Visit',
    path: '/visits?add=new',
    color: 'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300',
  },
  {
    icon: FileText,
    label: 'Generate Report',
    path: '/reports',
    color: 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300',
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Button
                key={action.label}
                variant="outline"
                className={`w-full justify-start h-auto py-5 px-6 text-left font-medium border-2 transition-all duration-200 shadow-sm hover:shadow-md ${action.color}`}
                onClick={() => navigate(action.path)}
              >
                <Icon className="mr-3 h-6 w-6 flex-shrink-0" />
                <span className="text-sm">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
