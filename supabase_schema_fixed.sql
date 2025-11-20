-- FIXED Supabase Schema - UUID Support for Real-Time Chat
-- Run this SQL in your Supabase dashboard

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name VARCHAR(255) NOT NULL,
  is_online BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  last_seen TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,  -- ✅ Using UUID type
  sender VARCHAR(50) NOT NULL CHECK (sender IN ('user', 'admin')),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'seen')),
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (chat_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Create user_presence table
CREATE TABLE IF NOT EXISTS user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create typing_status table
CREATE TABLE IF NOT EXISTS typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,  -- ✅ Using UUID type
  user_id VARCHAR(255) NOT NULL,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(chat_id, user_id),
  FOREIGN KEY (chat_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_status_chat_id ON typing_status(chat_id);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes - adjust for production)
CREATE POLICY "Enable read access for all users" ON chat_sessions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON chat_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON chat_sessions
  FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON chat_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON chat_messages
  FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON user_presence
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON user_presence
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON user_presence
  FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON typing_status
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON typing_status
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON typing_status
  FOR UPDATE USING (true);

-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE typing_status;
