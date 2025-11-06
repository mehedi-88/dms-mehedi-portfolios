'use client';

import React, { useEffect } from 'react';

interface ToastProps {
  messages: string[];
  onClear: () => void;
  duration?: number; // ms, optional
}

export default function Toast({ messages, onClear, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const t = setTimeout(() => {
      onClear();
    }, duration);
    return () => clearTimeout(t);
  }, [messages, onClear, duration]);

  if (!messages || messages.length === 0) return null;

  return (
    <div className="fixed right-6 bottom-28 z-50 flex flex-col gap-2 pointer-events-auto">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className="max-w-xs bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-start justify-between gap-3"
          role="status"
          aria-live="polite"
        >
          <div className="text-sm leading-snug break-words">{msg}</div>
          <button
            aria-label="Dismiss toast"
            onClick={onClear}
            className="ml-3 text-white/90 hover:text-white"
            style={{ fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
