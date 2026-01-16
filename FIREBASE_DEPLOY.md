# Firebase Cloud Functions - Complete Setup

## Automated Setup (Easiest)

Just run:
```bash
deploy-firebase.bat
```

It will:
1. Install Firebase CLI
2. Install dependencies
3. Login to Firebase
4. Ask for Bing API key
5. Deploy everything

## Manual Setup

### Step 1: Get Bing API Key (FREE)
1. Go to https://portal.azure.com/
2. Search "Bing Search v7"
3. Create with **FREE tier (F1)** - 1000 searches/month
4. Copy API Key

### Step 2: Add Key
Edit `functions/.env`:
```
GEMINI_API_KEY=AIzaSyA-RETtGyvxGU6Xf6KB45pDvCzDFiI19C0
BING_API_KEY=your_actual_key_here
```

### Step 3: Deploy
```bash
firebase login
cd functions
npm install
cd ..
firebase deploy --only functions
```

## After Deployment

Your function will be live at:
```
https://us-central1-career-roadmap-e7b2c.cloudfunctions.net/chatWithGemini
```

Frontend is already configured to use this URL!

## Test Real-Time Responses

Ask your chatbot:
- "Who is the CM of Kerala?"
- "Current Prime Minister?"
- "Latest AI news?"

## Troubleshooting

**Deployment fails?**
- Enable billing in Firebase Console (Blaze plan required for Cloud Functions)
- Verify project: `firebase use career-roadmap-e7b2c`
- Check logs: `firebase functions:log`

**Function not responding?**
- Wait 2-3 minutes after deployment
- Check browser console for errors
- Verify function deployed: `firebase functions:list`

**CORS errors?**
- Already handled in function code
- If issues persist, check Firebase Console logs

## Cost

- Firebase Functions: FREE tier includes 2M invocations/month
- Bing Search: FREE tier includes 1000 searches/month
- Gemini API: FREE tier includes 60 requests/minute

Perfect for your app! 🚀

## Update Function

To update after changes:
```bash
firebase deploy --only functions
```

## View Logs

```bash
firebase functions:log
```

## Delete Function

```bash
firebase functions:delete chatWithGemini
```
