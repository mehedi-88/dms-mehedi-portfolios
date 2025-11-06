'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

type Sender = 'user' | 'admin';

interface Message {
  id?: string;
  chat_id: string;
  sender: Sender;
  message: string;
  status: 'sent' | 'seen';
  created_at: string;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [adminTyping, setAdminTyping] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [chatId, setChatId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [lastSeen, setLastSeen] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- START TYPING LOGIC (Unchanged from your file) ---
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // 🔹 Update typing status (Debounced)
  const updateTypingStatus = useCallback(async (isTyping: boolean) => {
    if (!chatId || !guestName) return;
    if (isTyping === isTypingRef.current) return;
    isTypingRef.current = isTyping;

    try {
      const { error } = await supabase.from('typing_status').upsert(
        {
          chat_id: chatId,
          user_id: guestName,
          is_typing: isTyping,
        },
        { onConflict: 'chat_id,user_id' }
      );
      if (error) console.error('typing upsert error:', error);
    } catch (error) {
      console.error('typing update error:', error);
    }
  }, [chatId, guestName]);
  
  // 🔹 Handle key press for typing
  const handleOnTyping = (value: string) => {
    if (value.length > 0 && !isTypingRef.current) {
      updateTypingStatus(true);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 2500);
  };

  // 🔹 Handle blur (stop typing immediately)
  const handleBlur = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    updateTypingStatus(false);
  };
  // --- END TYPING LOGIC ---


