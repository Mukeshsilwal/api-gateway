# Quick Start Guide - AI Chatbot

## ✅ Frontend Setup (DONE)

The chatbot is now integrated! You should see a **floating chat button** in the bottom-right corner of your app.

## 🚀 Backend Setup Required

To make the chatbot work, you need to start the AI service:

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up / Log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-...`)

### 2. Set Environment Variable

**Windows (PowerShell)**:
```powershell
$env:OPENAI_API_KEY="your-api-key-here"
```

**Linux/Mac**:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

### 3. Start AI Service

```bash
cd backend/services/ai-service
mvn spring-boot:run
```

The service will start on **port 8085**.

### 4. Verify Services Running

You need these services:
- ✅ Frontend (port 5173) - Already running
- ⚠️ Web-BFF (port 8080) - Should be running
- ⚠️ AI Service (port 8085) - **Start this now**

## 🧪 Testing the Chatbot

1. **Open your app** in browser (http://localhost:5173)
2. **Look for the chat button** - bottom-right corner (blue/purple gradient circle)
3. **Click the button** - chat window opens
4. **Try these messages**:
   - "Hello"
   - "I want to book a hotel in Kathmandu"
   - "Show me buses to Pokhara"
   - "Help me find accommodation"

## 🎨 What You Should See

### Chat Button
- Floating button in bottom-right corner
- Blue-purple gradient
- Red notification dot
- Hover effect

### Chat Window
- 600px height
- White background
- Gradient header
- Message bubbles
- Smart suggestions
- Input field with send button

## 🔧 Troubleshooting

### "I can't see the chat button"
- Check browser console for errors
- Make sure frontend reloaded (check terminal)
- Try hard refresh (Ctrl+Shift+R)

### "Chat button appears but doesn't respond"
- Check if AI service is running (port 8085)
- Check if Web-BFF is running (port 8080)
- Check browser console for API errors
- Verify OPENAI_API_KEY is set

### "Getting error messages in chat"
- Check OpenAI API key is valid
- Check you have API credits
- Check backend logs for errors

## 💰 Cost Note

OpenAI API usage is pay-per-use:
- ~$0.01 per conversation (GPT-4)
- ~$0.001 per conversation (GPT-3.5)

For testing, a few dollars of credit is enough.

## 🎉 Success!

If you see the chat button and can send messages, **congratulations!** Your AI-powered TicketKatum is ready! 🚀
