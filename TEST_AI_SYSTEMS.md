# 🧪 AI System Testing Guide

## Overview
This guide validates that all three AI chat systems are working correctly with real OpenAI API responses.

---

## ✅ Pre-Flight Checklist

Before testing, ensure:
- [ ] `.env.local` has valid `OPENAI_API_KEY` (starts with `sk-`)
- [ ] Development server is running: `npm run dev`
- [ ] Browser console is open (F12) for error monitoring
- [ ] No rate limiting errors from OpenAI API

---

## 🧠 System 1: FAQ Chatbox (FAQ Page)

**Location**: `/faq` page  
**API Endpoint**: `/api/faq-chat`  
**Component**: `FAQChatbox.tsx`

### Expected Behavior:
- Four mood buttons appear: 🧠 AI Thinking, 🤖 Agent Mode, 🔍 Deep Research, ⚙️ Auto Mode
- Each mood has a different system prompt personality
- Typing indicator shows while AI responds
- Real AI-generated responses appear (NOT offline fallback messages)
- Chat history persists per mood in localStorage

### Test Steps:
1. Navigate to `/faq` page
2. Click "🧠 AI Thinking" mood
3. Type: "What are your digital marketing services?"
4. Press Send or click Send button
5. **Expected Result**: Real AI response about digital marketing (not "AI error" or offline message)
6. Switch to "🤖 Agent Mode" and ask: "How quickly can you deliver projects?"
7. **Expected Result**: Faster, more concise response with agent personality

### Debug Notes:
- Check browser console for fetch errors
- Verify API response contains `{ reply: "..." }`
- Ensure mood parameter is being sent correctly

---

## 💬 System 2: Widget Chatbot (All Pages)

**Location**: Floating button (bottom-right corner, all pages)  
**API Endpoint**: `/api/ai-chat`  
**Component**: `ChatbotWidgetSupabase.tsx`

### Expected Behavior:
- Green/red animated orb in bottom-right corner
- Green = Admin is online (will respond personally)
- Red = Admin is offline (AI fallback response)
- Chat history synced with Supabase database
- Real AI responses when admin is offline

### Test Steps:
1. Click the floating "DMS AI" button
2. Type: "I need help with my website"
3. Press Enter or click Send
4. **Expected Result**:
   - If admin online: "Checking for admin response..." + see in Supabase
   - If admin offline: Real AI response from `/api/ai-chat` within 2-3 seconds
5. Try multiple messages to build conversation history
6. Refresh page - chat history should persist

### Debug Notes:
- Check if admin_online status from `user_presence` table
- Verify messages array format: `[{ sender: 'user', message: '...', content: '...' }]`
- Look for "AI is thinking..." indicator
- Verify response goes to Supabase `chat_messages` table

---

## 🚀 System 3: Project Assistant (View Project Page)

**Location**: Any project detail page → "Ask AI Assistant" button  
**API Endpoint**: `/api/ai-tools` with `tool: 'project-assistant'`  
**Component**: `AIAssistantModal.tsx`

### Expected Behavior:
- Modal opens with project-specific context
- Chat history persists per project in localStorage
- Real AI responses about project, role, technologies, achievements
- Typing indicator shows "AI Assistant is typing…"

### Test Steps:
1. Go to projects page and click "View Project" on any project
2. Look for "Ask AI Assistant" button
3. Click it to open modal
4. Ask: "What was my role in this project?"
5. **Expected Result**: Real AI response describing the project role (not "Could not generate a response.")
6. Ask: "What technologies were used?"
7. **Expected Result**: Accurate list of technologies mentioned in project metadata
8. Refresh page - chat history should persist per project

### Debug Notes:
- Verify request format: `{ tool: 'project-assistant', input: { question: '...', project: {...} } }`
- Check response contains `{ result: "..." }`
- Verify project metadata is being passed correctly
- Look for handleProjectAssistant logs in server console

---

## 🔍 Debug Checklist

If any system fails:

### Check API Route Status:
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test FAQ endpoint
curl -X POST http://localhost:3000/api/faq-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","mood":"thinking"}'
# Should return: {"reply":"<AI generated text>"}

# Test Widget Chat endpoint
curl -X POST http://localhost:3000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"sender":"user","message":"Hi","content":"Hi"}]}'
# Should return: {"reply":"<AI generated text>"}

# Test Project Assistant endpoint
curl -X POST http://localhost:3000/api/ai-tools \
  -H "Content-Type: application/json" \
  -d '{
    "tool":"project-assistant",
    "input":{
      "question":"What is this project?",
      "project":{"title":"Sample","role":"Developer","achievements":["Built it"],"technologies":["React"],"description":"A project"}
    }
  }'
# Should return: {"result":"<AI generated text>"}
```

### Check Environment:
```bash
# Verify API key is loaded
node -e "console.log(process.env.OPENAI_API_KEY?.substring(0,20))"
# Should show: sk-proj-... (first 20 chars)
```

### Check Logs:
1. **Browser Console** (F12):
   - Look for fetch errors
   - Check network tab for 500 errors
   - Verify response JSON structure

2. **Terminal Console** (Dev Server):
   - Look for "API Error:" messages
   - Check if routes are being hit
   - Verify OpenAI API calls are made

---

## 📊 Success Criteria

All systems working correctly when:

| System | Green Light ✅ |
|--------|---|
| FAQ Chatbox | 4 moods respond with unique personalities |
| Widget Chatbot | AI responds within 2-3 seconds when offline |
| Project Assistant | Modal shows project-specific responses |
| localStorage | Chat history persists after page refresh |
| Supabase | Messages appear in chat_messages table |

---

## 🚨 Common Issues & Fixes

### Issue: "API error. Please try again."
**Fix**: 
- Verify OPENAI_API_KEY in .env.local is valid
- Check API key hasn't expired or been used up
- Restart dev server after .env.local changes

### Issue: "Undefined" or blank responses
**Fix**:
- Check that response format matches (e.g., `reply` vs `result`)
- Verify message format sent matches API expectations
- Check browser network tab for actual API response

### Issue: Widget Chatbot shows offline message instead of AI response
**Fix**:
- Ensure admin is marked offline in `user_presence` table
- Check that `/api/ai-chat` endpoint is accessible
- Verify messages array has `sender`, `message`, `content` fields

### Issue: Project Assistant modal doesn't open
**Fix**:
- Ensure you're on a valid project page
- Check that project data is being passed correctly
- Look for errors in browser console

---

## 📝 Final Verification

Once all three systems respond correctly:

```
✅ FAQ Page: All 4 moods generate AI text
✅ Widget Chatbot: Real responses when offline
✅ Project Assistant: Modal shows project info-based AI response
✅ localStorage: All chats persist across refreshes
✅ .env.local: Single OPENAI_API_KEY used by all three
✅ No "undefined", "offline", or "error" messages
```

Then proceed to design enhancements for View Project pages.
