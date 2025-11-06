'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Send } from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ChatSession {
  id: string;
  guest_name: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
}

interface Message {
  id: string;
  chat_id: string;
  sender: 'user' | 'admin';
  message: string;
  status: 'sent' | 'seen';
  created_at: string;
}

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [adminTyping, setAdminTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [adminOnline, setAdminOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelsRef = useRef<RealtimeChannel[]>([]);

  // Function to mark all user messages as seen in the current chat
  const markMessagesAsSeen = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ status: 'seen' })
        .eq('chat_id', chatId)
        .eq('sender', 'user')
        .neq('status', 'seen');

      if (error) {
        console.error('Error marking messages as seen:', error);
      }
    } catch (err) {
      console.error('Failed to mark messages as seen:', err);
    }
  };

  // Initialize admin presence
  useEffect(() => {
    const initializeAdmin = async () => {
      const { error } = await supabase.from('user_presence').upsert({
        user_id: 'admin',
        is_online: true,
        last_seen: new Date().toISOString(),
      });

      if (error) console.error('Error setting admin presence:', error);
    };

    initializeAdmin();

    // Update last seen every 30 seconds
    const interval = setInterval(async () => {
      await supabase.from('user_presence').upsert({
        user_id: 'admin',
        is_online: true,
        last_seen: new Date().toISOString(),
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch chat sessions
  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('last_seen', { ascending: false });

      if (error) console.error('Error fetching sessions:', error);
      else setSessions(data || []);
    };

    fetchSessions();

    // Subscribe to new sessions
    const subscription = supabase
      .channel('chat_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions',
        },
        (payload) => {
          fetchSessions();
        }
      )
      .subscribe();

    channelsRef.current.push(subscription);

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Fetch messages for selected chat and mark user messages as seen
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', selectedChat)
        .order('created_at', { ascending: true });

      if (error) console.error('Error fetching messages:', error);
      else {
        setMessages(data || []);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`chat_messages_${selectedChat}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${selectedChat}`,
        },
        async (payload: any) => {
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

          // If this is a user message in the currently selected chat, mark it as seen immediately
          if (newMessage.sender === 'user' && newMessage.chat_id === selectedChat) {
            await markMessagesAsSeen(selectedChat);
          }
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

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedChat]);

  // Subscribe to typing status
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
        (payload: { new: any }) => {
          if (payload.new?.user_id === 'admin') {
            setAdminTyping(!!payload.new?.is_typing);
          } else {
            setUserTyping(!!payload.new?.is_typing);
          }
        }
      )
      .subscribe();

    channelsRef.current.push(typingChannel);

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [selectedChat]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debounced typing status update
  const debouncedTyping = useCallback((typing: boolean) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const updateTyping = async () => {
      if (!selectedChat) return;
      try {
        await supabase.from('typing_status').upsert({
          chat_id: selectedChat,
          user_id: 'admin',
          is_typing: typing,
        }, {
          onConflict: 'chat_id,user_id'
        });
      } catch (err) {
        console.error('Error updating typing status:', err);
      }
    };

    typingTimeoutRef.current = setTimeout(updateTyping, typing ? 0 : 2000);
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedChat) return;

    const newMessage = {
      chat_id: selectedChat,
      sender: 'admin',
      message: inputValue,
      status: 'sent',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('chat_messages')
      .insert(newMessage)
      .select('id')
      .single();

    if (!data) {
      console.error("Error: No data returned after inserting message.");
      return;
    }

    setInputValue('');
    setAdminTyping(false);
    debouncedTyping(false);

    // Update message status to seen
    setTimeout(async () => {
      const { error: updateError } = await supabase
        .from('chat_messages')
        .update({ status: 'seen' })
        .eq('id', data.id);

      if (updateError) console.error('Error updating message status:', updateError);
    }, 1000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return date.toLocaleDateString();
  };

  const adminLocalTyping = inputValue.trim().length > 0;

  // Cleanup channels on unmount
  useEffect(() => {
    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[radial-gradient(circle_at_20%_20%,#0A0F1C,transparent_35%),radial-gradient(circle_at_80%_0%,#001133,transparent_30%),linear-gradient(180deg,#0A0F1C,#001133)] text-white/90">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto p-4 sm:p-6 lg:p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1254FF] to-[#00C4FF] flex items-center justify-center shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Chat</h1>
              <p className="text-sm text-white/60">Manage all customer conversations</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-400/50">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm font-medium text-green-300">Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Chat Sessions */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-xl bg-[#0F172A]/70 border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,196,255,0.12)] overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#1254FF]/20 to-[#00C4FF]/20">
                <h2 className="text-lg font-semibold text-white">Active Chats</h2>
              </div>
              <div className="max-h-[600px] overflow-y-auto p-4 space-y-2">
                {sessions.length === 0 ? (
                  <div className="text-center text-white/50 py-8">
                    <p>No active chats</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <motion.button
                      key={session.id}
                      onClick={async () => {
                        setSelectedChat(session.id);
                        // Update admin presence when selecting a chat
                        await supabase.from('user_presence').upsert({
                          user_id: 'admin',
                          is_online: true,
                          last_seen: new Date().toISOString(),
                        });
                        // Mark messages as seen immediately when focusing on chat
                        await markMessagesAsSeen(session.id);
                      }}
                      className={`w-full p-4 rounded-xl border transition-all text-left ${selectedChat === session.id
                        ? 'border-[#00C4FF] bg-gradient-to-br from-[#1254FF]/20 to-[#00C4FF]/20'
                        : 'border-white/10 hover:border-[#00C4FF]/40'
                        }`}
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white text-sm truncate max-w-[140px]">
                          {session.guest_name.replace('guest_', 'User ')}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${session.is_online ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                      </div>
                      <p className="text-xs text-white/50">
                        {formatDate(session.last_seen)} at {formatTime(session.last_seen)}
                      </p>
                    </motion.button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="backdrop-blur-xl bg-[#0F172A]/70 border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,196,255,0.12)] h-[700px] flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-white/10 bg-gradient-to-r from-[#1254FF]/20 to-[#00C4FF]/20">
                    <h2 className="text-xl font-semibold text-white">
                      {sessions.find((s) => s.id === selectedChat)?.guest_name}
                    </h2>
                    <p className="text-sm text-white/60">
                      {sessions.find((s) => s.id === selectedChat)?.is_online ? 'Online' : 'Offline'}
                    </p>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start gap-2 max-w-[70%] ${message.sender === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${message.sender === 'admin'
                            ? 'bg-gradient-to-br from-[#1254FF] to-[#00C4FF] text-white'
                            : 'bg-gray-600 text-white'
                            }`}>
                            {message.sender === 'admin' ? 'A' : 'U'}
                          </div>
                          <div className={`px-4 py-3 rounded-2xl shadow-md ${message.sender === 'admin'
                            ? 'bg-gradient-to-br from-[#1254FF] to-[#00C4FF] text-white rounded-br-md'
                            : 'bg-gray-700 text-white border border-gray-600 rounded-bl-md'
                            }`}>
                            <p className="text-sm leading-relaxed">{message.message}</p>
                            <p className={`text-xs opacity-70 mt-2 flex items-center gap-2 ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                              <span>{formatTime(message.created_at)}</span>
                              {message.sender === 'admin' && (
                                <span className="text-white/80">{message.status === 'seen' ? '✓✓' : '✓'}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* User typing indicator */}
                    {userTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-start mb-2"
                      >
                        <div className="bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-blue-600/20 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 shadow-lg">
                          <p className="text-sm text-white flex items-center gap-2">
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
                            User is typing...
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-6 border-t border-white/10 bg-gray-900/30">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-full">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
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
                          onBlur={() => {
                            debouncedTyping(false);
                            if (typingTimeoutRef.current) {
                              clearTimeout(typingTimeoutRef.current);
                            }
                          }}
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
                        className={`w-full max-w-xs bg-gradient-to-r from-[#1254FF] to-[#00C4FF] text-white p-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center ${!inputValue.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <Send className="w-5 h-5 mr-2" /> Send Message
                      </motion.button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-center text-white/50">
                  <div>
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Select a chat to start messaging</p>
                    <p className="text-sm mt-2">Choose from active chats on the left</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
