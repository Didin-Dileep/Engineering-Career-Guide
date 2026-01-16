# Bing Search API Setup - Real-Time Responses

## Get Bing API Key (Free!)

1. Go to [Azure Portal](https://portal.azure.com/)
2. Create free account (no credit card for free tier!)
3. Search "Bing Search v7"
4. Click "Create"
5. Select Free tier (F1) - 3 calls/second, 1000 calls/month
6. Copy API Key

## Add to Functions

Edit `functions/.env`:
```
GEMINI_API_KEY=AIzaSyA-RETtGyvxGU6Xf6KB45pDvCzDFiI19C0
BING_API_KEY=paste_your_bing_key_here
```

## Deploy

```bash
firebase deploy --only functions
```

## Done! 🎉

Now answers:
- "Who is the CM of Kerala?" ✅
- "Current Prime Minister?" ✅
- "Latest news about AI?" ✅
- Any real-time question! ✅

## Free Tier Limits
- 1000 searches/month FREE
- 3 searches/second
- Perfect for your app!
