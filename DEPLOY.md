# Quick Deploy Commands

## First Time Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Install function dependencies
cd functions
npm install
cd ..

# Set API key
firebase functions:config:set gemini.api_key="AIzaSyA-RETtGyvxGU6Xf6KB45pDvCzDFiI19C0"

# Deploy
firebase deploy --only functions
```

## After First Deploy
```bash
# Just deploy functions
firebase deploy --only functions

# View logs
firebase functions:log

# Test locally
firebase emulators:start --only functions
```

## Your Function URL
After deployment, use this URL in your app:
```
https://us-central1-career-roadmap-e7b2c.cloudfunctions.net/chatWithGemini
```

Already configured in: `src/utils/geminiAPI.js`

## Files Created
- ✅ `functions/index.js` - Cloud Function code
- ✅ `functions/package.json` - Dependencies
- ✅ `functions/.env` - Local API key (for testing)
- ✅ `firebase.json` - Firebase config
- ✅ `src/utils/geminiAPI.js` - Frontend utility
- ✅ Updated `ChatGPTClone.jsx` and `SimpleTestBot.jsx`

## Ready to Deploy?
Run: `firebase deploy --only functions`

That's it! 🚀
