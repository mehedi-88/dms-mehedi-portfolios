'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
// Note: This component assumes you have a 'TypingIndicator' component imported
// Since it wasn't provided, I've re-created the animation logic inside this file
// in the JSX for "adminTyping".

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
  const [aiThinking, setAiThinking] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  
  // *** দ্রষ্টব্য: আমি 'isMobile' স্টেটটি সরিয়ে দিয়েছি কারণ এটি আর প্রয়োজন নেই ***
  // const [isMobile, setIsMobile] = useState(false);

  // --- START TYPING LOGIC ---
  const isTypingRef = useRef(false);

  const updateTypingStatus = useCallback(async (isTyping: boolean) => {
    if (!chatId || !guestName || isTyping === isTypingRef.current) return;
    isTypingRef.current = isTyping;

    try {
      const { error } = await supabase.from('typing_status').upsert(
        {
          chat_id: chatId,
          user_id: guestName,
          is_typing: isTyping,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'chat_id,user_id' }
      );
      if (error) {
        console.error('typing upsert error:', error);
        isTypingRef.current = !isTyping; // Revert on error
      }
    } catch (error) {
      console.error('typing update error:', error);
    }
  }, [chatId, guestName]);
  
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

  const handleBlur = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    updateTypingStatus(false);
  };
  // --- END TYPING LOGIC ---

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

  // Detect mobile
  useEffect(() => {
    // *** দ্রষ্টব্য: 'isMobile' ডিটেকশন আর প্রয়োজন নেই, তাই আমি এটি মুছে ফেলেছি ***
  }, []);

  // Initialize Chat
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

  // Fetch Initial Messages
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
  }, [chatId, scrollToBottom]);

  // Real-time Message Sync
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
          if (
            payload.new.sender === 'admin' &&
            payload.new.message !== 'AI is thinking...'
          ) {
            setAiThinking(false);
            setMessages(prev =>
              prev.filter(m => m.message !== 'AI is thinking...').concat(payload.new)
            );
          } else if (payload.new.message === 'AI is thinking...') {
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

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Scroll when widget opens
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [isOpen, messages.length, scrollToBottom]);

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
        if (err) console.error('Typing subscription error:', err);
      });
    channelsRef.current.push(typingChannel);
    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [chatId, guestName]);

  // Real-time subscription for "Seen" status
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

  // Handle Send Message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    await updateTypingStatus(true); // Flash typing on send

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
      setInputValue('');
      const { error } = await supabase.from('chat_messages').insert(newMessage);
      if (error) {
        setMessages(prev => prev.filter(m => m.id !== newMessage.id));
        setInputValue(newMessage.message);
        return;
      }
      if (!adminOnline) {
        setAiThinking(true);
        try {
          const response = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [...messages, newMessage] }),
          });
          if (response.ok) {
            const { reply } = await response.json();
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
          setAiThinking(false);
        }
      }
    } catch {
      // Send message network failure
    } finally {
      await updateTypingStatus(false); // Stop typing after send
    }
  };

  // Format Last Seen
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

  // Keep-alive pings
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && chatId) {
        supabase.from('chat_sessions').update({
          last_seen: new Date().toISOString()
        }).eq('id', chatId);
      }
    };
    const handleFocus = () => {
      if (chatId) {
        supabase.from('chat_sessions').update({
          last_seen: new Date().toISOString()
        }).eq('id', chatId);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    const healthCheck = setInterval(() => {
      if (chatId && !document.hidden) {
        supabase.from('chat_sessions').update({
          last_seen: new Date().toISOString()
        }).eq('id', chatId);
      }
    }, 30000);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(healthCheck);
    };
  }, [chatId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Welcome bubble
  useEffect(() => {
    if (showWelcome) {
      const timeout = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showWelcome]);

  return (
    <>
      {/* Floating welcome bubble */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.42, ease: 'easeInOut' }}
            className="fixed z-[51] bottom-24 right-6 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#121e45] via-[#15e8e4]/60 to-[#1650e3] text-white font-semibold text-base shadow-2xl border-2 border-[#1efcff40] backdrop-blur-xl max-w-xs animate-pulse select-none"
            style={{ fontFamily: 'Inter,Arial,sans-serif', pointerEvents: 'none', letterSpacing: '-.01em' }}
          >
            Hi there! I can help you.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Floating Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-20 h-20 rounded-full flex items-center justify-center text-2xl focus:outline-none select-none group bg-transparent border-none"
        aria-label="Open chat"
        tabIndex={0}
        style={{ WebkitTapHighlightColor: 'transparent', background: 'none', boxShadow: 'none', willChange: 'filter' }}
      >
        <span className="absolute inset-0 z-0 pointer-events-none">
          {adminOnline ? (
            <svg width="100%" height="100%" viewBox="0 0 80 80" className="drop-shadow-lg">
              {/* === FIX: Removed isMobile check, always render animation === */}
              <>
                <motion.circle cx="40" cy="40" r="36" fill="#C3FFD6" opacity={0.09}
                  animate={{ scale: [1, 1.13, 1], opacity: [0.12, 0.21, 0.09] }}
                  transition={{ duration: 4.6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }} />
                <motion.path
                  d="M32 54 Q40 67 48 54 M24 46 Q40 63 56 46"
                  stroke="url(#neuralGradient1)" strokeWidth="3" fill="none"
                  animate={{ strokeDashoffset: [20, 0, -20] }}
                  strokeDasharray="20 17"
                  transition={{ duration: 3.4, repeat: Infinity, ease: 'linear' }}
                />
                <motion.circle
                  cx="40" cy="40" r="20" fill="#81FFD1" opacity={0.18}
                  animate={{ scale: [1, .97, 1], opacity: [0.18, 0.28, 0.11] }}
                  transition={{ duration: 2.6, repeat: Infinity }} />
              </>
              {/* === END FIX === */}
              <radialGradient id="neuralSparkNucleus" cx="50%" cy="50%" r="61%">
                <stop offset="0%" stopColor="#fff" stopOpacity=".96" />
                <stop offset="32%" stopColor="#31ffda" stopOpacity=".72" />
                <stop offset="100%" stopColor="#00e289" />
              </radialGradient>
              <circle cx="40" cy="40" r="14" fill="url(#neuralSparkNucleus)" filter="url(#blurCore)" />
              <defs>
                <radialGradient id="neuralGradient1" cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor="#b8ffd8" />
                  <stop offset="100%" stopColor="#18fb66" />
                </radialGradient>
                <filter id="blurCore"><feGaussianBlur stdDeviation="3.2" /></filter>
              </defs>
            </svg>
          ) : (
            <svg width="100%" height="100%" viewBox="0 0 80 80" className="drop-shadow-lg">
              {/* === FIX: Removed isMobile check, always render animation === */}
              <>
                <motion.circle cx="40" cy="40" r="36" fill="#FFD1D5" opacity={0.11}
                  animate={{ scale: [1.04, 1, 1.12], opacity: [.11, .23, .07] }}
                  transition={{ duration: 4.2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }} />
                <motion.path
                  d="M32 54 Q40 67 48 54 M24 46 Q40 63 56 46"
                  stroke="url(#neuralGradientR)" strokeWidth="3" fill="none"
                  animate={{ strokeDashoffset: [21, -14, 21] }}
                  strokeDasharray="20 17"
                  transition={{ duration: 3.9, repeat: Infinity, ease: 'linear' }}
                />
                <motion.circle
                  cx="40" cy="40" r="20" fill="#DF5852" opacity={0.18}
                  animate={{ scale: [1, .99, 1.02], opacity: [0.18, 0.34, 0.13] }}
                  transition={{ duration: 2.6, repeat: Infinity }} />
              </>
              {/* === END FIX === */}
              <radialGradient id="neuralCoreR" cx="50%" cy="50%" r="61%">
                <stop offset="0%" stopColor="#fff" stopOpacity=".91" />
                <stop offset="37%" stopColor="#ff6363" stopOpacity=".78" />
                <stop offset="100%" stopColor="#eb003b" />
              </radialGradient>
              <circle cx="40" cy="40" r="14" fill="url(#neuralCoreR)" filter="url(#blurCoreR)" />
              <defs>
                <radialGradient id="neuralGradientR" cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor="#ffeaea" />
                  <stop offset="100%" stopColor="#ff3a54" />
                </radialGradient>
                <filter id="blurCoreR"><feGaussianBlur stdDeviation="3.2" /></filter>
              </defs>
            </svg>
          )}
        </span>
        <span className="z-10 relative font-extrabold text-[1.35rem] sm:text-[1.65rem] text-[#1efcff] drop-shadow-[0_0_32px_#00e2db80] pointer-events-none leading-tight flex items-center justify-center w-full h-full" style={{ fontFamily: 'Orbitron,Roboto,Arial,sans-serif', letterSpacing: '-1px', textAlign: 'center' }}>DMS&nbsp;<span className='text-[#ffffff]'>AI</span></span>
      </motion.button>

      {/* Enhanced Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40 w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[calc(100vh-6rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#1254FF]/30 bg-gradient-to-b from-gray-900 to-black backdrop-blur-xl dark:from-gray-900 dark:to-black"
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
                  <p>Start a conversation…</p>
                </div>
              )}
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, scale: 0.93 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 31 }}
                  className={`relative flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end w-full`}
                  style={{ minHeight: '28px' }}
                >
                  {message.sender === 'admin' && (
                    <span className="mr-2 flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#1254ff] to-[#0ed6a7] flex items-center justify-center shadow-lg border-2 border-white select-none" style={{ fontFamily: 'Orbitron', fontWeight: 'bold', fontSize: '1.11rem', color: '#fff' }}>A</span>
                  )}
                  <div
                    className={`relative px-4 pt-3 pb-4 rounded-3xl text-white break-words select-text shadow-lg border-2 ${message.sender === 'user' ? 'from-[#1d2859]/70 via-[#05ffe0]/40 to-[#0b6e88]/80 bg-gradient-to-br ml-auto text-right border-[#00d1b3]/30' : 'from-[#192040]/90 via-[#32e2ff]/27 to-[#2851cc]/60 bg-gradient-to-bl mr-0 text-left border-[#4ea3ff]/28'} w-fit max-w-[81vw] sm:max-w-[62%]`}
                    style={{ filter: 'drop-shadow(0 0 14px #00e2db21)', fontFamily: 'Inter,Roboto,Arial,sans-serif', marginLeft: message.sender === 'admin' ? '0.2rem' : 0 }}
                  >
                    <span className="block font-semibold text-xs opacity-75 mb-1 select-none tracking-wide" style={{ fontFamily: 'Orbitron,Arial,sans-serif' }}>
                      {message.sender === 'user' ? '' : 'Admin'}
                    </span>
                    <div className="relative z-10"><span className="text-[1.08rem] leading-snug whitespace-pre-line" style={{ wordBreak: 'break-word' }}>{message.message}</span></div>
                    
                    {/* --- START: SEEN STATUS FIX --- */}
                    {message.sender === 'user' && (
                      <span className={`flex items-center justify-end gap-1 w-full mt-2 text-[11px] font-semibold select-none ${message.status === 'seen' ? 'text-[#49ff8c]' : 'text-white/60'}`} style={{ fontFamily: 'Orbitron,Arial,sans-serif' }}>
                        {message.status === 'seen' ? (
                          <>
                            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" className="inline -mt-0.5" style={{ verticalAlign: 'middle' }}>
                              <path d="M2.5 6.5l3.5 3.0 5.5-7.0" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M7.5 9.5l2.5 2 5.5-7.0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="ml-1 font-bold">Seen</span>
                          </>
                        ) : (
                          <>
                            <svg width="15" height="15" fill="none" viewBox="0 0 16 16" className="inline -mt-0.5" style={{ verticalAlign: 'middle' }}>
                              <path d="M3.5 8.25l3.5 3.25 5.5-7.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="ml-1">Sent</span>
                          </>
                        )}
                      </span>
                    )}
                    {/* --- END: SEEN STATUS FIX --- */}
                  </div>
                </motion.div>
              ))}
              
              {/* --- START: TYPING ANIMATION FIX --- */}
              <AnimatePresence>
                {adminTyping && (
                  <motion.div
                    key="admin-typing"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ type: 'spring', duration: 0.65 }}
                    className="relative my-2 flex justify-start items-end"
                  >
                    <span className="mr-2 flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#1254ff] to-[#0ed6a7] flex items-center justify-center shadow-lg border-2 border-white select-none" style={{ fontFamily: 'Orbitron', fontWeight: 'bold', fontSize: '1.11rem', color: '#fff' }}>A</span>
                    <div className="relative px-5 py-3 rounded-2xl backdrop-blur-2xl bg-gradient-to-br from-blue-500/60 via-cyan-400/40 to-cyan-700/30 border border-white/15 shadow-[0_0_32px_10px_rgba(0,212,255,0.12)]">
                      <svg width="42" height="19" className="absolute -top-2 left-2 pointer-events-none" viewBox="0 0 42 19" fill="none"><motion.ellipse cx="21" cy="9" rx="16" ry="8" fill="#73e2fd" opacity={0.12} animate={{ scaleX: [1, 1.08, 1], scaleY: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity }} /></svg>
                      <motion.div animate={{ scale: [1, 1.05, 1], filter: ['blur(0px)', 'blur(1.2px)', 'blur(2px)', 'blur(0.5px)'] }} transition={{ duration: 2, repeat: Infinity }} className="w-8 h-5 flex items-center justify-center">
                        <motion.div animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0 }} className="inline-block w-2 h-2 bg-white rounded-full mx-0.5" />
                        <motion.div animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.22 }} className="inline-block w-2 h-2 bg-white rounded-full mx-0.5" />
                        <motion.div animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.45 }} className="inline-block w-2 h-2 bg-white rounded-full mx-0.5" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* --- END: TYPING ANIMATION FIX --- */}

              <AnimatePresence>
                {aiThinking && (
                  <motion.div
                    key="ai-glass-ripple"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ type: 'spring', duration: 0.65 }}
                    className="relative my-2 flex justify-start items-end"
                  >
                    <span className="mr-2 flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#1254ff] to-[#0ed6a7] flex items-center justify-center shadow-lg border-2 border-white select-none" style={{ fontFamily: 'Orbitron', fontWeight: 'bold', fontSize: '1.11rem', color: '#fff' }}>A</span>
                    <div className="relative px-5 py-3 rounded-2xl backdrop-blur-2xl bg-gradient-to-br from-blue-500/60 via-cyan-400/40 to-cyan-700/30 border border-white/15 shadow-[0_0_32px_10px_rgba(0,212,255,0.12)]">
                      <svg width="42" height="19" className="absolute -top-2 left-2 pointer-events-none" viewBox="0 0 42 19" fill="none"><motion.ellipse cx="21" cy="9" rx="16" ry="8" fill="#73e2fd" opacity={0.12} animate={{ scaleX: [1, 1.08, 1], scaleY: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity }} /></svg>
                      <motion.div animate={{ scale: [1, 1.05, 1], filter: ['blur(0px)', 'blur(1.2px)', 'blur(2px)', 'blur(0.5px)'] }} transition={{ duration: 2, repeat: Infinity }} className="w-8 h-5 flex items-center justify-center">
                        <motion.div animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0 }} className="inline-block w-2 h-2 bg-white rounded-full mx-0.5" />
                        <motion.div animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.22 }} className="inline-block w-2 h-2 bg-white rounded-full mx-0.5" />
                        <motion.div animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.45 }} className="inline-block w-2 h-2 bg-white rounded-full mx-0.5" />
                      </motion.div>
                      <span className="text-xs text-white/90 ml-3 select-none drop-shadow-lg">AI is thinking...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                    handleOnTyping(e.target.value); // Use new handler
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  onBlur={handleBlur} // Use new handler
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