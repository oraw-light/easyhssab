'use client';

import { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function AssistantChat({ financeData }: { financeData: unknown }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: prompt }]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, financeData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur inconnue');
      setMessages(prev => [...prev, { role: 'assistant', text: data.analysis }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col h-[65vh]">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-[#8C7B6E] font-bold text-xs mt-10 flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#C4A484]" />
            Posez une question sur vos finances, taxes, ou stocks.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs whitespace-pre-wrap ${m.role === 'user' ? 'bg-[#1A1A1A] text-white' : 'bg-[#F3F1ED] text-[#1A1A1A] border border-[#1A1A1A]/10'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#F3F1ED] rounded-2xl px-4 py-3 text-xs flex items-center gap-2 text-[#8C7B6E]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyse en cours...
            </div>
          </div>
        )}
        {error && <div className="text-xs font-bold text-red-600">{error}</div>}
      </div>

      <form onSubmit={handleSubmit} className="border-t-2 border-[#1A1A1A] p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ex: Comment réduire mon IS ce trimestre ?"
          className="flex-1 border-2 border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm"
        />
        <button type="submit" disabled={loading} className="bg-[#1A1A1A] text-white rounded-xl px-4 py-2.5 hover:bg-[#C4A484] hover:text-[#1A1A1A] transition disabled:opacity-50">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
