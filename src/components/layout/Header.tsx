import { Bell, Search, Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

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
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shadow-soft">
      <div className="flex items-center gap-6">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-sm text-muted-foreground">{getRoleTitle()}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search farmers, sales..."
            className="w-64 pl-10 bg-background border-border"
          />
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <Cloud className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Synced</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-600">
              <CloudOff className="w-4 h-4" />
              <Badge variant="warning" className="text-xs">3 Pending</Badge>
            </div>
          )}
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta text-white text-xs rounded-full flex items-center justify-center">
            4
          </span>
        </Button>
      </div>
    </header>
  );
}
