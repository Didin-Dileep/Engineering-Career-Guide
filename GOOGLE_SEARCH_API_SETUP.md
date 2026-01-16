# Google Search API Setup for Real-Time Responses

Your chatbot now supports real-time information! 🔍

## What This Enables
- Current events (CM of Kerala, President, etc.)
- Latest news
- Weather information
- Real-time facts
- Any "who is", "current", "latest" questions

## Setup Steps

### 1. Get Google Custom Search API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `career-roadmap-e7b2c`
3. Enable **Custom Search API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Custom Search API"
   - Click "Enable"
4. Create API Key:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key

### 2. Create Custom Search Engine

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click "Add" or "Create"
3. Configure:
   - **Sites to search**: Leave empty or add `*` (searches entire web)
   - **Name**: Career Roadmap Search
   - **Language**: English
4. Click "Create"
5. Copy your **Search Engine ID** (looks like: `a1b2c3d4e5f6g7h8i`)

### 3. Add to Firebase Functions

#### Option A: Local Testing (.env file)
```bash
# Edit functions/.env
GEMINI_API_KEY=AIzaSyA-RETtGyvxGU6Xf6KB45pDvCzDFiI19C0
GOOGLE_SEARCH_API_KEY=YOUR_ACTUAL_SEARCH_API_KEY
GOOGLE_SEARCH_ENGINE_ID=YOUR_ACTUAL_SEARCH_ENGINE_ID
```

#### Option B: Production (Firebase Config)
```bash
firebase functions:config:set google.search_api_key="YOUR_SEARCH_API_KEY"
firebase functions:config:set google.search_engine_id="YOUR_SEARCH_ENGINE_ID"
```

Then update `functions/index.js` to use:
```javascript
process.env.GOOGLE_SEARCH_API_KEY || functions.config().google.search_api_key
process.env.GOOGLE_SEARCH_ENGINE_ID || functions.config().google.search_engine_id
```

### 4. Deploy
```bash
firebase deploy --only functions
```

## How It Works

1. User asks: "Who is the CM of Kerala?"
2. Cloud Function detects it needs real-time info
3. Searches Google for current information
4. Passes search results to Gemini AI
5. AI generates accurate response with latest data

## Questions That Trigger Search
- "who is..."
- "current..."
- "latest..."
- "today..."
- "news about..."
- "cm of...", "prime minister", "president"
- "capital of..."
- "weather in..."

## Cost & Limits

### Google Custom Search API
- **Free**: 100 queries/day
- **Paid**: $5 per 1000 queries after free tier
- For most apps, free tier is enough!

### Gemini API
- Still free (60 requests/minute)

## Testing

Test with these questions:
```
Who is the CM of Kerala?
Who is the current Prime Minister of India?
What's the latest news about AI?
Current weather in Mumbai
```

## Optional: Without Search API

If you don't want to set up Search API, the chatbot will:
- Still answer all tech/coding questions
- Use Gemini's built-in knowledge (up to training date)
- Work perfectly for your main use case (student mentoring)

Search API is optional but adds real-time capabilities! 🚀
