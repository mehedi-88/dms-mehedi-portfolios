import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender: 'user' | 'admin';
  message: string;
  status: 'sent' | 'seen';
  created_at: string;
}

export interface ChatSession {
  id: string;
  guest_name: string;
  is_online: boolean;
  created_at: string;
  last_seen: string;
}

export interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen: string;
}

export interface TypingStatus {
  chat_id: string;
  user_id: string;
  is_typing: boolean;
}

/**
 * Sends a new message to Supabase.
 * @param messageData The message object to send.
 * @returns The message data with generated ID.
 */
export async function sendMessage(messageData: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      ...messageData,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }

  return data;
}

/**
 * Subscribes to messages for a specific chat session.
 * @param chatId The chat session ID to subscribe to.
 * @param callback Function to call with the new list of messages.
 * @returns A function to unsubscribe from the real-time listener.
 */
export function subscribeToChat(chatId: string, callback: (messages: ChatMessage[]) => void): () => void {
  // Fetch initial messages
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      callback(data);
    }
  };

  fetchMessages();

  // Subscribe to real-time updates
  const channel = supabase
    .channel(`chat_${chatId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_id=eq.${chatId}`,
      },
      () => {
        fetchMessages(); // Refetch messages when changes occur
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Creates or updates a chat session.
 * @param sessionData The session data.
 * @returns The session data.
 */
export async function upsertChatSession(sessionData: Partial<ChatSession>): Promise<ChatSession> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .upsert({
      ...sessionData,
      last_seen: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert chat session: ${error.message}`);
  }

  return data;
}

/**
 * Subscribes to all chat sessions for the admin dashboard.
 * @param callback Function to call with the list of sessions.
 * @returns A function to unsubscribe from the real-time listener.
 */
export function subscribeToAllChatSessions(callback: (sessions: ChatSession[]) => void): () => void {
  // Fetch initial sessions
  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('last_seen', { ascending: false });

    if (!error && data) {
      callback(data);
    }
  };

  fetchSessions();

  // Subscribe to real-time updates
  const channel = supabase
    .channel('chat_sessions_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_sessions',
      },
      () => {
        fetchSessions(); // Refetch sessions when changes occur
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Updates user presence status.
 * @param userId The user ID (e.g., 'admin' or guest session ID).
 * @param isOnline Whether the user is online.
 * @returns The presence data.
 */
export async function updateUserPresence(userId: string, isOnline: boolean): Promise<UserPresence> {
  const { data, error } = await supabase
    .from('user_presence')
    .upsert({
      user_id: userId,
      is_online: isOnline,
      last_seen: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user presence: ${error.message}`);
  }

  return data;
}

/**
 * Subscribes to user presence changes.
 * @param userId The user ID to subscribe to.
 * @param callback Function to call with presence updates.
 * @returns A function to unsubscribe from the real-time listener.
 */
export function subscribeToUserPresence(userId: string, callback: (presence: UserPresence | null) => void): () => void {
  // Fetch initial presence
  const fetchPresence = async () => {
    const { data, error } = await supabase
      .from('user_presence')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error) {
      callback(data);
    } else {
      callback(null);
    }
  };

  fetchPresence();

  // Subscribe to real-time updates
  const channel = supabase
    .channel(`presence_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_presence',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as UserPresence);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Updates typing status for a user in a chat.
 * @param chatId The chat session ID.
 * @param userId The user ID.
 * @param isTyping Whether the user is typing.
 * @returns The typing status data.
 */
export async function updateTypingStatus(chatId: string, userId: string, isTyping: boolean): Promise<TypingStatus> {
  const { data, error } = await supabase
    .from('typing_status')
    .upsert({
      chat_id: chatId,
      user_id: userId,
      is_typing: isTyping,
    }, { onConflict: 'chat_id,user_id' })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update typing status: ${error.message}`);
  }

  return data;
}

/**
 * Subscribes to typing status changes for a chat.
 * @param chatId The chat session ID.
 * @param callback Function to call with typing status updates.
 * @returns A function to unsubscribe from the real-time listener.
 */
export function subscribeToTypingStatus(chatId: string, callback: (typingStatus: TypingStatus[]) => void): () => void {
  // Fetch initial typing status
  const fetchTypingStatus = async () => {
    const { data, error } = await supabase
      .from('typing_status')
      .select('*')
      .eq('chat_id', chatId);

    if (!error && data) {
      callback(data);
    }
  };

  fetchTypingStatus();

  // Subscribe to real-time updates
  const channel = supabase
    .channel(`typing_${chatId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'typing_status',
        filter: `chat_id=eq.${chatId}`,
      },
      () => {
        fetchTypingStatus(); // Refetch typing status when changes occur
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Marks messages as seen for a specific chat and sender.
 * @param chatId The chat session ID.
 * @param sender The sender to mark messages as seen for.
 * @returns The updated messages count.
 */
export async function markMessagesAsSeen(chatId: string, sender: 'user' | 'admin'): Promise<number> {
  const { data, error } = await supabase
    .from('chat_messages')
    .update({ status: 'seen' })
    .eq('chat_id', chatId)
    .eq('sender', sender)
    .eq('status', 'sent')
    .select();

  if (error) {
    throw new Error(`Failed to mark messages as seen: ${error.message}`);
  }

  return data?.length || 0;
}

