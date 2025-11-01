'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import type { RealtimeChannel } from '@supabase/supabase-js';
import TypingIndicator from './TypingIndicator';

interface Message {
  id: string;
  chat_id: string;
  sender: 'user' | 'admin';
  message: string;
  status: 'sent' | 'seen';
  created_at: string;
}

export function ChatbotWidgetSupabase() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [adminTyping, setAdminTyping] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [chatId, setChatId] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [lastSeen, setLastSeen] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelsRef = useRef<RealtimeChannel[]>([]);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [userTyping, setUserTyping] = useState(false);
  const lastMessageCountRef = useRef(0);
  // 1. Add aiThinking state for controlling the thinking animation (not in Supabase messages)
  const [aiThinking, setAiThinking] = useState(false);

  const scrollToBottom = useCallback((force = false) => {
    if (!messagesEndRef.current) return;
    const container = messagesEndRef.current.parentElement;
    if (!container) return;

    const isNearBottom = force ||
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    if (isNearBottom) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: force ? 'auto' : 'smooth',
          });
        });
      });
    }
  }, []);


  useEffect(() => {
    const initializeChat = async () => {

      const storedGuest = localStorage.getItem('guest_name');
      const storedChat = localStorage.getItem('chat_id');

      let guestId = storedGuest;
      let chatSessionId = storedChat;


      if (!guestId || !/^guest_[0-9a-fA-F-]{36}$/.test(guestId)) {
        guestId = `guest_${uuidv4()}`;
        localStorage.setItem('guest_name', guestId);
      }
      if (!chatSessionId || !/^[0-9a-fA-F-]{36}$/.test(chatSessionId)) {
        chatSessionId = uuidv4();
        localStorage.setItem('chat_id', chatSessionId);
      }
      setGuestName(guestId);
      setChatId(chatSessionId);


      const { error } = await supabase.from('chat_sessions').upsert({
        id: chatSessionId,
        guest_name: guestId,
        is_online: true,
        last_seen: new Date().toISOString(),
      }, { onConflict: 'id' });

      if (error) console.error('Error creating chat session:', error);


      const fetchInitialPresence = async () => {
        try {
          const { data, error } = await supabase
            .from('user_presence')
            .select('is_online, last_seen')
            .eq('user_id', 'admin')
            .single();

          if (!error && data) {
            setAdminOnline(data.is_online || false);
            setLastSeen(data.last_seen || '');
          }
        } catch (err) {
          console.error('Fetch initial admin presence error:', err);
        }
      };

      fetchInitialPresence();


      const presenceChannel = supabase
        .channel('admin_presence_realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_presence',
            filter: 'user_id=eq.admin',
          },
          (payload: any) => {
            if (payload.new) {
              setAdminOnline(payload.new.is_online || false);
              setLastSeen(payload.new.last_seen || '');
            }
          }
        )
        .subscribe();

      channelsRef.current.push(presenceChannel);

      return () => {

        if (presenceChannel) {
          supabase.removeChannel(presenceChannel);
        }
      };
    };

    initializeChat();
  }, []);


  useEffect(() => {
    if (!chatId) return;

    const fetchInitialMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching initial messages:', error);
        } else if (data) {
          setMessages(data);

          setTimeout(() => scrollToBottom(true), 150);
        }
      } catch (err) {
        console.error('Failed to fetch initial messages:', err);
      }
    };

    fetchInitialMessages();
  }, [chatId]);

  // (A) --- Fix Real-time Message Sync (bidirectional) ---
  // Refactor the real-time subscription for messages:
  useEffect(() => {
    if (!chatId) return;
    const channelName = `chat_messages_${chatId}`;
    const messagesChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload: any) => {
          if (!payload.new) return;
          // 2. Remove any local "AI is thinking..." marker only when a new admin reply arrives
          if (
            payload.new.sender === 'admin' &&
            payload.new.message !== 'AI is thinking...'
          ) {
            setAiThinking(false); // Always clear the AI animation when admin/AI real reply comes
            setMessages(prev =>
              prev.filter(m => m.message !== 'AI is thinking...').concat(payload.new)
            );
          } else if (payload.new.message === 'AI is thinking...') {
            // Instead of showing as a message, use local state only:
            setAiThinking(true);
          } else {
            setMessages(prev => {
              if (prev.some(m => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
          });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload: any) => {
          if (!payload.new) return;
          setMessages(prev =>
            prev.map(m => (m.id === payload.new.id ? { ...m, ...payload.new } : m))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload: any) => {
          if (!payload.old) return;
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      )
      .subscribe();
    channelsRef.current.push(messagesChannel);
    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [chatId]);


  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);


  useEffect(() => {
    if (isOpen && messages.length > 0) {

      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [isOpen, messages.length, scrollToBottom]);



  const debouncedTyping = useCallback((typing: boolean) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const updateTyping = async () => {
      if (!chatId) return;
      try {
        await supabase.from('typing_status').upsert({
          chat_id: chatId,
          user_id: guestName,
          is_typing: typing,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'chat_id,user_id'
        });
      } catch (err) {
        console.error('Error updating typing status:', err);
      }
    };

    typingTimeoutRef.current = setTimeout(() => updateTyping(), typing ? 0 : 2000);
  }, [chatId, guestName]);

  // Real-time subscription for typing status
  useEffect(() => {
    if (!chatId) return;

    const channelName = `typing_status_${chatId}`;

    const typingChannel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'typing_status',
        filter: `chat_id=eq.${chatId}`
      }, (payload: { new: any }) => {
        if (payload.new?.user_id === 'admin') {
          setAdminTyping(!!payload.new?.is_typing);
        } else if (payload.new?.user_id === guestName) {
          setUserTyping(!!payload.new?.is_typing);
        }
      })
      .subscribe((status, err) => {
        console.log('Initial typing subscription status:', status);
        if (err) {
          console.error('Typing subscription error:', err);
        }

        if (status === 'CLOSED' || status === 'TIMED_OUT') {
          console.log(`Typing subscription ${status}, attempting reconnection...`);
          setTimeout(() => {
            supabase.removeChannel(typingChannel);
            setTimeout(() => {
              const reconnectChannel = supabase.channel(channelName)
                .on('postgres_changes', {
                  event: '*',
                  schema: 'public',
                  table: 'typing_status',
                  filter: `chat_id=eq.${chatId}`
                }, (payload: { new: any }) => {
                  if (payload.new?.user_id === 'admin') {
                    setAdminTyping(!!payload.new?.is_typing);
                  } else if (payload.new?.user_id === guestName) {
                    setUserTyping(!!payload.new?.is_typing);
                  }
                })
                .subscribe((newStatus, newErr) => {
                  if (newErr) {
                    console.error('Reconnected typing subscription error:', newErr);
                  } else if (newStatus === 'SUBSCRIBED') {
                    console.log('Typing subscription reconnected successfully');
                  }
                });
              channelsRef.current.push(reconnectChannel);
            }, 2000); // Wait 2 seconds before reconnecting
          }, 500);
        }
      });

    channelsRef.current.push(typingChannel);

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [chatId, guestName]);


  useEffect(() => {
    if (!chatId) return;

    const adminMsgChannel = supabase
      .channel(`admin_seen_${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_id=eq.${chatId} AND sender=eq.admin`
      }, async () => {
        // Mark all user's sent messages as seen
        try {
          await supabase.from('chat_messages')
            .update({ status: 'seen' })
            .eq('chat_id', chatId)
            .eq('sender', 'user')
            .eq('status', 'sent');
        } catch (error) {
          console.error('Error marking messages as seen:', error);
        }
      })
      .subscribe();
    channelsRef.current.push(adminMsgChannel);
    return () => void supabase.removeChannel(adminMsgChannel);
  }, [chatId]);


  const handleTyping = (typing: boolean) => {
    debouncedTyping(typing);
  };

  // (B) Send AI thinking as UI animation only, not as a message in DB
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatId) return;
    try {
      const newMessage = {
        id: uuidv4(),
        chat_id: chatId,
        sender: 'user' as const,
        message: inputValue,
        status: 'sent' as const,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMessage]);
      debouncedTyping(false);
      const { error } = await supabase.from('chat_messages').insert(newMessage);
      if (error) {
        setMessages(prev => prev.filter(m => m.id !== newMessage.id));
        return;
      }
      setInputValue('');
      if (!adminOnline) {
        // Show "AI is thinking..." animation (local only)
        setAiThinking(true);
        try {
                const response = await fetch('/api/ai-chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ messages }),
                });
                if (response.ok) {
                  const { reply } = await response.json();
            // Insert the actual AI reply into supabase
                  const aiReply = {
                    id: uuidv4(),
                    chat_id: chatId,
                    sender: 'admin' as const,
                    message: reply,
                    status: 'sent' as const,
                    created_at: new Date().toISOString(),
                  };
                  await supabase.from('chat_messages').insert(aiReply);
                } else {
                  const fallbackReply = {
                    id: uuidv4(),
                    chat_id: chatId,
                    sender: 'admin' as const,
                    message: "Thank you for your message! I'm currently offline but will get back to you as soon as possible.",
                    status: 'sent' as const,
                    created_at: new Date().toISOString(),
                  };
                  await supabase.from('chat_messages').insert(fallbackReply);
                }
        } catch {
          // Always stop animation if AI errors
          setAiThinking(false);
        }
      }
    } catch {
      /* Send message network failure – no change */
    } finally {
      // AI Thinking fade out will be handled by real-time subscription as soon as admin/AI real message comes
    }
  };

  const formatLastSeen = () => {
    if (!lastSeen) return 'Never';
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastSeenDate.getTime()) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'Online now';
    if (diffMinutes < 60) return `Last seen ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `Last seen ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `Last seen ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return `Last seen on ${lastSeenDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;
  };

  // Handle window focus and visibility changes to ensure connections stay alive
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible, ensure connections are active
        setTimeout(() => {
          // Force a small presence update to keep connection alive
          if (chatId) {
            supabase.from('chat_sessions').update({
              last_seen: new Date().toISOString()
            }).eq('id', chatId);
          }
        }, 1000);
      }
    };

    const handleFocus = () => {
      // Window focused, ensure connections are healthy
      setTimeout(() => {
        if (chatId) {
          supabase.from('chat_sessions').update({
            last_seen: new Date().toISOString()
          }).eq('id', chatId);
        }
      }, 500);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [chatId]);

  // Connection health check - periodic ping to keep connections alive
  useEffect(() => {
    const healthCheck = setInterval(() => {
      if (chatId && !document.hidden) {
        supabase.from('chat_sessions').update({
          last_seen: new Date().toISOString()
        }).eq('id', chatId);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(healthCheck);
  }, [chatId]);

  // Cleanup all channels and timeouts on unmount
  useEffect(() => {
    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      // Clear scroll timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Enhanced Floating Button with soft hover glow */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all group bg-transparent border-none outline-none focus:outline-none`}
        aria-label="Open chat"
        style={{ boxShadow: 'none', background: 'none' }}
      >
        {/* Liquid SVG animation */}
        <span className="absolute inset-0 pointer-events-none select-none z-0">
          {adminOnline ? (
            <svg width="100%" height="100%" viewBox="0 0 64 64">
              {/* Outer plasma/ion rings */}
              <motion.circle cx="32" cy="32" r="29" fill="#00fff0" opacity={0.08} filter="url(#plasmaGglow)"
                animate={{ scale: [1, 1.07, 1.14, 1], opacity: [0.09,0.21,0.27,0.07] }}
                transition={{ duration: 3.7, repeat: Infinity, repeatType: 'mirror', ease:'easeInOut' }}
              />
              <motion.circle cx="32" cy="32" r="22.5" fill="#adffe7" opacity={0.12} filter="url(#plasmaGglow)"
                animate={{ scale: [1, .97, 1.04, 1], opacity: [0.12,.22,.16,0.07] }}
                transition={{ duration: 2.7, repeat: Infinity, repeatType: 'mirror', ease:'linear' }}
              />
              {/* Animated energy-flow liquid orb shape */}
              <motion.path
                d="M31.5,18Q45,25 43,32T32,48Q20,41 22,32T31.5,18Z"
                fill="url(#plasmaLiquid)"
                animate={{
                  d: [
                    'M31.5,18Q45,25 43,32T32,48Q20,41 22,32T31.5,18Z',
                    'M32,20Q46,28 44,32T32,46Q18,39 20,32T32,20Z',
                    'M31.5,18Q45,25 43,32T32,48Q20,41 22,32T31.5,18Z'],
                  scale: [1,1.12,1],
                }}
                transition={{ duration: 6, repeat: Infinity, repeatType:'mirror',ease:'easeInOut' }}
                style={{ filter: 'blur(1.3px)' }}
              />
              {/* Rotating luminous ring for depth */}
              <motion.circle
                cx="32" cy="32" r="13.9"
                fill="none"
                stroke="url(#plasmaInner)"
                strokeWidth="3.3"
                opacity={0.82}
                animate={{ rotate: 360 }}
                transform="rotate(0 32 32)"
                style={{ filter: 'blur(1.2px)' }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              />
              <defs>
                <radialGradient id="plasmaLiquid" cx="50%" cy="50%" r="90%">
                  <stop offset="0%" stopColor="#dff"/>
                  <stop offset="60%" stopColor="#0ffff7" stopOpacity="0.88"/>
                  <stop offset="88%" stopColor="#26e48d"/>
                  <stop offset="100%" stopColor="#00ffa3" stopOpacity="1"/>
                </radialGradient>
                <radialGradient id="plasmaInner" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#e9fff9" stopOpacity="0.2"/>
                  <stop offset="90%" stopColor="#5ff6bb" stopOpacity="0.41"/>
                  <stop offset="100%" stopColor="#0aa689"/>
                </radialGradient>
                <filter id="plasmaGglow">
                  <feGaussianBlur stdDeviation="6"/>
                </filter>
              </defs>
            </svg>
          ) : (
            <svg width="100%" height="100%" viewBox="0 0 64 64">
              {/* Red plasma/ion ripples */}
              <motion.circle cx="32" cy="32" r="29" fill="#ff8484" opacity=".09" filter="url(#plasmaRglow)"
                animate={{scale: [1.01, 1.09, 1],opacity: [.10,.26,.06]}}
                transition={{duration:4.2,repeat:Infinity,repeatType:'mirror',ease:'easeInOut'}}
              />
              <motion.circle cx="32" cy="32" r="22" fill="#ffe3f6" opacity=".14" filter="url(#plasmaRglow)"
                animate={{scale:[1,1.07,1],opacity:[.11,.19,.09]}}
                transition={{duration:3.1,repeat:Infinity,repeatType:'mirror',ease:'linear'}}
              />
              <motion.path
                d="M32,20Q44,28 42,32T32,46Q20,40 22,32T32,20Z"
                fill="url(#plasmaLiquidR)"
                animate={{
                  d:[
                    'M32,20Q44,28 42,32T32,46Q20,40 22,32T32,20Z',
                    'M32,22Q47,29 40,32T32,43Q16,35 24,32T32,22Z',
                    'M32,20Q44,28 42,32T32,46Q20,40 22,32T32,20Z'],
                  scale:[1,1.09,1],
                }}
                transition={{duration:7,repeat:Infinity,repeatType:'mirror',ease:'easeInOut'}}
                style={{filter:'blur(1.1px)'}}
              />
              {/* Rotating/warping inner red-cyan ring */}
              <motion.circle
                cx="32" cy="32" r="13.7"
                fill="none"
                stroke="url(#plasmaInnerR)"
                strokeWidth="3.3"
                opacity={0.65}
                animate={{rotate:360}}
                transform="rotate(0 32 32)"
                style={{filter:'blur(1.4px)'}}
                transition={{duration:13,repeat:Infinity,ease:'linear'}}
              />
              <defs>
                <radialGradient id="plasmaLiquidR" cx="50%" cy="50%" r="90%">
                  <stop offset="0%" stopColor="#fff9fa"/>
                  <stop offset="62%" stopColor="#ff5a96" stopOpacity=".71"/>
                  <stop offset="98%" stopColor="#FF2958"/>
                  <stop offset="100%" stopColor="#fd1b59" stopOpacity="1"/>
                </radialGradient>
                <radialGradient id="plasmaInnerR" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#fff5fc" stopOpacity=".21"/>
                  <stop offset="80%" stopColor="#fd7fc6" stopOpacity=".31"/>
                  <stop offset="100%" stopColor="#b72151"/>
                </radialGradient>
                <filter id="plasmaRglow">
                  <feGaussianBlur stdDeviation="7"/>
                </filter>
              </defs>
            </svg>
          )}
        </span>
        <span className="drop-shadow-lg z-10 relative">💬</span>
        {/* Online/offline dot remains for badge-purposes*/}
        {adminOnline ? (
          <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white shadow-lg z-10" />
        ) : (
          <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-400 rounded-full border-2 border-white shadow-lg z-10" />
        )}
      </motion.button>

      {/* Enhanced Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[calc(100vh-6rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#1254FF]/30 bg-gradient-to-b from-gray-900 to-black backdrop-blur-xl dark:from-gray-900 dark:to-black"
          >
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-[#1254FF] via-[#00C4FF] to-[#1254FF] p-5 text-white shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xl">💬</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">DMS Support</h3>
                    <p className="text-xs opacity-90 font-medium">
                      {adminOnline ? (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          Admin is online now
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full animate-blink-red"></span>
                          <span className="font-bold text-red-400">DMS Assistant (Offline)</span>
                          <span className="opacity-80">· {formatLastSeen()}</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all backdrop-blur-sm"
                  aria-label="Close chat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-[#8D8D8D] py-8">
                  <p>Start a conversation...</p>
                </div>
              )}
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, scale: 0.86 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, boxShadow: message.sender === 'user' ? '0 4px 18px #18e3ff88' : '0 4px 12px #009cfd88' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className={`relative mb-2 px-4 py-3 rounded-2xl sm:rounded-3xl text-white max-w-xs break-words select-text shadow-[0_2px_20px_0_rgba(0,212,255,0.12)] backdrop-blur-xl border border-white/12 bg-gradient-to-br ${message.sender === 'user' ? 'from-[#232b5a]/80 via-[#0fffc4]/50 to-[#0b4cff]/60 ml-auto' : 'from-[#12477d]/80 via-[#32e2ff]/40 to-[#2867cc]/60 mr-auto'}`}
                  style={{ filter: 'drop-shadow(0 0 12px #0fffc977)' }}
                >
                  <span className="font-medium text-xs opacity-75 absolute -top-4 left-2 select-none drop-shadow-lg">
                    {message.sender === 'user' ? '' : 'Admin'}
                        </span>
                  <div className="relative z-10"><span>{message.message}</span></div>
                      {message.sender === 'user' && (
                    <span className="absolute right-3 bottom-1.5 text-[10px] opacity-65 select-none">{message.status === 'seen' ? '✓✓ Seen' : '✓ Sent'}</span>
                  )}
                </motion.div>
              ))}
              {/* Unified Admin Typing Indicator */}
              {adminTyping && <TypingIndicator label="Admin is typing" align="left" />}
              {aiThinking && (
                <AnimatePresence>
                <motion.div
                    key="ai-glass-ripple"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ type: 'spring', duration: 0.65 }}
                    className="relative my-2 flex justify-start"
                >
                    <div className="relative px-5 py-3 rounded-2xl backdrop-blur-2xl bg-gradient-to-br from-blue-500/60 via-cyan-400/40 to-cyan-700/30 border border-white/15 shadow-[0_0_32px_10px_rgba(0,212,255,0.12)]">
                      <svg width="42" height="19" className="absolute -top-2 left-2 pointer-events-none" viewBox="0 0 42 19" fill="none"><motion.ellipse cx="21" cy="9" rx="16" ry="8" fill="#73e2fd" opacity={0.12} animate={{scaleX:[1,1.08,1], scaleY: [1,1.04,1]}} transition={{duration:2,repeat:Infinity}}/></svg>
                      <motion.div animate={{scale:[1,1.05,1], filter:['blur(0px)','blur(1.2px)','blur(2px)','blur(0.5px)']}} transition={{duration:2,repeat:Infinity}} className="w-8 h-5 flex items-center justify-center">
                        <motion.div animate={{ y: [0,-3,0], opacity: [0.4,1,0.4] }} transition={{ duration:1.2, repeat:Infinity, ease:'easeInOut', delay:0 }} className="inline-block w-2 h-2 bg-white rounded-full mx-0.5"/>
                        <motion.div animate={{ y: [0,-3,0], opacity: [0.4,1,0.4] }} transition={{ duration:1.2, repeat:Infinity, ease:'easeInOut', delay:0.22 }} className="inline-block w-2 h-2 bg-white rounded-full mx-0.5"/>
                        <motion.div animate={{ y: [0,-3,0], opacity: [0.4,1,0.4] }} transition={{ duration:1.2, repeat:Infinity, ease:'easeInOut', delay:0.45 }} className="inline-block w-2 h-2 bg-white rounded-full mx-0.5"/>
                </motion.div>
                      <span className="text-xs text-white/90 ml-3 select-none drop-shadow-lg">AI is thinking...</span>
                  </div>
                </motion.div>
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Input Area */}
            <div className="border-t border-gray-800/50 p-4 bg-gray-900/50 backdrop-blur-sm">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    handleTyping(e.target.value.length > 0);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  onBlur={() => {
                    handleTyping(false);
                    if (typingTimeoutRef.current) {
                      clearTimeout(typingTimeoutRef.current);
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1254FF]/50 focus:border-[#1254FF] transition-all"
                />
                <motion.button
                  onClick={handleSendMessage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl font-medium"
                >
                  Send
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
