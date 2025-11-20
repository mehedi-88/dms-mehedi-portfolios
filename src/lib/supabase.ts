import { createClient } from '@supabase/supabase-js';

// Use NEXT_PUBLIC_ environment variables for Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing environment variables! Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
  );
  throw new Error('Supabase configuration missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types for TypeScript
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
  user_id: string;
  guest_name: string;
  created_at: string;
  last_message_at: string;
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

