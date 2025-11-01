# Supabase Setup & Verification Guide

## 1. Environment Variables Setup

Create `.env.local` in your project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Get these values from:**
- Supabase Dashboard → Settings → API
- Project URL = `NEXT_PUBLIC_SUPABASE_URL`
- Project API keys → anon public = `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Database Schema Setup

Run this SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name VARCHAR(255) NOT NULL,
  is_online BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,
  sender VARCHAR(50) NOT NULL CHECK (sender IN ('user', 'admin')),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'seen')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (chat_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Create user_presence table
CREATE TABLE IF NOT EXISTS user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create typing_status table
CREATE TABLE IF NOT EXISTS typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(chat_id, user_id),
  FOREIGN KEY (chat_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_status_chat_id ON typing_status(chat_id);

-- Enable Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (development only)
CREATE POLICY "Enable read access for all users" ON chat_sessions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON chat_sessions FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON chat_messages FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON user_presence FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON user_presence FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON user_presence FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON typing_status FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON typing_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON typing_status FOR UPDATE USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE typing_status;
```

## 3. Verification Steps

### Test Connection
```bash
npm run dev
```

Visit: `http://localhost:3000/api/test-supabase`

Should return:
```json
{
  "success": true,
  "message": "Supabase connection verified"
}
```

### Test Realtime Features

1. **Open two browser tabs:**
   - Tab 1: `http://localhost:3000/admin` (Admin Dashboard)
   - Tab 2: `http://localhost:3000` (Homepage with chat widget)

2. **Test Presence:**
   - In Admin: Click "Go Online" → Widget should show green glow + "Admin is online now"
   - Click "Go Offline" → Widget should show red glow + "DMS Assistant (Offline)"

3. **Test Typing:**
   - In Widget: Start typing → Admin should show "User is typing..."
   - In Admin: Start typing → Widget should show "Admin is typing..."

4. **Test Messages:**
   - Send message from Widget → Should appear instantly in Admin
   - Send message from Admin → Should appear instantly in Widget
   - After Admin replies → Widget messages should show "✓✓ Seen"

## 4. Troubleshooting

### Connection Issues
- Check `.env.local` exists and has correct values
- Restart dev server after adding env vars
- Verify Supabase project is active

### Realtime Not Working
- Check Supabase Dashboard → Replication → Publications
- Ensure all 4 tables are added to `supabase_realtime`
- Check browser console for errors

### RLS Errors
- Verify policies are created correctly
- Check Supabase Dashboard → Authentication → Policies

## 5. Production Considerations

- Replace public policies with proper authentication
- Add rate limiting for typing indicators
- Implement proper user authentication
- Add message encryption for sensitive data
