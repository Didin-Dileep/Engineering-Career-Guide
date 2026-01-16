# Firebase Cloud Functions Setup

Your chatbot now uses Firebase Cloud Functions for secure API calls! 🔒

## What Changed?
- ✅ Gemini API key moved to backend (Cloud Functions)
- ✅ Frontend calls your Cloud Function instead of Gemini directly
- ✅ API key never exposed to users
- ✅ Better security for production

## Setup Steps

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase (if not done)
```bash
firebase init functions
```
- Select your project: `career-roadmap-e7b2c`
- Choose JavaScript
- Use ESM: Yes
- Install dependencies: Yes

### 4. Install Function Dependencies
```bash
cd functions
npm install
```

### 5. Set Environment Variable
```bash
firebase functions:config:set gemini.api_key="AIzaSyA-RETtGyvxGU6Xf6KB45pDvCzDFiI19C0"
```

### 6. Deploy Functions
```bash
firebase deploy --only functions
```

### 7. Update Frontend URL
After deployment, Firebase will give you a URL like:
```
https://us-central1-career-roadmap-e7b2c.cloudfunctions.net/chatWithGemini
```

Update this URL in `src/utils/geminiAPI.js` if different.

## Testing Locally

### 1. Start Functions Emulator
```bash
firebase emulators:start --only functions
```

### 2. Update geminiAPI.js for local testing
Change URL to:
```javascript
"http://127.0.0.1:5001/career-roadmap-e7b2c/us-central1/chatWithGemini"
```

## Cost & Limits
- Firebase Functions: Free tier includes 2M invocations/month
- Gemini API: Free tier includes 60 requests/minute
- Should be plenty for development and small-scale production

## Security Notes
- ✅ API key stored in Firebase environment (secure)
- ✅ CORS enabled for your domain
- ✅ No API key in frontend code
- ✅ Rate limiting handled by Firebase

## Troubleshooting

### Function not working?
1. Check logs: `firebase functions:log`
2. Verify environment variable: `firebase functions:config:get`
3. Test locally with emulator first

### CORS errors?
- Cloud Function already has CORS enabled for all origins
- For production, update `cors({ origin: true })` to specific domain

### Deployment fails?
- Make sure you're logged in: `firebase login`
- Check project: `firebase use career-roadmap-e7b2c`
- Verify billing is enabled (required for Cloud Functions)

## Alternative: Keep Current Setup
Your current setup (frontend → Gemini API) works fine! Just:
1. Add domain restrictions in Google Cloud Console
2. Keep API key in `.env`
3. Don't commit `.env` to Git

Cloud Functions is optional but recommended for production.
