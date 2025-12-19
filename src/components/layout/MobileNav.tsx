import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Tractor,
  MapPin,
  GraduationCap,
  FileText,
  Package,
  Building2,
  Settings,
  LogOut,
  Menu,
  Wheat,
  UserCog,
  Calculator,
  Shield,
  Bell,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const totNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/farmers', icon: Users, label: 'Farmers' },
  { to: '/sales', icon: ShoppingCart, label: 'Sales' },
  { to: '/mechanisation', icon: Tractor, label: 'Mechanisation' },
  { to: '/visits', icon: MapPin, label: 'Visits' },
  { to: '/trainings', icon: GraduationCap, label: 'Trainings' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/support', icon: HelpCircle, label: 'Support' },
];

const managerNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tots', icon: UserCog, label: 'TOT Management' },
  { to: '/farmers', icon: Users, label: 'Farmers' },
  { to: '/sales', icon: ShoppingCart, label: 'Sales' },
  { to: '/mechanisation', icon: Tractor, label: 'Mechanisation' },
  { to: '/trainings', icon: GraduationCap, label: 'Trainings' },
  { to: '/capacity-building', icon: GraduationCap, label: 'Capacity Building' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/commission', icon: Calculator, label: 'Commission Calculator' },
  { to: '/support', icon: HelpCircle, label: 'Support' },
];

const adminNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: UserCog, label: 'User Management' },
  { to: '/branches', icon: Building2, label: 'Branches' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/farmers', icon: Users, label: 'All Farmers' },
  { to: '/sales', icon: ShoppingCart, label: 'All Sales' },
  { to: '/mechanisation', icon: Tractor, label: 'Mechanisation' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/system-logs', icon: AlertCircle, label: 'System Logs' },
  { to: '/audit', icon: Shield, label: 'Audit Logs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminNavItems;
      case 'manager':
        return managerNavItems;
      default:
        return totNavItems;
    }
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'admin':
        return <Badge variant="terracotta" className="text-xs">Admin</Badge>;
      case 'manager':
        return <Badge variant="wheat" className="text-xs">Manager</Badge>;
      default:
        return <Badge variant="sage" className="text-xs">TOT</Badge>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-6 h-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] bg-sidebar text-sidebar-foreground p-0">
        <SheetHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Wheat className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <SheetTitle className="text-sidebar-foreground">
              <div className="flex flex-col items-start">
                <span className="font-heading font-semibold text-sm">Machinery Ring</span>
                <span className="text-xs text-sidebar-foreground/60 font-normal">Kenya</span>
              </div>
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-semibold">
              {user?.name?.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <div className="mt-1">{getRoleBadge()}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 max-h-[calc(100vh-280px)]">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-soft'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>


        {/* Logout */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
