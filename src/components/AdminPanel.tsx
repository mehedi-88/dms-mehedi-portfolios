'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, User, Wifi, WifiOff, Send, Loader2, Clock, Trash2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import TypingIndicator from './TypingIndicator';
import Toast from './Toast';

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
  const [typingStates, setTypingStates] = useState<Record<string, boolean>>({});
  const [lastSeen, setLastSeen] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const channelsRef = useRef<RealtimeChannel[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [toastMessages, setToastMessages] = useState<string[]>([]);
  const [aiThinking, setAiThinking] = useState(false);
  const lastMessageCountRef = useRef(0);
  const shouldScrollToBottomRef = useRef(true);
  const lastPresenceToggleRef = useRef<number | null>(null);
  const presenceDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // UI-only button handlers
  const handleDeleteChat = useCallback(async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();

    try {
      // Delete messages first
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_id', chatId);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        setToastMessages(['Failed to delete chat messages']);
        return;
      }

      // Delete chat session
      const { error: chatError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', chatId);

      if (chatError) {
        console.error('Error deleting chat session:', chatError);
        setToastMessages(['Failed to delete chat session']);
        return;
      }

      // Update UI immediately
      setActiveChats(prev => prev.filter(chat => chat.id !== chatId));

      // Handle selected chat logic
      if (selectedChat === chatId) {
        const remainingChats = activeChats.filter(chat => chat.id !== chatId);
        if (remainingChats.length > 0) {
          setSelectedChat(remainingChats[0].id);
        } else {
          setSelectedChat('');
        }
      }

      // Clear messages if the deleted chat was selected
      if (selectedChat === chatId) {
        setMessages([]);
      }

      // Show success message
      setToastMessages(['Chat deleted successfully']);

    } catch (err) {
      console.error('Error deleting chat:', err);
      setToastMessages(['Failed to delete chat']);
    }
  }, [selectedChat, activeChats]);

  const handleMarkChat = useCallback((e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    console.log("TODO: Mark chat", chatId);
    alert(`UI ONLY: Marking chat ${chatId}`);
  }, []);

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
          // Debounce presence updates to prevent flickering (500ms)
          if (presenceDebounceRef.current) {
            clearTimeout(presenceDebounceRef.current);
          }
          presenceDebounceRef.current = setTimeout(() => {
            if (payload.new) {
              setAdminOnline(payload.new.is_online || false);
              setLastSeen(payload.new.last_seen || '');
            }
          }, 500);
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

  // Global typing subscription (correctly implemented)
  useEffect(() => {
    const typingChannel = supabase
      .channel('public:typing_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status',
        },
        (payload: any) => {
          console.log('AdminPanel - Typing status received:', payload.new);
          if (!payload?.new) return;
          if (payload.new.user_id !== 'admin') {
            console.log(`AdminPanel - Setting typing for chat ${payload.new.chat_id}: ${payload.new.is_typing}`);
            setTypingStates((prev) => ({
              ...prev,
              [payload.new.chat_id]: !!payload.new.is_typing,
            }));
          }
        }
      )
      .subscribe();
    channelsRef.current.push(typingChannel);
    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, []);

  // Per-chat message subscription
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
        try {
          await supabase.from('chat_messages')
            .update({ status: 'seen' })
            .eq('id', payload.new.id)
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

  // Fetch messages for selected chat with optimization
  const messagesData = useMemo(() => {
    if (!selectedChat) return [];
    return messages.filter(msg => msg.chat_id === selectedChat).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [messages, selectedChat]);

  // Controlled scroll to bottom - only when new messages arrive and user is near bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !selectedChat) return;

    const currentMessageCount = messagesData.length;
    const previousMessageCount = lastMessageCountRef.current;

    // Only scroll if we have new messages
    if (currentMessageCount > previousMessageCount) {
      // Check if user is near the bottom (within 100px)
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      if (isNearBottom || shouldScrollToBottomRef.current) {
        // Use requestAnimationFrame for smooth scrolling
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        });
      }
    }

    lastMessageCountRef.current = currentMessageCount;
  }, [messagesData.length, selectedChat]);

  // Track scroll position to determine if we should auto-scroll
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    shouldScrollToBottomRef.current = isNearBottom;
  }, []);

  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    const fetchMessages = async () => {
      if (!isMounted) return;
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', selectedChat)
          .order('created_at', { ascending: true });
        if (!error && data && isMounted) {
          setMessages(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching messages:', err);
        }
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
          if (!isMounted) return;
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
          if (!isMounted) return;
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? payload.new : m))
          );
        }
      )
      .subscribe();

    channelsRef.current.push(messagesChannel);
    fetchMessages();

    return () => {
      isMounted = false;
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedChat]);

  // Mark messages as seen
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

  // Fetch active chats with debouncing and user presence
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let isMounted = true;

    const fetchChats = async () => {
      if (!isMounted) return;
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .order('last_seen', { ascending: false })
          .limit(10);
        if (!error && data && isMounted) {
          // Get user presence for each chat
          const chatsWithPresence = await Promise.all(
            data.map(async (chat) => {
              try {
                const { data: presenceData } = await supabase
                  .from('user_presence')
                  .select('is_online, last_seen')
                  .eq('user_id', chat.guest_name)
                  .single();
                
                return {
                  ...chat,
                  is_online: presenceData?.is_online || false,
                  last_seen: presenceData?.last_seen || chat.last_seen
                };
              } catch {
                return {
                  ...chat,
                  is_online: false,
                  last_seen: chat.last_seen
                };
              }
            })
          );
          
          setActiveChats(chatsWithPresence);
          if (!selectedChat && chatsWithPresence.length > 0) {
            setSelectedChat(chatsWithPresence[0].id);
          }
        }
      } catch (e) {
        if (isMounted) {
          console.error('fetchChats error:', e);
        }
      }
    };

    // Initial fetch
    fetchChats();
    
    // Set up interval with longer delay to reduce API calls
    intervalId = setInterval(fetchChats, 10000); // Increased from 5000 to 10000ms

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedChat]);

  // Presence Heartbeat System - Update every 10 seconds when online
  useEffect(() => {
    if (!adminOnline) return;

    const heartbeatInterval = setInterval(async () => {
      try {
        const { error } = await supabase
          .from('user_presence')
          .update({
            is_online: true,
            last_seen: new Date().toISOString(),
          })
          .eq('user_id', 'admin');

        if (error) {
          console.error('Heartbeat update error:', error);
        }
      } catch (err) {
        console.error('Heartbeat failed:', err);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(heartbeatInterval);
  }, [adminOnline]);

  // Presence TTL Check - Mark offline after 15 seconds of inactivity
  useEffect(() => {
    const ttlCheckInterval = setInterval(async () => {
      try {
        // Check all user presences and mark offline if last_seen > 15 seconds ago
        const fifteenSecondsAgo = new Date(Date.now() - 15000).toISOString();

        const { error } = await supabase
          .from('user_presence')
          .update({ is_online: false })
          .lt('last_seen', fifteenSecondsAgo)
          .eq('is_online', true);

        if (error) {
          console.error('TTL check error:', error);
        }
      } catch (err) {
        console.error('TTL check failed:', err);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(ttlCheckInterval);
  }, []);

  // Toggle presence with debouncing
  const togglePresence = useCallback(async () => {
    // Prevent rapid toggling (debounce 2 seconds)
    const now = Date.now();
    if (lastPresenceToggleRef.current && now - lastPresenceToggleRef.current < 2000) {
      return;
    }
    lastPresenceToggleRef.current = now;

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

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      const { data: updateData, error: updateError } = await supabase
        .from('user_presence')
        .update({
          is_online: false,
          last_seen: new Date().toISOString(),
        })
        .eq('user_id', 'admin')
        .select();
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
      await supabase
        .from('typing_status')
        .update({ is_typing: false })
        .eq('user_id', 'admin');
      localStorage.removeItem('admin_session');
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, []);

  // Real-time typing indicator logic
  const isAdminTypingRef = useRef(false);
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const updateAdminTypingStatus = useCallback(async (isTyping: boolean) => {
    if (!selectedChat || isTyping === isAdminTypingRef.current) return;
    isAdminTypingRef.current = isTyping;

    console.log(`AdminPanel - Updating typing status: chat=${selectedChat}, isTyping=${isTyping}`);

    try {
      await supabase.from('typing_status').upsert(
        {
          chat_id: selectedChat,
          user_id: 'admin',
          is_typing: isTyping,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'chat_id,user_id' }
      );
      console.log(`AdminPanel - Typing status updated successfully`);
    } catch (err) {
      console.error('AdminPanel - Error updating admin typing status:', err);
      isAdminTypingRef.current = !isTyping; // Revert on error
    }
  }, [selectedChat]);

  // Event-based typing: Show when admin starts typing
  const handleAdminTyping = useCallback((value: string) => {
    // Show typing animation immediately when admin starts typing
    if (value.length > 0 && !isAdminTypingRef.current) {
      updateAdminTypingStatus(true);
    }

    // Clear previous debounce timer
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }

    // Hide typing after 1.5 seconds of no activity
    typingDebounceRef.current = setTimeout(() => {
      updateAdminTypingStatus(false);
    }, 1500);
  }, [updateAdminTypingStatus]);

  // Immediately stop typing on blur
  const handleAdminBlur = useCallback(() => {
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }
    updateAdminTypingStatus(false);
  }, [updateAdminTypingStatus]);

  // Immediately stop typing when message is sent
  const handleAdminMessageSent = useCallback(() => {
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }
    updateAdminTypingStatus(false);
  }, [updateAdminTypingStatus]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    handleAdminTyping(value);
  }, [handleAdminTyping]);

  // Admin send message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !selectedChat) return;

    // Stop typing immediately when sending
    handleAdminMessageSent();

    try {
      const message = {
        id: uuidv4(),
        chat_id: selectedChat,
        sender: 'admin' as const,
        message: inputValue,
        status: 'sent' as const,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, message]);
      const { error } = await supabase.from('chat_messages').insert(message);
      if (error) {
        console.error('Error sending admin message:', error);
        setMessages(prev => prev.filter(m => m.id !== message.id));
      } else {
        setInputValue('');
      }
    } catch (err) {
      console.error('Failed to send admin message:', err);
    }
  }, [inputValue, selectedChat, handleAdminMessageSent]);

  const formatLastSeen = useCallback((timestamp: string) => {
    if (!timestamp) return 'Never';
    const lastSeenDate = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastSeenDate.getTime()) / 1000);
    
    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) { // < 1 hour
      const diffMinutes = Math.floor(diffSeconds / 60);
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    }
    if (diffSeconds < 86400) { // < 24 hours
      const diffHours = Math.floor(diffSeconds / 3600);
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
    
    // > 24 hours - show full date
    return lastSeenDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const handleChatSelect = useCallback((chatId: string) => {
    setSelectedChat(chatId);
  }, []);

  const filteredActiveChats = useMemo(() => activeChats, [activeChats]);

  // Cleanup on unmount - Enhanced memory management
  useEffect(() => {
    const currentTypingTimeout = typingTimeoutRef.current;
    const currentTypingDebounce = typingDebounceRef.current;
    const currentPresenceDebounce = presenceDebounceRef.current;

    return () => {
      // Clear all channels
      channelsRef.current.forEach(channel => {
        try {
          supabase.removeChannel(channel);
        } catch (err) {
          console.error('Error removing channel:', err);
        }
      });
      channelsRef.current = [];

      // Clear all timeouts
      if (currentTypingTimeout) {
        clearTimeout(currentTypingTimeout);
      }
      if (currentTypingDebounce) {
        clearTimeout(currentTypingDebounce);
      }
      if (currentPresenceDebounce) {
        clearTimeout(currentPresenceDebounce);
      }

      // Set admin offline
      const setAdminOffline = async () => {
        try {
          const { data: updateData, error: updateError } = await supabase
            .from('user_presence')
            .update({
              is_online: false,
              last_seen: new Date().toISOString(),
            })
            .eq('user_id', 'admin')
            .select();
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

  // Auth check
  useEffect(() => {
    const sess = localStorage.getItem('admin_session');
    if (sess === 'true') {
      setIsAuthenticated(true);
      const setAdminOnline = async () => {
        try {
          const { data: updateData, error: updateError } = await supabase
            .from('user_presence')
            .update({
              is_online: true,
              last_seen: new Date().toISOString(),
            })
            .eq('user_id', 'admin')
            .select();
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

  const MemoizedChatItem = React.memo(function MemoizedChatItem({ 
    chat, 
    isSelected, 
    onSelect, 
    onMark, 
    onDelete, 
    formatLastSeen, 
    isTyping 
  }: { 
    chat: any; 
    isSelected: boolean; 
    onSelect: (chatId: string) => void; 
    onMark: (e: React.MouseEvent, chatId: string) => void; 
    onDelete: (e: React.MouseEvent, chatId: string) => void; 
    formatLastSeen: (timestamp: string) => string; 
    isTyping: boolean; 
  }) {
    return (
      <li
        onClick={() => onSelect(chat.id)}
        className={`relative group rounded-xl border px-4 py-3 cursor-pointer transition-all backdrop-blur ${isSelected ? 'border-[#00C4FF] bg-gradient-to-br from-[#1254FF]/10 to-[#00C4FF]/10' : 'border-white/10 bg-white/5 hover:border-[#00C4FF]/40'}`}
      >
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => onMark(e, chat.id)}
            className="p-1 rounded-md bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
            title="Mark Chat"
          >
            <Star className="w-3 h-3" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => onDelete(e, chat.id)}
            className="p-1 rounded-md bg-red-500/20 text-red-300 hover:bg-red-500/30"
            title="Delete Chat"
          >
            <Trash2 className="w-3 h-3" />
          </motion.button>
        </div>
        
        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white/90 text-sm truncate max-w-[100px]">
                {chat.guest_name.replace('guest_', 'User ')}
              </span>
              {chat.is_online ? (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-green-400 font-medium">Online Now</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-[10px] text-red-400">Offline</span>
                </div>
              )}
            </div>
            <span className="text-[10px] font-mono opacity-60 whitespace-nowrap">
              {chat.last_seen ? formatLastSeen(chat.last_seen) : ''}
            </span>
          </div>
          
          {isTyping ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs truncate text-[#00C4FF] font-medium"
            >
              Typing...
            </motion.p>
          ) : (
            <p className="text-xs truncate opacity-60">{chat.last_message?.slice(0, 40) || 'No message yet'}</p>
          )}
        </div>
      </li>
    );
  });

  const MemoizedMessageBubble = React.memo(function MemoizedMessageBubble({ message }: { message: Message }) {
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        style={{ willChange: 'opacity' }}
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
            <div className={`flex items-center justify-between mt-2 ${message.sender === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="text-xs opacity-70">
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {message.sender === 'user' && (
                <div className="flex items-center gap-1">
                  {message.status === 'seen' ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center gap-0.5"
                    >
                      {/* Glowing Double Tick Hologram */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="relative"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" className="text-[#00C4FF] drop-shadow-[0_0_10px_#00C4FF]">
                          <motion.path
                            d="M3.5 8.25l3.5 3.25 5.5-7.25"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </svg>
                        <motion.div
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0.8, 0.3]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5
                          }}
                          className="absolute inset-0 bg-[#00C4FF] rounded-full blur-sm"
                        />
                      </motion.div>
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.3
                        }}
                        className="relative"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" className="text-[#00C4FF] drop-shadow-[0_0_8px_#00C4FF]">
                          <motion.path
                            d="M6.5 10.25l2.5 2.25 5.5-7.25"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                          />
                        </svg>
                        <motion.div
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0.8, 0.3]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.8
                          }}
                          className="absolute inset-0 bg-[#00C4FF] rounded-full blur-sm"
                        />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative flex items-center justify-center"
                      title="Message Sent"
                    >
                      <span className="text-lg">✈️</span>
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-[#00C4FF] to-[#1254FF] rounded-full blur-md"
                        style={{
                          filter: 'blur(4px)',
                          transform: 'scale(0.8)'
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  });

  return (
    <div className="relative min-h-screen w-full bg-[radial-gradient(circle_at_20%_20%,#0A0F1C,transparent_35%),radial-gradient(circle_at_80%_0%,#001133,transparent_30%),linear-gradient(180deg,#0A0F1C,#001133)] text-white/90 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <span className="fixed top-4 left-4 bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white px-5 py-2 rounded-full shadow-lg glass-blur-sm text-lg font-bold tracking-wide z-40 select-none animate-slide-right">
          Support Admin
        </span>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          style={{ willChange: 'transform, opacity' }}
          className="backdrop-blur-2xl rounded-3xl overflow-hidden max-w-full mx-auto p-0 border border-white/10 shadow-[0_0_30px_rgba(0,196,255,0.12)]"
        >
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
                <span className={`px-5 py-2 rounded-2xl text-base font-semibold banana transition-all shadow-md border-2 backdrop-blur-md ${adminOnline ? 'bg-green-500/40 border-green-400 shadow-green-200/50 animate-pulse' : 'bg-gradient-to-r from-red-500/40 to-red-600/40 border-red-400/70 shadow-red-300/30 animate-blink-red'}`}>
                  {adminOnline ? '🟢 Online' : '🔴 Offline'}
                </span>
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
            <div className="lg:col-span-1 space-y-6">
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

              <div className="p-6 rounded-2xl backdrop-blur-xl bg-[#0F172A]/70 border border-white/10 shadow-[0_0_30px_rgba(0,196,255,0.12)]">
                <h2 className="text-lg font-semibold mb-4 text-white/90">Active Chats</h2>
                <ul className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {filteredActiveChats.map((chat) => (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ willChange: 'opacity, height, margin' }}
                      >
                        <MemoizedChatItem
                          chat={chat}
                          isSelected={selectedChat === chat.id}
                          onSelect={handleChatSelect}
                          onMark={handleMarkChat}
                          onDelete={handleDeleteChat}
                          formatLastSeen={formatLastSeen}
                          isTyping={typingStates[chat.id]}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {filteredActiveChats.length === 0 && (
                    <li className="text-sm text-white/50 border border-white/10 rounded-xl px-4 py-6 text-center">No active chats</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="space-y-6 min-w-[400px] lg:col-span-3">
              <div className="rounded-2xl backdrop-blur-xl bg-[#0F172A]/70 border border-white/10 shadow-[0_0_30px_rgba(0,196,255,0.12)] h-[700px] flex flex-col">
                <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#1254FF]/20 to-[#00C4FF]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-6 h-6 text-[#00C4FF]" />
                      <div>
                        <h2 className="text-lg font-semibold text-white/90">
                          {selectedChat ? `Chat with ${activeChats.find(c => c.id === selectedChat)?.guest_name || 'User'}` : 'Select a Chat'}
                        </h2>
                        {selectedChat && (
                          <p className="text-sm text-white/60">{messagesData.length} messages</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
                  style={{ 
                    scrollBehavior: 'smooth',
                    height: 'calc(100vh - 400px)',
                    minHeight: '400px',
                    maxHeight: 'calc(100vh - 300px)'
                  }}
                >
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
                    messagesData.map((message) => (
                      <MemoizedMessageBubble message={message} key={message.id} />
                    ))
                  )}
                  
                  {typingStates[selectedChat] && <TypingIndicator label="User is typing..." align="left" />}
                  
                  {aiThinking && <TypingIndicator label="AI is thinking..." align="left" isAI />}
                  <div ref={messagesEndRef} />
                </div>

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
                              handleAdminTyping(inputValue + (e.key || ''));
                            }
                          }}
                          onKeyUp={() => {
                            if (!inputValue.trim()) {
                              handleAdminBlur();
                            }
                          }}
                          onBlur={handleAdminBlur}
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
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0, ease: "easeInOut" }}
                                    style={{ willChange: 'transform, opacity' }}
                                    className="inline-block w-1.5 h-1.5 bg-white rounded-full"
                                  />
                                  <motion.span
                                    animate={{ y: [0, -2, 0], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
                                    style={{ willChange: 'transform, opacity' }}
                                    className="inline-block w-1.5 h-1.5 bg-white rounded-full"
                                  />
                                  <motion.span
                                    animate={{ y: [0, -2, 0], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
                                    style={{ willChange: 'transform, opacity' }}
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
        <Toast messages={toastMessages} onClear={() => setToastMessages([])} />
      </div>
    </div>
  );
}