  // 🔹 Initialize chat session + presence (Unchanged)
  useEffect(() => {
    let presenceChannel: RealtimeChannel | null = null;
    const initialize = async () => {
      try {
        const storedGuest = localStorage.getItem('guest_name');
        const storedChat = localStorage.getItem('chat_id');
        let guest = storedGuest;
        let chat = storedChat;
        if (!guest || !/^guest_[0-9a-fA-F-]{36}$/.test(guest)) {
          guest = `guest_${uuidv4()}`;
          localStorage.setItem('guest_name', guest);
        }
        if (!chat || !/^[0-9a-fA-F-]{36}$/.test(chat)) {
          chat = uuidv4();
          localStorage.setItem('chat_id', chat);
        }
        setGuestName(guest);
        setChatId(chat);
        const { error: upsertErr } = await supabase.from('chat_sessions').upsert(
          {
            id: chat,
            guest_name: guest,
            is_online: true,
            last_seen: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
        if (upsertErr) console.error('chat_sessions upsert error:', upsertErr);
        const { data: presenceRow, error: presenceErr } = await supabase
          .from('user_presence')
          .select('is_online,last_seen')
          .eq('user_id', 'admin')
          .single();
        if (!presenceErr && presenceRow) {
          setAdminOnline(!!presenceRow.is_online);
          setLastSeen(presenceRow.last_seen ?? '');
        }
        presenceChannel = supabase
          .channel('admin_presence_channel')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_presence',
              filter: 'user_id=eq.admin'
            },
            (payload: any) => {
              if (payload.new) {
                setAdminOnline(!!payload.new.is_online);
                setLastSeen(payload.new.last_seen || '');
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    void initialize();
    return () => {
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel).catch((e) => {
          console.warn('presence unsubscribe warning:', e);
        });
      }
    };
  }, []);

  // 🔹 Real-time messages (Unchanged)
  useEffect(() => {
    if (!chatId) return;
    let msgChannel: RealtimeChannel | null = null;
    const run = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });
        if (error) console.error('fetch messages error:', error);
        else setMessages(data || []);

        msgChannel = supabase
          .channel(`chat_messages_${chatId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages',
              filter: `chat_id=eq.${chatId}`
            },
            (payload: any) => {
              const msg: Message = payload.new;
              setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
              });
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'chat_messages',
              filter: `chat_id=eq.${chatId}`
            },
            (payload: any) => {
              const updatedMsg: Message = payload.new;
              setMessages((prev) =>
                prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
              );
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Messages setup error:', error);
      }
    };
    void run();
    return () => {
      if (msgChannel) {
        supabase.removeChannel(msgChannel).catch((e) => {
          console.warn('messages unsubscribe warning:', e);
        });
      }
    };
  }, [chatId]);

  // 🔹 Admin typing indicator subscription (Unchanged)
  useEffect(() => {
    if (!chatId) return;
    let typingChannel: RealtimeChannel | null = null;
    const setupTyping = async () => {
      try {
        typingChannel = supabase
          .channel(`typing_status_${chatId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'typing_status',
              filter: `chat_id=eq.${chatId}`
            },
            (payload: any) => {
              if (payload.new?.user_id === 'admin') {
                setAdminTyping(!!payload.new?.is_typing);
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Typing setup error:', error);
      }
    };
    void setupTyping();
    return () => {
      if (typingChannel) {
        supabase.removeChannel(typingChannel).catch((e) => {
          console.warn('typing unsubscribe warning:', e);
        });
      }
    };
  }, [chatId]);

  // 🔹 Scroll to bottom (Unchanged)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔹 Send a message (Unchanged)
  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || !chatId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    await updateTypingStatus(true);

    try {
      const newMessage: Message = {
        chat_id: chatId,
        sender: 'user',
        message: text,
        status: 'sent',
        created_at: new Date().toISOString(),
      };
      setInputValue('');
      const { error } = await supabase.from('chat_messages').insert(newMessage);
      if (error) {
        console.error('send message error:', error);
        setInputValue(text);
        return;
      }
      if (!adminOnline) {
        setTimeout(async () => {
          try {
            await supabase.from('chat_messages').insert({
              chat_id: chatId,
              sender: 'admin',
              message:
                "Thanks for your message! I'm currently offline but will get back to you soon. You can check out my portfolio in the meantime.",
              status: 'sent',
              created_at: new Date().toISOString(),
            });
          } catch (err) {
            console.error('auto-reply failed:', err);
          }
        }, 1800);
      }
    } catch (err) {
      console.error('send message network error:', err);
    } finally {
      await updateTypingStatus(false);
    }
  };

  // 🔹 Last seen formatter (Unchanged)
  const formatLastSeen = () => {
    if (!lastSeen) return 'offline';
    const diffMins = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return 'offline';
  };

  return (
    <>
      {/* Floating Button (Unchanged) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(v => !v)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${adminOnline
            ? 'bg-green-500 shadow-lg shadow-green-500/50 border-2 border-green-300'
            : 'bg-[#1254FF] shadow-lg shadow-blue-500/50'
          }`}
        aria-label="Open chat"
      >
        💬
        {adminOnline && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
          />
        )}
      </motion.button>

      {/* Chat Window (Task 1: Animation already implemented) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} // Smoother transition
            className="fixed bottom-24 right-6 z-40 w-96 h-96 glass rounded-xl shadow-2xl flex flex-col overflow-hidden border border-[#1254FF]/20"
          >
            {/* Header (Unchanged) */}
            <div className="bg-gradient-to-r from-[#1254FF] to-[#00C4FF] p-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">DMS Support</h3>
                <button onClick={() => setIsOpen(false)} aria-label="Close chat">✕</button>
              </div>
              <p className="text-sm opacity-90">
                {adminOnline ? '🟢 Online' : `🔴 Last seen ${formatLastSeen()}`}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-[#8D8D8D] py-8">
                  <p>Start a conversation</p>
                </div>
              )}

              {messages.map((m, idx) => (
                <motion.div
                  key={`${m.id ?? 'tmp'}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${m.sender === 'user' ? 'bg-[#1254FF] text-white' : 'bg-[#333333] text-white'
                      }`}
                  >
                    <p className="text-sm">{m.message}</p>
                    
                    {/* === START: SEEN INDICATOR FIX (TASK 3) === */}
                    {m.sender === 'user' && (
                      <div className={`text-xs mt-1 text-right flex items-center justify-end gap-1 ${m.status === 'seen' ? 'text-[#00C4FF]' : 'text-gray-400'}`}>
                        {m.status === 'seen' ? (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center"
                            style={{ filter: 'drop-shadow(0 0 2px #00C4FF88)' }} // Aqua-blue glow
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="inline -mt-0.5">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12.6l5.1 5.1L19.6 7"></path>
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.6 12.6l5.1 5.1L24.1 7" opacity="0.6" transform="translate(-4, 0)"></path>
                            </svg>
                          </motion.span>
                        ) : (
                          <span className="flex items-center text-white/60">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="inline -mt-0.5">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12.6l5.1 5.1L19.6 7"></path>
                            </svg>
                          </span>
                        )}
                      </div>
                    )}
                    {/* === END: SEEN INDICATOR FIX === */}

                  </div>
                </motion.div>
              ))}

              {/* === START: ADMIN TYPING ANIMATION FIX (TASK 2) === */}
              <AnimatePresence>
                {adminTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5, transition: { duration: 0.3 } }} // Smooth fade-out
                    className="flex justify-start items-center gap-2"
                  >
                    <div className="bg-[#333333] text-white px-4 py-3 rounded-lg flex items-center gap-2">
                      <span className="text-sm opacity-90">Admin is typing</span>
                      <motion.span
                        animate={{ y: [0, -3, 0], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0, ease: "easeInOut" }}
                        className="inline-block w-1.5 h-1.5 bg-white rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -3, 0], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
                        className="inline-block w-1.5 h-1.5 bg-white rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -3, 0], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
                        className="inline-block w-1.5 h-1.5 bg-white rounded-full"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* === END: ADMIN TYPING ANIMATION FIX === */}

              <div ref={messagesEndRef} />
            </div>

            {/* Input (Unchanged) */}
            <div className="border-t border-[#1254FF]/30 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    setInputValue(v);
                    handleOnTyping(v);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleSendMessage();
                  }}
                  onBlur={handleBlur}
                  placeholder="Type a message..."
                  className="flex-1 bg-black/50 border border-[#1254FF]/30 rounded-lg px-3 py-2 text-white placeholder-[#8D8D8D] focus:outline-none focus:border-[#00C4FF]"
                />
                <button
                  onClick={() => void handleSendMessage()}
                  className="bg-[#1254FF] hover:bg-[#00C4FF] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}