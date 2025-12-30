import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
  UserCog,
  Calculator,
  Shield,
  Bell,
  AlertCircle,
  HelpCircle,
  CheckSquare,
} from 'lucide-react';
import { toast } from 'sonner';

const totNavItems = [
  { to: '/dashboard/tot', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/farmers', icon: Users, label: 'My Farmers' },
  { to: '/sales', icon: ShoppingCart, label: 'Sales' },
  { to: '/mechanisation', icon: Tractor, label: 'Mechanisation' },
  { to: '/visits', icon: MapPin, label: 'Field Visits' },
  { to: '/trainings', icon: GraduationCap, label: 'Trainings' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/commission', icon: Calculator, label: 'My Commission' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/support', icon: HelpCircle, label: 'Support' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const managerNavItems = [
  { to: '/dashboard/manager', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tots', icon: UserCog, label: 'TOT Management' },
  { to: '/approval-requests', icon: CheckSquare, label: 'Approvals' },
  { to: '/farmers', icon: Users, label: 'All Farmers' },
  { to: '/sales', icon: ShoppingCart, label: 'Sales' },
  { to: '/mechanisation', icon: Tractor, label: 'Mechanisation' },
  { to: '/trainings', icon: GraduationCap, label: 'Trainings' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/commission', icon: Calculator, label: 'Commission Calculator' },
  { to: '/support', icon: HelpCircle, label: 'Support' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const regionalManagerNavItems = [
  { to: '/dashboard/regional', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/local-mrs', icon: Building2, label: 'Local MRs' },
  { to: '/tots', icon: UserCog, label: 'TOT Management' },
  { to: '/approval-requests', icon: CheckSquare, label: 'Approvals' },
  { to: '/farmers', icon: Users, label: 'All Farmers' },
  { to: '/sales', icon: ShoppingCart, label: 'Sales Overview' },
  { to: '/mechanisation', icon: Tractor, label: 'Mechanisation' },
  { to: '/trainings', icon: GraduationCap, label: 'Trainings' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const adminNavItems = [
  { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: UserCog, label: 'User Management' },
  { to: '/local-mrs', icon: Building2, label: 'Local MRs' },
  { to: '/approval-requests', icon: CheckSquare, label: 'Approvals' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/farmers', icon: Users, label: 'All Farmers' },
  { to: '/sales', icon: ShoppingCart, label: 'All Sales' },
  { to: '/mechanisation', icon: Tractor, label: 'Mechanisation' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/system-logs', icon: AlertCircle, label: 'System Logs' },
  { to: '/audit', icon: Shield, label: 'Audit Trail' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems =
    user?.role === 'admin'
      ? adminNavItems
      : user?.role === 'regional_manager'
      ? regionalManagerNavItems
      : user?.role === 'manager'
      ? managerNavItems
      : totNavItems;

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'admin':
        return <Badge variant="destructive" className="text-xs">Admin</Badge>;
      case 'regional_manager':
        return <Badge className="text-xs bg-purple-500">Regional</Badge>;
      case 'manager':
        return <Badge variant="wheat" className="text-xs">Manager</Badge>;
      default:
        return <Badge variant="forest" className="text-xs">TOT</Badge>;
    }
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    toast.success('Logged out successfully');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-foreground hover:bg-accent"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[300px] bg-sidebar text-sidebar-foreground p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forest to-emerald-600 flex items-center justify-center shadow-lg overflow-hidden">
              <img
                src="/logo.png"
                alt="Machinery Ring Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <SheetTitle className="text-sidebar-foreground font-heading text-lg">
                Machinery Ring
              </SheetTitle>
              <p className="text-xs text-sidebar-foreground/70">Nyandarua</p>
            </div>
          </div>
        </SheetHeader>

        {/* User Profile */}
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-lg shadow-md">
              {user?.name?.split(' ').map(n => n[0].toUpperCase()).join('') || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sidebar-foreground truncate text-base">
                {user?.name || 'User'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {getRoleBadge()}
                {user?.localMrName && (
                  <p className="text-xs text-sidebar-foreground/70 truncate">
                    {user.localMrName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
