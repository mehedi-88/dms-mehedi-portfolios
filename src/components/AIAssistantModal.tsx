'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MODAL_GRADIENT = 'bg-gradient-to-br from-[#1254FF] via-[#00C4FF] to-[#1254FF]';

export type AIMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AIAssistantModal({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project: {
    title: string;
    role: string;
    achievements: string[];
    technologies: string[];
    description: string;
  };
}) {
  const [messages, setMessages] = useState<AIMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`ai-chat-${project.title}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`ai-chat-${project.title}` , JSON.stringify(messages));
    }
  }, [messages, project.title]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  async function sendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { role: 'user', content: input }]);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'project-assistant',
          input: {
            question: input,
            project,
          },
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'API error');
      }
      const data = await res.json();
      const reply = data.result || 'I could not generate a response.';
      setMessages(msgs => [...msgs, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      setError(err.message || 'AI Assistant is unavailable. Please try again later.');
    }
    setInput('');
    setLoading(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center ${MODAL_GRADIENT} bg-opacity-80 backdrop-blur-lg`}
        >
          <motion.div
            initial={{ scale: 0.8, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 40, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md rounded-2xl glassmorphism shadow-2xl border border-[#00C4FF] border-opacity-40 p-6 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-30 rounded-full p-2 hover:glow-border transition"
              aria-label="Close AI Assistant"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Ask AI Assistant</h2>
            <div className="mb-4 text-sm text-white text-center opacity-80">Ask about this project, my role, or achievements.</div>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-xl shadow ${msg.role === 'user' ? 'bg-black text-white' : 'bg-white text-[#1254FF]'} max-w-[80%]`}>{msg.content}</div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start items-center gap-2">
                  <div className="px-4 py-2 rounded-xl shadow bg-white text-[#1254FF] flex items-center gap-2">
                    <span className="dot-bounce" />
                    <span>AI Assistant is typing…</span>
                  </div>
                </div>
              )}
              {error && (
                <div className="text-red-500 text-center text-xs mt-2">{error}</div>
              )}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your question…"
                className="flex-1 px-4 py-2 rounded-xl border border-[#00C4FF] bg-black bg-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-[#00C4FF]"
                autoFocus
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white font-bold px-4 py-2 rounded-xl shadow hover:glow-border transition-all animate-pulse"
              >
                Send
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Add to global CSS:
// .glassmorphism { backdrop-filter: blur(16px); background: rgba(255,255,255,0.12); }
// .glow-border { box-shadow: 0 0 16px #00C4FF, 0 0 32px #1254FF; }
// .dot-bounce { display: inline-block; width: 18px; height: 18px; background: #00C4FF; border-radius: 50%; animation: bounce 1s infinite alternate; margin-right: 6px; }
// @keyframes bounce { 0% { transform: translateY(0); } 100% { transform: translateY(-8px); } }
