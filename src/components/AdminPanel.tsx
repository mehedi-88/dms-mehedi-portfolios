'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, User, Wifi, WifiOff, Send, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import TypingIndicator from './TypingIndicator';

function AdminLoginModal({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (email === 'dmsmehedis@gmail.com' && password === 'Admin123') {
        localStorage.setItem('admin_session', 'true');
        onSuccess();
      } else {
        setError('Invalid credentials.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <form
        onSubmit={handleLogin}
        className="p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-[#1254FF] via-[#010e2e] to-black shadow-2xl w-full max-w-md border border-[#1254FF]/30"
      >
        <h2 className="font-bold text-2xl mb-6 text-white flex items-center gap-2">
          Admin Login
        </h2>
        <div className="mb-5">
          <label className="block text-white/80 mb-1 text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800/80 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1254FF]/50 focus:border-[#1254FF] transition-all"
            placeholder="admin@email.com"
            autoFocus
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-white/80 mb-1 text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800/80 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4FF]/50 focus:border-[#00C4FF] transition-all"
            placeholder="Password"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white rounded-xl font-bold shadow-lg transition-all hover:shadow-xl"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </form>
    </div>
  );
}

interface Message {
  id: string;
  chat_id: string;
  sender: 'user' | 'admin';
  message: string;
  status: 'sent' | 'seen';
  created_at: string;
}

export function AdminPanel() {
  const [adminOnline, setAdminOnline] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [lastSeen, setLastSeen] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const channelsRef = useRef<RealtimeChannel[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Add new state for AI thinking UI animation (local, not in messages array)
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('admin_presence_channel')
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

    channelsRef.current.push(channel);

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
        console.error('Fetch initial presence error:', err);
      }
    };

    fetchInitialPresence();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    const typingChannel = supabase
      .channel(`typing_status_${selectedChat}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status',
          filter: `chat_id=eq.${selectedChat}`,
        },
        (payload: any) => {
          if (!payload?.new) return;
          if (payload.new.user_id !== 'admin') {
            setUserTyping(!!payload.new.is_typing);
          }
        }
      )
      .subscribe();
    channelsRef.current.push(typingChannel);
    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;
    const chatChannel = supabase
      .channel(`admin_msg_${selectedChat}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_id=eq.${selectedChat} AND sender=eq.user`,
      }, async (payload: any) => {
        // Optimistically add the new message to the UI
        const newMessage: Message = {
          id: payload.new.id,
          chat_id: payload.new.chat_id,
          sender: payload.new.sender,
          message: payload.new.message,
          status: payload.new.status,
          created_at: payload.new.created_at,
        };
        setMessages((prev) => {
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        // Update the status of the newly inserted message to 'seen'
        try {
          await supabase.from('chat_messages')
            .update({ status: 'seen' })
            .eq('id', payload.new.id) // Update only the specific new message
            .eq('chat_id', selectedChat)
            .eq('sender', 'user')
            .eq('status', 'sent');
        } catch (err) {
          console.error('Error updating seen status:', err);
        }
      })
      .subscribe();
    channelsRef.current.push(chatChannel);
    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', selectedChat)
          .order('created_at', { ascending: true });

        if (!error && data) {
          setMessages(data);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    const messagesChannel = supabase
      .channel(`admin_messages_${selectedChat}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${selectedChat}`,
        },
        (payload: any) => {
          const newMessage: Message = {
            id: payload.new.id,
            chat_id: payload.new.chat_id,
            sender: payload.new.sender,
            message: payload.new.message,
            status: payload.new.status,
            created_at: payload.new.created_at,
          };
          setMessages((prev) => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${selectedChat}`,
        },
        (payload: any) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? payload.new : m))
          );
        }
      )
      .subscribe();

    channelsRef.current.push(messagesChannel);
    fetchMessages();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;
    const markUserMessagesAsSeen = async () => {
      try {
        await supabase.from('chat_messages')
          .update({ status: 'seen' })
          .eq('chat_id', selectedChat)
          .eq('sender', 'user')
          .eq('status', 'sent');
      } catch (error) {
        console.error('Error marking user messages as seen:', error);
      }
    };
    markUserMessagesAsSeen();
  }, [selectedChat]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .order('last_seen', { ascending: false })
          .limit(10);
        if (!error && data) {
          setActiveChats(data);
          if (!selectedChat && data.length > 0) {
            setSelectedChat(data[0].id);
          }
        }
      } catch (e) {
        console.error('fetchChats error:', e);
      }
    };

    fetchChats();
    const interval = setInterval(fetchChats, 5000);

    return () => clearInterval(interval);
  }, [selectedChat]);

  const togglePresence = useCallback(async () => {
    try {
      const newStatus = !adminOnline;

      const { data: updateData, error: updateError } = await supabase
        .from('user_presence')
        .update({
          is_online: newStatus,
          last_seen: new Date().toISOString(),
        })
        .eq('user_id', 'admin')
        .select();

      // If no record was updated (record doesn't exist), insert new one
      if (!updateData || updateData.length === 0) {
        const { error: insertError } = await supabase
          .from('user_presence')
          .insert({
            user_id: 'admin',
            is_online: newStatus,
            last_seen: new Date().toISOString(),
          });

        if (insertError && insertError.code !== '23505') {
          console.error('Error inserting presence:', insertError);
        }
      } else if (updateError) {
        console.error('Error updating presence:', updateError);
      }

      // Also set typing status to false when going offline
      if (!newStatus) {
        await supabase
          .from('typing_status')
          .update({ is_typing: false })
          .eq('user_id', 'admin');
      }
    } catch (err) {
      console.error('togglePresence failed:', err);
    }
  }, [adminOnline]);

  // Handle Logout
  const handleLogout = useCallback(async () => {
    try {
      // Set admin offline before logging out
      // First try to update existing record
      const { data: updateData, error: updateError } = await supabase
        .from('user_presence')
        .update({
          is_online: false,
          last_seen: new Date().toISOString(),
        })
        .eq('user_id', 'admin')
        .select();

      // If no record was updated (record doesn't exist), insert new one
      if (!updateData || updateData.length === 0) {
        const { error: insertError } = await supabase
          .from('user_presence')
          .insert({
            user_id: 'admin',
            is_online: false,
            last_seen: new Date().toISOString(),
          });

        if (insertError && insertError.code !== '23505') {
          console.error('Error inserting presence on logout:', insertError);
        }
      } else if (updateError) {
        console.error('Error updating presence on logout:', updateError);
      }

      // Clear typing status
      await supabase
        .from('typing_status')
        .update({ is_typing: false })
        .eq('user_id', 'admin');

      // Clear session
      localStorage.removeItem('admin_session');
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, []);

  // Debounced typing status update (2-second delay)
  const debouncedTyping = useCallback((isTyping: boolean) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const updateTyping = async () => {
      const chatID = selectedChat ? selectedChat : undefined;
      if (!chatID) return; // Don't allow 'broadcast' fallback
      try {
        await supabase.from('typing_status').upsert({
          chat_id: chatID,
          user_id: 'admin',
          is_typing: isTyping,
        }, {
          onConflict: 'chat_id,user_id'
        });
      } catch (err) {
        console.error('Error updating typing status:', err);
      }
    };
    typingTimeoutRef.current = setTimeout(updateTyping, isTyping ? 0 : 2000);
  }, [selectedChat]);

  // Handle Input Change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  }, []);

  // Handle Send Message (actually send to database)
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !selectedChat) return;
    try {
      const message = {
        id: uuidv4(),
        chat_id: selectedChat,
        sender: 'admin' as const,
        message: inputValue,
        status: 'sent' as const,
        created_at: new Date().toISOString(),
      };


      setMessages(prev => {

        return [...prev, message];
      });

      const { error } = await supabase.from('chat_messages').insert(message);


      if (error) {
        console.error('Error sending admin message:', error);
        // Remove the optimistically added message if insertion failed
        setMessages(prev => prev.filter(m => m.id !== message.id));
      } else {
        setInputValue('');
        debouncedTyping(false);
      }
    } catch (err) {
      console.error('Failed to send admin message:', err);
    }
  }, [inputValue, selectedChat, debouncedTyping, messages]);

  // Helper function to format last seen time with richer variants
  const formatLastSeen = (timestamp: string) => {
    if (!timestamp) return 'Never';
    const lastSeenDate = new Date(timestamp);
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

  const filteredActiveChats = useMemo(() => activeChats, [activeChats]);

  // Cleanup all channels on unmount and set admin offline
  useEffect(() => {
    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      // Set admin offline when component unmounts
      const setAdminOffline = async () => {
        try {
          // First try to update existing record
          const { data: updateData, error: updateError } = await supabase
            .from('user_presence')
            .update({
              is_online: false,
              last_seen: new Date().toISOString(),
            })
            .eq('user_id', 'admin')
            .select();

          // If no record was updated (record doesn't exist), insert new one
          if (!updateData || updateData.length === 0) {
            const { error: insertError } = await supabase
              .from('user_presence')
              .insert({
                user_id: 'admin',
                is_online: false,
                last_seen: new Date().toISOString(),
              });

            if (insertError && insertError.code !== '23505') {
              console.error('Error inserting presence on unmount:', insertError);
            }
          } else if (updateError) {
            console.error('Error updating presence on unmount:', updateError);
          }
        } catch (err) {
          console.error('Failed to set admin offline:', err);
        }
      };
      setAdminOffline();
    };
  }, []);

  useEffect(() => {
    // Check session on mount
    const sess = localStorage.getItem('admin_session');
    if (sess === 'true') {
      setIsAuthenticated(true);
      // Auto-set admin online when authenticated
      const setAdminOnline = async () => {
        try {
          // First try to update existing record
          const { data: updateData, error: updateError } = await supabase
            .from('user_presence')
            .update({
              is_online: true,
              last_seen: new Date().toISOString(),
            })
            .eq('user_id', 'admin')
            .select();

          // If no record was updated (record doesn't exist), insert new one
          if (!updateData || updateData.length === 0) {
            const { error: insertError } = await supabase
              .from('user_presence')
              .insert({
                user_id: 'admin',
                is_online: true,
                last_seen: new Date().toISOString(),
              });

            if (insertError && insertError.code !== '23505') {
              console.error('Error inserting presence on login:', insertError);
            }
          } else if (updateError) {
            console.error('Error updating presence on login:', updateError);
          }
        } catch (err) {
          console.error('Failed to set admin online:', err);
        }
      };
      setAdminOnline();
    }
  }, []);

  if (!isAuthenticated) {
    return <AdminLoginModal onSuccess={() => setIsAuthenticated(true)} />;
  }

  const adminLocalTyping = inputValue.trim().length > 0;

  const MemoizedMessageBubble = React.memo(function MemoizedMessageBubble({ message }: { message: Message }) {
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`flex items-start gap-2 max-w-[70%] ${message.sender === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${message.sender === 'admin'
            ? 'bg-gradient-to-br from-[#1254FF] to-[#00C4FF] text-white'
            : 'bg-gray-600 text-white'}`}>
            {message.sender === 'admin' ? 'A' : 'U'}
          </div>
          <div className={`px-4 py-3 rounded-2xl shadow-md ${message.sender === 'admin'
            ? 'bg-gradient-to-br from-[#1254FF] to-[#00C4FF] text-white rounded-br-md'
            : 'bg-gray-700 text-white border border-gray-600 rounded-bl-md'
          }`}>
            <p className="text-sm leading-relaxed">{message.message}</p>
            <p className={`text-xs opacity-80 mt-2 flex items-center gap-2 ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>  
              <span>
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className="flex items-center gap-1 select-none">
                {message.status === 'seen' ? (
                  <>
                    <svg width="15" height="15" fill="none" viewBox="0 0 16 16">
                      <path d="M3.5 8.25l3.5 3.25 5.5-7.25" stroke="#49ff8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6.5 10.25l2.5 2.25 5.5-7.25" stroke="#49ff8c" strokeWidth="1.44" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[#49ff8c] font-bold">Seen</span>
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" fill="none" viewBox="0 0 16 16">
                      <path d="M3.5 8.25l3.5 3.25 5.5-7.25" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[#ddd]">Sent</span>
                  </>
                )}
              </span>
            </p>
          </div>
        </div>
      </motion.div>
    );
  });

  return (
    <div className="relative min-h-screen w-full bg-[radial-gradient(circle_at_20%_20%,#0A0F1C,transparent_35%),radial-gradient(circle_at_80%_0%,#001133,transparent_30%),linear-gradient(180deg,#0A0F1C,#001133)] text-white/90 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Floating support badge */}
        <span className="fixed top-4 left-4 bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white px-5 py-2 rounded-full shadow-lg glass-blur-sm text-lg font-bold tracking-wide z-40 select-none animate-slide-right">
          Support Admin
        </span>
        {/* Glass Card with Glow and Frosted Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="backdrop-blur-2xl rounded-3xl overflow-hidden max-w-full mx-auto p-0 border border-white/10 shadow-[0_0_30px_rgba(0,196,255,0.12)]"
        >
          {/* Gradient Glass Header + Glow */}
          <div className="bg-gradient-to-r from-[#1254FF] via-[#00C4FF] to-[#1254FF] p-6 md:p-8 text-white shadow-lg border-b border-[#00C4FF]/30 relative">
            <div className="flex flex-wrap gap-3 md:gap-8 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[1.3rem] glassy-gradient bg-[#fff3]/50 flex items-center justify-center shadow-lg border-4 border-[#00c4ff]/25 animate-pop">
                  <User className="w-8 h-8 text-white/85 animate-soft-glow" />
                </div>
                <div>
                  <h2 className="font-bold text-3xl md:text-4xl tracking-tight">Admin Dashboard</h2>
                  <p className="text-base opacity-90 font-semibold tracking-tight">Manage chat, presence & live connections</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Online/Offline Badge */}
                <span className={`px-5 py-2 rounded-2xl text-base font-semibold banana transition-all shadow-md border-2 backdrop-blur-md ${adminOnline ? 'bg-green-500/40 border-green-400 shadow-green-200/50 animate-pulse' : 'bg-gradient-to-r from-red-500/40 to-red-600/40 border-red-400/70 shadow-red-300/30 animate-blink-red'}`}>
                  {adminOnline ? '🟢 Online' : '🔴 Offline'}
                </span>
                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 border border-red-400/50 text-red-300 rounded-xl font-medium hover:bg-red-500/30 transition-all duration-200"
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </div>
          <div className="p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start bg-transparent">
            {/* Column 1: Active Chats (Full Width) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Presence Control Card - Compact */}
              <div className="p-4 rounded-xl backdrop-blur-xl bg-[#0F172A]/70 border border-white/10 shadow-[0_0_20px_rgba(0,196,255,0.08)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {adminOnline ? (
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    ) : (
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-blink-red"></div>
                    )}
                    <span className="text-sm font-medium text-white/90">
                      {adminOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePresence}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${adminOnline
                      ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                      : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                      }`}
                  >
                    Go {adminOnline ? 'Offline' : 'Online'}
                  </motion.button>
                </div>
              </div>

              {/* Active Chats */}
              <div className="p-6 rounded-2xl backdrop-blur-xl bg-[#0F172A]/70 border border-white/10 shadow-[0_0_30px_rgba(0,196,255,0.12)]">
                <h2 className="text-lg font-semibold mb-4 text-white/90">Active Chats</h2>
                <ul className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {filteredActiveChats.map((chat) => (
                    <li
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`rounded-xl border px-4 py-3 cursor-pointer transition-all backdrop-blur ${selectedChat === chat.id ? 'border-[#00C4FF] bg-gradient-to-br from-[#1254FF]/10 to-[#00C4FF]/10' : 'border-white/10 bg-white/5 hover:border-[#00C4FF]/40'}`}
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white/90 text-sm truncate max-w-[120px]">
                            {chat.guest_name.replace('guest_', 'User ')}
                          </span>
                          <span className="text-[10px] font-mono opacity-60 whitespace-nowrap">
                            {chat.last_seen ? formatLastSeen(chat.last_seen) : ''}
                          </span>
                        </div>
                        <p className="text-xs truncate opacity-60">{chat.last_message?.slice(0, 40) || 'No message yet'}</p>
                      </div>
                    </li>
                  ))}
                  {filteredActiveChats.length === 0 && (
                    <li className="text-sm text-white/50 border border-white/10 rounded-xl px-4 py-6 text-center">No active chats</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Column 2: Chat Interface */}
            <div className="space-y-6 min-w-[400px] lg:col-span-3">
              <div className="rounded-2xl backdrop-blur-xl bg-[#0F172A]/70 border border-white/10 shadow-[0_0_30px_rgba(0,196,255,0.12)] h-[700px] flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#1254FF]/20 to-[#00C4FF]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-6 h-6 text-[#00C4FF]" />
                      <div>
                        <h2 className="text-lg font-semibold text-white/90">
                          {selectedChat ? `Chat with ${activeChats.find(c => c.id === selectedChat)?.guest_name || 'User'}` : 'Select a Chat'}
                        </h2>
                        {selectedChat && (
                          <p className="text-sm text-white/60">{messages.length} messages</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {!selectedChat ? (
                    <div className="flex items-center justify-center h-full text-center text-white/50">
                      <div>
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg">Select a chat to start messaging</p>
                        <p className="text-sm mt-2">Choose from active chats on the left</p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center text-white/50">
                      <div>
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No messages yet</p>
                        <p className="text-sm mt-2">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <MemoizedMessageBubble message={message} key={message.id} />
                    ))
                  )}
                  {userTyping && <TypingIndicator label="User is typing..." align="left" />}
                  {aiThinking && <TypingIndicator label="AI is thinking..." align="left" isAI />}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Area */}
                {selectedChat && (
                  <div className="p-4 border-t border-white/10 bg-gray-900/30">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-full">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={handleInputChange}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSendMessage();
                            } else {
                              debouncedTyping(true);
                            }
                          }}
                          onKeyUp={() => {
                            if (!inputValue.trim()) {
                              debouncedTyping(false);
                            }
                          }}
                          onBlur={() => { debouncedTyping(false); if (typingTimeoutRef.current) { clearTimeout(typingTimeoutRef.current); } }}
                          placeholder="Type your message..."
                          className="w-full bg-gray-800/60 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#00C4FF] focus:border-[#00C4FF] transition-all resize-none"
                        />
                        {adminLocalTyping && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-blue-600/20 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 shadow-lg">
                              <p className="text-xs text-white flex items-center gap-2">
                                <span className="inline-flex gap-1">
                                  <motion.span
                                    animate={{ y: [0, -2, 0], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                    className="inline-block w-1.5 h-1.5 bg-white rounded-full"
                                  />
                                  <motion.span
                                    animate={{ y: [0, -2, 0], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                    className="inline-block w-1.5 h-1.5 bg-white rounded-full"
                                  />
                                  <motion.span
                                    animate={{ y: [0, -2, 0], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                    className="inline-block w-1.5 h-1.5 bg-white rounded-full"
                                  />
                                </span>
                                You are typing...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <motion.button
                        onClick={handleSendMessage}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!inputValue.trim()}
                        className={`w-full max-w-xs bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white p-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center ${!inputValue.trim() ? 'opacity-40 cursor-not-allowed' : ''
                          }`}
                      >
                        <Send className="w-5 h-5 mr-2" /> Send Message
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </div>


          </div>

        </motion.div>
        <style>{`
          .glassy-card { backdrop-filter: blur(14px) saturate(145%); background-blend-mode: overlay; }
          .glassy-gradient { background: linear-gradient(127deg, #00c4ff33, #1254ff0f 75%); }
          .glass-blur-sm { backdrop-filter: blur(6px); }
          .animate-pop { animation: pop-card 0.7s cubic-bezier(.38,1.15,.57,.91); }
          .animate-slide-right{ animation:slideInRight 1.2s cubic-bezier(.11,.77,.35,1.2); }
          .animate-soft-glow{animation: softGlow 2.2s ease-in-out infinite alternate;}
          .banana { letter-spacing: 0.025em; font-variation-settings: 'wght' 655, 'slnt' 0; }
          @keyframes pop-card{from{transform:scale(.7);} to{transform:scale(1);} }
          @keyframes softGlow{ 0%,100%{filter:drop-shadow(0 0 12px #00fff6cc);} 60%{filter:drop-shadow(0 0 22px #1254ff88);} }
          @keyframes slideInRight{from{transform:translateX(-90px); opacity:0.5;} to{transform:translateX(0); opacity:1;} }
          @keyframes blinkRed { 
            0%, 100% { 
              opacity: 1; 
              box-shadow: 0 0 15px 5px rgba(255, 34, 34, 0.6); 
            } 
            50% { 
              opacity: 0.8; 
              box-shadow: 0 0 25px 8px rgba(255, 10, 10, 0.8); 
            }
          }
          .animate-blink-red { animation: blinkRed 1.5s infinite cubic-bezier(.4, 0, .6, 1); }
        `}</style>
      </div>
    </div>
  );
}
