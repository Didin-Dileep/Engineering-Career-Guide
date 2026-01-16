# How to Deploy - Simple Steps

## Step 1: Get Bing API Key (5 minutes)

1. Open https://portal.azure.com/
2. Sign in (create free account if needed)
3. In search bar, type: **Bing Search v7**
4. Click "Create"
5. Fill form:
   - Name: chatbot-search
   - Pricing: **F1 (Free)**
6. Click "Create"
7. After creation, click "Go to resource"
8. Click "Keys and Endpoint" on left
9. Copy **KEY 1**

## Step 2: Add Key to Project

Open file: `functions/.env`

Replace `YOUR_BING_API_KEY` with your actual key:
```
GEMINI_API_KEY=AIzaSyA-RETtGyvxGU6Xf6KB45pDvCzDFiI19C0
BING_API_KEY=paste_your_key_here
```

Save the file.

## Step 3: Run Deployment Script

Double-click: `deploy-firebase.bat`

OR run in terminal:
```bash
deploy-firebase.bat
```

The script will:
- Install Firebase CLI
- Login to Firebase
- Deploy your function

Follow the prompts!

## Step 4: Test

After deployment (2-3 minutes), test your chatbot:
- "Who is the CM of Kerala?"
- "Current Prime Minister?"

Done! 🎉

---

## If Script Doesn't Work

Run these commands manually:

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Deploy
firebase deploy --only functions
```

## Troubleshooting

**"Billing required" error?**
- Go to Firebase Console
- Upgrade to Blaze plan (pay-as-you-go)
- Don't worry - it's FREE within limits!

**Function not responding?**
- Wait 2-3 minutes after deployment
- Check: firebase functions:log

**Need help?**
Check FIREBASE_DEPLOY.md for detailed guide.
