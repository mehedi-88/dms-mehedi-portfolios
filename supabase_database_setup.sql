-- =============================================
-- DMS MEHEDI PORTFOLIO - SUPABASE DATABASE SCHEMA
-- Complete Real-time Chat System Setup
-- =============================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name VARCHAR(255) NOT NULL,
  is_online BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,
  sender VARCHAR(50) NOT NULL CHECK (sender IN ('user', 'admin')),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'seen')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (chat_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- 4. Create user_presence table
CREATE TABLE IF NOT EXISTS user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create typing_status table
CREATE TABLE IF NOT EXISTS typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(chat_id, user_id),
  FOREIGN KEY (chat_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- 6. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_status_chat_id ON typing_status(chat_id);
CREATE INDEX IF NOT EXISTS idx_typing_status_user_id ON typing_status(user_id);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

-- 8. Create Development Policies (Public Access)
-- Note: These are for development only. Replace with proper auth in production.

-- Chat Sessions Policies
CREATE POLICY "chat_sessions_select_all" ON chat_sessions FOR SELECT USING (true);
CREATE POLICY "chat_sessions_insert_all" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "chat_sessions_update_all" ON chat_sessions FOR UPDATE USING (true);
CREATE POLICY "chat_sessions_delete_all" ON chat_sessions FOR DELETE USING (true);

-- Chat Messages Policies
CREATE POLICY "chat_messages_select_all" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "chat_messages_insert_all" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "chat_messages_update_all" ON chat_messages FOR UPDATE USING (true);
CREATE POLICY "chat_messages_delete_all" ON chat_messages FOR DELETE USING (true);

-- User Presence Policies
CREATE POLICY "user_presence_select_all" ON user_presence FOR SELECT USING (true);
CREATE POLICY "user_presence_insert_all" ON user_presence FOR INSERT WITH CHECK (true);
CREATE POLICY "user_presence_update_all" ON user_presence FOR UPDATE USING (true);
CREATE POLICY "user_presence_delete_all" ON user_presence FOR DELETE USING (true);

-- Typing Status Policies
CREATE POLICY "typing_status_select_all" ON typing_status FOR SELECT USING (true);
CREATE POLICY "typing_status_insert_all" ON typing_status FOR INSERT WITH CHECK (true);
CREATE POLICY "typing_status_update_all" ON typing_status FOR UPDATE USING (true);
CREATE POLICY "typing_status_delete_all" ON typing_status FOR DELETE USING (true);

-- 9. Enable Realtime for All Tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE typing_status;

-- 10. Create Initial Admin Presence Record
INSERT INTO user_presence (user_id, is_online, last_seen, updated_at)
VALUES ('admin', false, now(), now())
ON CONFLICT (user_id) DO NOTHING;

-- 11. Create Helper Functions (Optional)
-- Function to update last_seen automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to update updated_at automatically
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_presence_updated_at BEFORE UPDATE ON user_presence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_typing_status_updated_at BEFORE UPDATE ON typing_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Verification Query
-- Run this to verify everything is set up correctly
SELECT 
    'chat_sessions' as table_name, 
    count(*) as row_count,
    'RLS: ' || (SELECT relrowsecurity FROM pg_class WHERE relname = 'chat_sessions') as rls_status
FROM chat_sessions
UNION ALL
SELECT 
    'chat_messages' as table_name, 
    count(*) as row_count,
    'RLS: ' || (SELECT relrowsecurity FROM pg_class WHERE relname = 'chat_messages') as rls_status
FROM chat_messages
UNION ALL
SELECT 
    'user_presence' as table_name, 
    count(*) as row_count,
    'RLS: ' || (SELECT relrowsecurity FROM pg_class WHERE relname = 'user_presence') as rls_status
FROM user_presence
UNION ALL
SELECT 
    'typing_status' as table_name, 
    count(*) as row_count,
    'RLS: ' || (SELECT relrowsecurity FROM pg_class WHERE relname = 'typing_status') as rls_status
FROM typing_status;

-- =============================================
-- SETUP COMPLETE! 
-- Your database is now ready for real-time chat
-- =============================================
