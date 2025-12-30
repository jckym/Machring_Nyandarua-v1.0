import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { UserCog, Shield, MapPin, Users, GraduationCap } from 'lucide-react';

const ROLE_CONFIG: Record<UserRole, { label: string; icon: React.ElementType; color: string }> = {
  admin: { label: 'Admin', icon: Shield, color: 'bg-red-500' },
  manager: { label: 'Manager', icon: MapPin, color: 'bg-purple-500' },
  local_mr_coordinator: { label: 'Coordinator', icon: Users, color: 'bg-blue-500' },
  tot: { label: 'TOT', icon: GraduationCap, color: 'bg-green-500' },
};

export function DemoRoleSwitcher() {
  const { user, switchDemoRole } = useAuth();
  
  if (!user) return null;

  const currentRole = ROLE_CONFIG[user.role];
  const CurrentIcon = currentRole.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-background/95 backdrop-blur shadow-lg border-2"
          >
            <UserCog className="h-4 w-4" />
            <Badge className={`${currentRole.color} text-white`}>
              <CurrentIcon className="h-3 w-3 mr-1" />
              {currentRole.label}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Switch Demo Role
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.keys(ROLE_CONFIG) as UserRole[]).map((role) => {
            const config = ROLE_CONFIG[role];
            const Icon = config.icon;
            const isActive = user.role === role;
            
            return (
              <DropdownMenuItem
                key={role}
                onClick={() => switchDemoRole(role)}
                className={isActive ? 'bg-accent' : ''}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span>{config.label}</span>
                {isActive && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Active
                  </Badge>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
