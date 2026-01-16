# Quick Setup for Real-Time Responses

## Step 1: Get API Keys

### Google Search API Key
1. Visit: https://console.cloud.google.com/apis/credentials
2. Create API Key
3. Copy it

### Search Engine ID
1. Visit: https://programmablesearchengine.google.com/
2. Create new search engine (search entire web)
3. Copy Search Engine ID

## Step 2: Add to Functions

Edit `functions/.env`:
```
GEMINI_API_KEY=AIzaSyA-RETtGyvxGU6Xf6KB45pDvCzDFiI19C0
GOOGLE_SEARCH_API_KEY=paste_your_search_api_key_here
GOOGLE_SEARCH_ENGINE_ID=paste_your_search_engine_id_here
```

## Step 3: Deploy

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## Done! 🎉

Now your chatbot can answer:
- "Who is the CM of Kerala?" ✅
- "Current Prime Minister of India?" ✅
- "Latest tech news?" ✅
- Any real-time question! ✅

## Without Search API?

Chatbot still works! Just won't have real-time info.
Perfect for tech/coding questions (your main use case).

Search API is optional enhancement! 🚀
