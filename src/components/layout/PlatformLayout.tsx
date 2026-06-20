import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Inbox, Building2, FileText, Settings as SettingsIcon, LogOut } from 'lucide-react';

const navItems = [
  { to: '/platform', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/platform/requests', label: 'Registration Requests', icon: Inbox },
  { to: '/platform/tenants', label: 'Tenants', icon: Building2 },
  { to: '/platform/audit', label: 'Audit Logs', icon: FileText },
  { to: '/platform/settings', label: 'Platform Settings', icon: SettingsIcon },
];

export function PlatformLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="font-bold text-lg">Platform Admin</div>
          <div className="text-xs text-muted-foreground">Multi-Tenant Control</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2 px-1">{user?.email}</div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
