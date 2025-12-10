import { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setDismissed(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline || dismissed) return null;

  return (
    <div className={cn(
      'fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2',
      'flex items-center justify-center gap-3 text-sm font-medium',
      'animate-fade-in'
    )}>
      <WifiOff className="w-4 h-4" />
      <span>You're offline. Changes will sync when you reconnect.</span>
      <Button
        variant="ghost"
        size="icon-sm"
        className="h-6 w-6 text-amber-950 hover:bg-amber-600"
        onClick={() => setDismissed(true)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
