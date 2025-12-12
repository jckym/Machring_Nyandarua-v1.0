import { Search, Cloud, CloudOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { MobileNav } from './MobileNav';
import { Link } from 'react-router-dom';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Header() {
  const { user } = useAuth();
  const isOnline = navigator.onLine;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'System Administrator';
      case 'manager':
        return 'Branch Manager';
      default:
        return 'Trainer of Trainers';
    }
  };

  return (
    <header className="h-14 sm:h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between shadow-soft sticky top-0 z-40">
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Mobile menu */}
        <MobileNav />
        
        {/* Greeting - hidden on mobile */}
        <div className="hidden sm:block">
          <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground">
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">{getRoleTitle()}</p>
        </div>

        {/* Mobile title */}
        <div className="sm:hidden">
          <h2 className="font-heading text-base font-semibold text-foreground">
            MR Kenya
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search - hidden on small mobile */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search farmers, sales..."
            className="w-48 lg:w-64 pl-10 bg-background border-border h-9"
          />
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <Cloud className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Synced</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-600">
              <CloudOff className="w-4 h-4" />
              <Badge variant="warning" className="text-xs hidden sm:inline-flex">3 Pending</Badge>
            </div>
          )}
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Settings - visible on larger screens */}
        <Link to="/settings" className="hidden sm:block">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
