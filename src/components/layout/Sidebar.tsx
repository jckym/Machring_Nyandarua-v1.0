import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';

const totNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/farmers', icon: Users, label: 'Farmers' },
  { to: '/sales', icon: ShoppingCart, label: 'Sales' },
  { to: '/mechanisation', icon: Tractor, label: 'Mechanisation' },
  { to: '/machinery', icon: Tractor, label: 'Machinery' },
  { to: '/visits', icon: MapPin, label: 'Visits' },
  { to: '/trainings', icon: GraduationCap, label: 'Trainings' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/support', icon: HelpCircle, label: 'Support' },
  { to: '/settings', icon: Settings, label: 'Settings' },
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
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const adminNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: UserCog, label: 'User Management' },
  { to: '/local-mrs', icon: Building2, label: 'Local MRs' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/farmers', icon: Users, label: 'All Farmers' },
  { to: '/sales', icon: ShoppingCart, label: 'All Sales' },
  { to: '/mechanisation', icon: Tractor, label: 'Mechanisation' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Notifications', badge: 4 },
  { to: '/system-logs', icon: AlertCircle, label: 'System Logs' },
  { to: '/audit', icon: Shield, label: 'Audit Logs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, switchRole } = useAuth();

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
    <aside
      className={cn(
        'hidden lg:flex h-screen bg-sidebar text-sidebar-foreground flex-col transition-all duration-300 ease-in-out relative flex-shrink-0 sticky top-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'h-16 flex items-center border-b border-sidebar-border px-4',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <Wheat className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-sm">Machinery Ring</span>
              <span className="text-xs text-sidebar-foreground/60">Kenya</span>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className={cn(
        'p-4 border-b border-sidebar-border',
        collapsed && 'px-2'
      )}>
        <div className={cn(
          'flex items-center gap-3',
          collapsed && 'flex-col'
        )}>
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {user?.name?.split(' ').map(n => n[0]).join('')}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <div className="mt-1">{getRoleBadge()}</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
                    collapsed && 'justify-center px-2',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-soft'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {(item as any).badge && (
                  <span className={cn(
                    'bg-terracotta text-white text-xs rounded-full flex items-center justify-center',
                    collapsed ? 'absolute -top-1 -right-1 w-4 h-4' : 'ml-auto w-5 h-5'
                  )}>
                    {(item as any).badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Demo Role Switcher */}
      <div className={cn(
        'p-3 border-t border-sidebar-border',
        collapsed && 'px-2'
      )}>
        {!collapsed && (
          <p className="text-xs text-sidebar-foreground/50 mb-2 px-3">Demo: Switch Role</p>
        )}
        <div className={cn(
          'flex gap-1',
          collapsed ? 'flex-col' : 'flex-row'
        )}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => switchRole('tot')}
            className={cn(
              'flex-1 text-xs',
              user?.role === 'tot' && 'bg-sidebar-accent'
            )}
          >
            {collapsed ? 'T' : 'TOT'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => switchRole('manager')}
            className={cn(
              'flex-1 text-xs',
              user?.role === 'manager' && 'bg-sidebar-accent'
            )}
          >
            {collapsed ? 'M' : 'MGR'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => switchRole('admin')}
            className={cn(
              'flex-1 text-xs',
              user?.role === 'admin' && 'bg-sidebar-accent'
            )}
          >
            {collapsed ? 'A' : 'ADM'}
          </Button>
        </div>
      </div>

      {/* Logout */}
      <div className={cn(
        'p-3 border-t border-sidebar-border',
        collapsed && 'px-2'
      )}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
            collapsed && 'justify-center px-0'
          )}
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-sidebar-primary text-sidebar-primary-foreground rounded-full flex items-center justify-center shadow-card hover:scale-110 transition-transform"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
