import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Bot } from 'lucide-react';

export function FloatingFIAButton() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const canAccessFIA = user?.role === 'admin' || user?.role === 'manager';
  if (!canAccessFIA) return null;

  return (
    <Button
      onClick={() => navigate('/fia')}
      size="lg"
      className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full bg-forest hover:bg-forest-light shadow-elevated transition-all duration-300 hover:scale-110"
      title="Open FIA Assistant"
    >
      <Bot className="h-7 w-7 text-cream" />
      <span className="sr-only">Open FIA Assistant</span>
    </Button>
  );
}
