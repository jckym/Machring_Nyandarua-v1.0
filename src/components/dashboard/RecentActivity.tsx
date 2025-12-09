import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Tractor, UserPlus, MapPin, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'sale' | 'mechanisation' | 'farmer' | 'visit' | 'training';
  title: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  { id: '1', type: 'sale', title: 'Sale Recorded', description: '4x DAP Fertilizer to James Kiprotich', time: '2 hours ago' },
  { id: '2', type: 'mechanisation', title: 'Booking Completed', description: 'Ploughing service for Elizabeth Chebet', time: '4 hours ago' },
  { id: '3', type: 'farmer', title: 'New Farmer', description: 'Registered Daniel Rotich from Rongai', time: '6 hours ago' },
  { id: '4', type: 'visit', title: 'Farm Visit', description: 'Follow-up visit to Agnes Wanjiru', time: 'Yesterday' },
  { id: '5', type: 'training', title: 'Training Held', description: 'Soil Health seminar with 12 attendees', time: '2 days ago' },
];

const typeConfig = {
  sale: { icon: ShoppingCart, color: 'bg-emerald-100 text-emerald-700' },
  mechanisation: { icon: Tractor, color: 'bg-amber-100 text-amber-700' },
  farmer: { icon: UserPlus, color: 'bg-blue-100 text-blue-700' },
  visit: { icon: MapPin, color: 'bg-purple-100 text-purple-700' },
  training: { icon: GraduationCap, color: 'bg-pink-100 text-pink-700' },
};

export function RecentActivity() {
  return (
    <Card variant="elevated" className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <Badge variant="outline" className="text-xs">Last 7 days</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;
            
            return (
              <div 
                key={activity.id}
                className="flex items-start gap-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', config.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{activity.time}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
