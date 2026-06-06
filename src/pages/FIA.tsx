import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, User, Loader2, RefreshCw, Database, Globe, Download, FileText, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { exportChatToPDF, exportChatToDOCX } from '@/lib/chatExport';

type Msg = { role: 'user' | 'assistant'; content: string };
type Mode = 'dashboard' | 'general';

const SUGGESTIONS: Record<Mode, { label: string; questions: string[] }[]> = {
  dashboard: [
    { label: 'Sales', questions: [
      'Give me an executive summary of sales this month',
      'Which products drove the most revenue in the last 30 days?',
    ]},
    { label: 'Inventory', questions: [
      'Which products are below minimum stock?',
      'Recommend a restock plan for low-stock items',
    ]},
    { label: 'Workforce', questions: [
      'Which Local MR is performing best?',
      'How many overdue follow-up visits do we have?',
    ]},
  ],
  general: [
    { label: 'Agronomy', questions: [
      'Best potato varieties for Nyandarua highlands',
      'How to manage late blight in potatoes organically',
      'Optimal barley planting calendar for Kenya',
    ]},
    { label: 'Business', questions: [
      'How do I price farm services competitively?',
      'KRA tax obligations for an agricultural cooperative',
    ]},
    { label: 'Strategy', questions: [
      'How can a Machinery Ring scale to 5,000 farmers?',
      'Best practices for managing field officers (TOTs)',
    ]},
  ],
};

const LogoMark = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <img src="/mrlogo.png" alt="Machinery Ring" className={`${className} object-contain`} />
);

export function FIA() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('dashboard');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fia-chat`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: next, mode }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }
      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let assistant = '';
      setMessages([...next, { role: 'assistant', content: '' }]);
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              assistant += delta;
              setMessages([...next, { role: 'assistant', content: assistant }]);
            }
          } catch { /* ignore partial */ }
        }
      }
    } catch (e) {
      toast.error((e as Error).message);
      setMessages(next);
    } finally {
      setLoading(false);
    }
  }

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (messages.length === 0) {
      toast.error('No conversation to export yet.');
      return;
    }
    try {
      const title = `FIA Conversation — ${mode === 'dashboard' ? 'Dashboard' : 'General'} Mode`;
      if (format === 'pdf') await exportChatToPDF(title, messages);
      else await exportChatToDOCX(title, messages);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (e) {
      toast.error(`Export failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-forest to-emerald-700 p-2 shadow-md flex items-center justify-center">
            <LogoMark className="h-7 w-7 brightness-0 invert" />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              FIA Assistant
              <Badge variant={mode === 'dashboard' ? 'forest' : 'wheat'} className="text-[10px] uppercase">
                {mode === 'dashboard' ? 'Dashboard' : 'General'}
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === 'dashboard'
                ? 'Grounded in your live Machinery Ring data'
                : 'Broad expert knowledge — agronomy, business, strategy'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={messages.length === 0}>
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileType className="h-4 w-4 mr-2" /> Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('docx')}>
                <FileText className="h-4 w-4 mr-2" /> Export as Word (.docx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setMessages([])}>
              <RefreshCw className="h-4 w-4 mr-1" /> New
            </Button>
          )}
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col border-forest/20 shadow-sm">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="py-6 space-y-5 max-w-3xl mx-auto">
              <div className="text-center space-y-3">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-forest/10 to-wheat/20 ring-1 ring-forest/20">
                  <LogoMark className="h-12 w-12" />
                </div>
                <h2 className="text-lg font-semibold">How can FIA help you today?</h2>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Toggle between <span className="font-medium text-forest">Dashboard</span> (your live data) and{' '}
                  <span className="font-medium text-amber-700">General</span> (broad knowledge) using the button beside the chat input.
                </p>
              </div>
              <div className="space-y-3">
                {SUGGESTIONS[mode].map((g) => (
                  <div key={g.label} className="space-y-1.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{g.label}</div>
                    <div className="flex flex-wrap gap-2">
                      {g.questions.map((q) => (
                        <Badge
                          key={q}
                          variant="secondary"
                          className="cursor-pointer hover:bg-forest/10 hover:text-forest px-3 py-1.5 text-xs font-normal"
                          onClick={() => send(q)}
                        >
                          {q}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'assistant' && (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-forest to-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                  <LogoMark className="h-5 w-5 brightness-0 invert" />
                </div>
              )}
              <div
                className={`max-w-[80%] ${
                  m.role === 'user'
                    ? 'bg-forest text-white rounded-2xl rounded-tr-sm px-4 py-2 shadow-sm'
                    : ''
                }`}
              >
                {m.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-forest prose-strong:text-forest">
                    <ReactMarkdown>{m.content || '...'}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
              {m.role === 'user' && (
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-forest to-emerald-700 flex items-center justify-center shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              </div>
              <span className="text-sm text-muted-foreground self-center">FIA is thinking...</span>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t bg-muted/30 p-3">
          <form
            className="flex gap-2 items-end"
            onSubmit={(e) => { e.preventDefault(); send(input); }}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`h-11 shrink-0 gap-1.5 ${
                mode === 'dashboard'
                  ? 'border-forest/40 text-forest hover:bg-forest/10'
                  : 'border-amber-500/40 text-amber-700 hover:bg-amber-50'
              }`}
              onClick={() => setMode((m) => (m === 'dashboard' ? 'general' : 'dashboard'))}
              title="Toggle context: Dashboard data vs General knowledge"
            >
              {mode === 'dashboard' ? <Database className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              <span className="hidden sm:inline text-xs font-medium">
                {mode === 'dashboard' ? 'Dashboard' : 'General'}
              </span>
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'dashboard'
                  ? 'Ask about your farmers, sales, inventory, mechanisation...'
                  : 'Ask anything — agronomy, business, strategy, world knowledge...'
              }
              className="min-h-[44px] max-h-32 resize-none bg-background"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="icon"
              className="h-11 w-11 shrink-0 bg-forest hover:bg-forest/90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default FIA;
