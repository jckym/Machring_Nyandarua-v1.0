import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Sparkles, User, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTION_GROUPS: { label: string; questions: string[] }[] = [
  { label: 'Sales', questions: [
    'Give me an executive summary of sales this month',
    'Which products drove the most revenue in the last 30 days?',
    'Predict revenue for the next 30 days based on trend',
  ]},
  { label: 'Inventory', questions: [
    'Which products are below minimum stock?',
    'What is my current inventory value at cost?',
    'Recommend a restock plan for low-stock items',
  ]},
  { label: 'Mechanisation', questions: [
    'How many mechanisation jobs are pending or scheduled?',
    'What is the completion rate of mechanisation jobs this month?',
    'Which service types generated the most revenue?',
  ]},
  { label: 'Workforce', questions: [
    'Which Local MR is performing best?',
    'How many overdue follow-up visits do we have?',
    'Are any TOTs inactive in the last 30 days?',
  ]},
  { label: 'Weather / External', questions: [
    'What weather data do we currently track? What should we add?',
    'How could market prices be integrated to improve decisions?',
  ]},
];

export function FIA() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
        body: JSON.stringify({ messages: next }),
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

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> Farm Intelligence Agent
          </h1>
          <p className="text-sm text-muted-foreground">Your executive assistant for MR Nyandarua. Ask anything about your farm data.</p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setMessages([])}><RefreshCw className="h-4 w-4 mr-1" /> New chat</Button>
        )}
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">How can FIA help you today?</h2>
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                {SUGGESTIONS.map((s) => (
                  <Badge key={s} variant="secondary" className="cursor-pointer hover:bg-primary/10 px-3 py-2 text-xs" onClick={() => send(s)}>
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2' : ''}`}>
                {m.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{m.content || '...'}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
              {m.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
              <span className="text-sm text-muted-foreground self-center">FIA is thinking...</span>
            </div>
          )}
        </div>

        <div className="border-t p-3">
          <form
            className="flex gap-2"
            onSubmit={(e) => { e.preventDefault(); send(input); }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask FIA about your farm..."
              className="min-h-[44px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()} size="icon" className="h-11 w-11 shrink-0">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default FIA;
