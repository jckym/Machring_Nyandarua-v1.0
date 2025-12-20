// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  Wheat,
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

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
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
        return <Badge variant="destructive" className="text-xs">Admin</Badge>;
      case 'manager':
        return <Badge variant="wheat" className="text-xs">Manager</Badge>;
      default:
        return <Badge variant="forest" className="text-xs">TOT</Badge>;
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden lg:flex h-screen bg-sidebar text-sidebar-foreground flex-col transition-all duration-300 ease-in-out relative flex-shrink-0 sticky top-0 border-r border-sidebar-border',
          collapsed ? 'w-20' : 'w-64'
        )}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className={cn(
          'h-16 flex items-center border-b border-sidebar-border px-4',
          collapsed ? 'justify-center' : 'justify-start'
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest to-emerald-600 flex items-center justify-center shadow-lg">
              <Wheat className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-heading font-bold text-base">Farm Society</span>
                <span className="text-xs text-sidebar-foreground/70">Machinery Ring Kenya</span>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className={cn(
          'p-4 border-b border-sidebar-border',
          collapsed && 'px-3'
        )}>
          <div className={cn(
            'flex items-center gap-3',
            collapsed && 'flex-col gap-2'
          )}>
            <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-lg shadow-md">
              {user?.name?.split(' ').map(n => n[0].toUpperCase()).join('') || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleBadge()}
                  {user?.localMrName && (
                    <p className="text-xs text-sidebar-foreground/70 truncate">
                      {user.localMrName}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.to}
                      end
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group',
                          collapsed && 'justify-center px-3',
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md font-semibold'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" className="bg-sidebar-primary text-sidebar-primary-foreground">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className={cn(
          'p-4 border-t border-sidebar-border',
          collapsed && 'px-3'
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-xl',
                  collapsed && 'justify-center px-0'
                )}
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                {!collapsed && <span className="ml-3 font-medium">Logout</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-destructive text-destructive-foreground">
                Logout
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'absolute -right-3 top-24 w-7 h-10 bg-sidebar-primary text-sidebar-primary-foreground rounded-r-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 z-10',
            collapsed && 'top-20'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>
    </TooltipProvider>
  );
}
