import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Suspended() {
  const { tenant, logout } = useAuth();
  const status = tenant?.status ?? 'suspended';
  const isSuspended = status === 'suspended';
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-8 text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Access disabled</h1>
          <p className="text-muted-foreground">
            {isSuspended
              ? `Your organization${tenant?.organization_name ? ` (${tenant.organization_name})` : ''} has been suspended. Please contact the platform administrator to restore access.`
              : `Your organization status is "${status}" and cannot access MR Connect right now.`}
          </p>
          <Button onClick={logout} variant="outline" className="w-full">Sign out</Button>
        </CardContent>
      </Card>
    </div>
  );
}
