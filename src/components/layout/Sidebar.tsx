import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  ChevronLeft,
  ChevronRight,
  UserCog,
  Calculator,
  Shield,
  Bell,
  AlertCircle,
  HelpCircle,
  CheckSquare,
} from 'lucide-react';
import { toast } from 'sonner';

/* -------------------- NAV CONFIG -------------------- */

type NavItem = {
  to: string;
  icon: React.ElementType;
  label: string;
};

const totNavItems: NavItem[] = [
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

const managerNavItems: NavItem[] = [
  { to: '/dashboard/manager', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tots', icon: UserCog, label: 'TOT Management' },
  { to: '/approval-requests', icon: CheckSquare, label: 'Approvals' },
  { to: '/farmers', icon: Users, label: 'All Farmers' },
  { to: '/sales', icon: ShoppingCart, label: 'Sales' },
  { to: '/mechanisation', icon: Tractor, label: 'Mechanisation' },
  { to: '/trainings', icon: GraduationCap, label: 'Trainings' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/commission', icon: Calculator, label: 'Commission' },
  { to: '/support', icon: HelpCircle, label: 'Support' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const regionalManagerNavItems: NavItem[] = [
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

const adminNavItems: NavItem[] = [
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

/* -------------------- COMPONENT -------------------- */

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navItems =
    user?.role === 'admin'
      ? adminNavItems
      : user?.role === 'regional_manager'
      ? regionalManagerNavItems
      : user?.role === 'manager'
      ? managerNavItems
      : totNavItems;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const roleBadge = {
    admin: <Badge variant="destructive">Admin</Badge>,
    regional_manager: <Badge className="bg-purple-500">Regional</Badge>,
    manager: <Badge variant="wheat">Manager</Badge>,
    tot: <Badge variant="forest">TOT</Badge>,
  }[user?.role || 'tot'];

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden lg:flex h-screen sticky top-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex-col transition-all duration-300',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="h-16 px-4 flex items-center border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden">
              <img
                src="/mrLlgo.png"
                alt="Machinery Ring Logo"
                className="w-full h-full object-contain"
              />
            </div>
            {!collapsed && (
              <div>
                <p className="font-bold text-sm">Machinery Ring</p>
                <p className="text-xs opacity-70">Nyandarua</p>
              </div>
            )}
          </div>
        </div>

        {/* User */}
        <div className="p-4 border-b border-sidebar-border">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="w-10 h-10 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <div className="flex gap-2 mt-1 items-center">
                  {roleBadge}
                  {user?.localMrName && (
                    <span className="text-xs opacity-70 truncate">
                      {user.localMrName}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin">
          <ul className="p-3 space-y-1">
            {navItems.map(({ to, icon: Icon, label }) =>
              collapsed ? (
                <li key={to}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={to}
                        className={({ isActive }) =>
                          cn(
                            'w-full flex justify-center p-3 rounded-xl transition',
                            isActive
                              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                              : 'hover:bg-sidebar-accent'
                          )
                        }
                      >
                        <Icon className="w-5 h-5" />
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                  </Tooltip>
                </li>
              ) : (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow'
                          : 'hover:bg-sidebar-accent'
                      )
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="truncate">{label}</span>
                  </NavLink>
                </li>
              )
            )}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className={cn('w-full gap-3', collapsed && 'justify-center')}
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && 'Logout'}
          </Button>
        </div>

        {/* Collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-24 w-7 h-10 bg-sidebar-primary text-sidebar-primary-foreground rounded-r-full flex items-center justify-center shadow"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </aside>
    </TooltipProvider>
  );
}
