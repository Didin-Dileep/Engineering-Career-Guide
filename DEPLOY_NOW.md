# 🚀 DEPLOY NOW - 3 Steps

## ✅ Step 1: Get Bing API Key (2 minutes)

1. Visit: https://portal.azure.com/
2. Search "Bing Search v7" → Create
3. Choose **FREE tier (F1)**
4. Copy your API Key

## ✅ Step 2: Add Key to Project

Edit this file: `functions/.env`

Replace `YOUR_BING_API_KEY` with your actual key:
```
GEMINI_API_KEY=AIzaSyA-RETtGyvxGU6Xf6KB45pDvCzDFiI19C0
BING_API_KEY=your_actual_key_here
```

## ✅ Step 3: Deploy (Run these commands)

```bash
firebase login
firebase deploy --only functions
```

Wait 2-3 minutes for deployment to complete.

## 🎉 Test It!

Ask your chatbot:
- "Who is the CM of Kerala?"
- "Current Prime Minister?"

It will now give real-time answers!

---

## Already Have Everything?

Just run:
```bash
firebase deploy --only functions
```

That's it! 🚀
