# Real-Time Responses - No Cloud Setup! 🚀

## 2 Steps Only!

### Step 1: Get FREE Bing API Key

1. Go to https://portal.azure.com/
2. Search "Bing Search v7"
3. Create with **FREE tier (F1)** - 1000 searches/month
4. Copy your API Key

### Step 2: Add to .env File

Edit `.env` in your project root:

```
VITE_GEMINI_API_KEY=AIzaSyA-RETtGyvxGU6Xf6KB45pDvCzDFiI19C0
VITE_BING_API_KEY=paste_your_bing_key_here
```

### That's It! ✅

Restart your dev server:
```bash
npm run dev
```

Now test:
- "Who is the CM of Kerala?"
- "Current Prime Minister?"
- "Latest news about AI?"

## How It Works

- Frontend calls Bing Search API directly
- Gets real-time snippet
- Passes to Gemini AI
- AI generates accurate answer

## No Cloud Functions Needed!

Everything runs in your browser. Simple and fast! 🎉

## Without Bing Key?

Chatbot still works! Just won't have real-time info.
Perfect for tech/coding questions (your main use case).
