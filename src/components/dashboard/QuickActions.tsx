import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, ShoppingCart, Tractor, GraduationCap, MapPin, FileText } from 'lucide-react';

const actions = [
  { icon: UserPlus, label: 'Add Farmer', path: '/farmers/new', color: 'forest' },
  { icon: ShoppingCart, label: 'Record Sale', path: '/sales/new', color: 'wheat' },
  { icon: Tractor, label: 'New Booking', path: '/mechanisation/new', color: 'earth' },
  { icon: GraduationCap, label: 'Add Training', path: '/trainings/new', color: 'forest' },
  { icon: MapPin, label: 'Log Visit', path: '/visits/new', color: 'earth' },
  { icon: FileText, label: 'Generate Report', path: '/reports', color: 'wheat' },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card variant="elevated" className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.color as any}
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
