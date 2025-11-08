import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Copy, ChevronDown, Loader2 } from 'lucide-react';


type MoodKey = 'thinking' | 'agent' | 'research' | 'auto';
const MODES: { key: MoodKey; label: string; display: string }[] = [
  { key: 'thinking', label: '🧠 AI Thinking', display: 'AI Thinking' },
  { key: 'agent', label: '🤖 Agent Mode', display: 'Agent Mode' },
  { key: 'research', label: '🔍 Deep Research', display: 'Deep Research' },
  { key: 'auto', label: '⚙️ Auto Mode', display: 'Auto Mode' },
];
const TYPING_ANIM: Record<MoodKey, string> = {
  thinking: '💭 AI Thinking',
  agent: '⚡ Agent responding',
  research: '🔍 Researching',
  auto: '⚙️ Auto reasoning',
};
const DOT_ANIM: Record<MoodKey, string> = {
  thinking: 'wave',
  agent: 'pulse',
  research: 'scroll',
  auto: 'fade',
};
function TypingIndicator({ mood }: { mood: MoodKey }) {
  const [dots, setDots] = useState('');
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (DOT_ANIM[mood] === 'wave') setDots('.'.repeat((i++ % 3) + 1));
      else if (DOT_ANIM[mood] === 'pulse') setDots(i++ % 2 ? '...' : '.');
      else if (DOT_ANIM[mood] === 'scroll') setDots(['.', '..', '...', '....'][i++ % 4]);
      else setDots(i++ % 2 ? '...' : '');
    }, mood === 'agent' ? 200 : 400);
    return () => clearInterval(interval);
  }, [mood]);
  return (
    <span className="text-cyan-300 animate-pulse">{TYPING_ANIM[mood]}{dots}</span>
  );
}


export default function FAQChatbox() {
  const [mode, setMode] = useState<MoodKey>('thinking');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Load chat history for selected mood
  useEffect(() => {
    const saved = localStorage.getItem(`faqChat_${mode}`);
    setMessages(saved ? JSON.parse(saved) : []);
  }, [mode]);
  // Save chat history for selected mood
  useEffect(() => {
    localStorage.setItem(`faqChat_${mode}`, JSON.stringify(messages));
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, mode]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input, mode };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/faq-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, mood: mode })
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((msgs) => [...msgs, { sender: 'ai', text: data.reply, mode }]);
      } else {
        setMessages((msgs) => [...msgs, { sender: 'ai', text: data.error || 'AI error. Please try again.', mode }]);
      }
    } catch {
      setMessages((msgs) => [...msgs, { sender: 'ai', text: 'AI error. Please try again.', mode }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-16">
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all border-2 focus:outline-none ${mode === m.key
                ? 'bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white border-transparent shadow-lg'
                : 'bg-black/60 text-cyan-300 border-cyan-700 hover:bg-cyan-900/30'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-[#0a1a3a] to-[#001f2f] border-2 border-[#00C4FF]/40 shadow-2xl p-4 md:p-6 min-h-[340px] max-h-[420px] overflow-y-auto relative" ref={chatRef}>
        {messages.length === 0 && (
          <div className="text-center text-cyan-300/70 py-16 select-none">
            <Sparkles className="inline w-6 h-6 mr-2 text-[#00C4FF]" />
            Start a conversation with AI about your question!
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-xl text-sm whitespace-pre-line break-words relative ${msg.sender === 'user'
              ? 'bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white shadow-md'
              : 'bg-gradient-to-br from-[#001f2f] to-[#0a1a3a] text-cyan-100 border border-[#00C4FF]/30 shadow-lg'}`}>
              {msg.sender === 'ai' && (
                <div className="text-xs font-semibold text-cyan-400 mb-1">
                  {MODES.find((m) => m.key === msg.mode)?.display || 'AI'}
                </div>
              )}
              {msg.text}
              {msg.sender === 'ai' && (
                <button
                  className="absolute top-1 right-1 p-1 text-cyan-300 hover:text-cyan-100"
                  title="Copy"
                  onClick={() => handleCopy(msg.text)}
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start mb-3">
            <div className="max-w-[80%] px-4 py-2 rounded-xl text-sm bg-gradient-to-br from-[#001f2f] to-[#0a1a3a] text-cyan-100 border border-[#00C4FF]/30 shadow-lg">
              <TypingIndicator mood={mode} />
            </div>
          </div>
        )}
      </div>
      <form
        className="flex gap-2 mt-4"
        onSubmit={e => {
          e.preventDefault();
          if (!loading) sendMessage();
        }}
      >
        <input
          className="flex-1 rounded-xl px-4 py-2 bg-black/60 border border-[#00C4FF]/30 text-white focus:outline-none focus:ring-2 focus:ring-[#00C4FF]"
          placeholder="Type your question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white shadow-lg hover:opacity-90 transition disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send'}
        </button>
      </form>
    </div>
  );
}
