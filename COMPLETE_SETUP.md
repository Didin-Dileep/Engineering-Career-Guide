# Complete Setup - Real-Time Responses

## Step 1: Get Bing API Key (FREE)

1. Go to https://portal.azure.com/
2. Sign in (create free account if needed)
3. Search "Bing Search v7" in top search bar
4. Click "Create"
5. Select:
   - Subscription: Free Trial or Pay-As-You-Go
   - Resource Group: Create new "chatbot-resources"
   - Region: Any
   - Pricing Tier: **F1 (FREE)** - 1000 calls/month
6. Click "Review + Create"
7. After deployment, go to resource
8. Click "Keys and Endpoint"
9. Copy **KEY 1**

## Step 2: Add API Key

Edit `functions/.env`:
```
GEMINI_API_KEY=AIzaSyA-RETtGyvxGU6Xf6KB45pDvCzDFiI19C0
BING_API_KEY=paste_your_key_here
```

## Step 3: Install & Deploy

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Install dependencies
cd functions
npm install
cd ..

# Deploy
firebase deploy --only functions
```

## Step 4: Test

Ask your chatbot:
- "Who is the CM of Kerala?"
- "Current Prime Minister of India?"
- "Latest news about AI?"

## Done! 🎉

Your chatbot now has real-time search powered by Bing!

## Troubleshooting

**Function not deployed?**
- Check: `firebase functions:log`
- Verify billing enabled in Firebase Console

**Still no real-time answers?**
- Wait 2-3 minutes after deployment
- Check browser console for errors
- Verify BING_API_KEY in functions/.env

**Need help?**
Run: `firebase functions:config:get`
