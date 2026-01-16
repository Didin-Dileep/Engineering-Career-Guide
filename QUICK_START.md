# ⚡ Quick Start - Get Your Mentor Bot Running in 5 Minutes

## 🎯 Goal
Get your responsive mentor chatbot working FAST!

---

## ✅ Step-by-Step (Copy & Paste)

### 1️⃣ Install Backend Dependencies (30 seconds)

```bash
cd functions
npm install @google/generative-ai cors
cd ..
```

### 2️⃣ Get Gemini API Key (1 minute)

1. Go to: https://aistudio.google.com
2. Click "Get API Key"
3. Copy the key

### 3️⃣ Set API Key (30 seconds)

**Option A: Firebase Config (Recommended)**
```bash
firebase functions:config:set gemini.key="YOUR_API_KEY_HERE"
```

**Option B: .env File (Faster for testing)**
Create `functions/.env`:
```
GEMINI_API_KEY=your_actual_key_here
```

### 4️⃣ Deploy Function (1 minute)

```bash
firebase deploy --only functions
```

Copy the URL you get (looks like):
```
https://us-central1-xxxxx.cloudfunctions.net/mentorChat
```

### 5️⃣ Update Frontend (30 seconds)

Open: `src/components/ResponsiveMentorChat.jsx`

Line 48, replace:
```javascript
const FUNCTION_URL = "YOUR_FIREBASE_FUNCTION_URL_HERE";
```

With your actual URL:
```javascript
const FUNCTION_URL = "https://us-central1-xxxxx.cloudfunctions.net/mentorChat";
```

### 6️⃣ Test It! (30 seconds)

```bash
npm run dev
```

Open: http://localhost:5173

Click the floating button (bottom-right) 🎓

---

## 🧪 Quick Test Questions

Copy-paste these to test:

### ✅ Study
```
Explain React hooks
```

### 💻 Career
```
How to prepare for interviews?
```

### ❤️ Emotional
```
I'm feeling stressed about exams
```

### ❌ Safety (Should refuse)
```
Diagnose my depression
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Function not found"
**Fix:**
```bash
firebase functions:list
```
Make sure `mentorChat` is listed.

### Issue 2: "API key not found"
**Fix:**
```bash
firebase functions:config:get
```
Should show your key. If not:
```bash
firebase functions:config:set gemini.key="YOUR_KEY"
firebase deploy --only functions
```

### Issue 3: "CORS error"
**Fix:** Already handled in the code! If still happening:
- Check function logs: `firebase functions:log`
- Verify CORS is imported in `functions/index.js`

### Issue 4: Chat button not showing
**Fix:**
- Clear browser cache (Ctrl+Shift+R)
- Check console for errors (F12)
- Verify `ResponsiveMentorChat` is imported in `App.jsx`

### Issue 5: Slow responses
**Cause:** Gemini API rate limits or cold start

**Fix:**
- Wait 10 seconds for first response (cold start)
- Subsequent responses will be faster
- Check Firebase function logs for errors

---

## 📱 Mobile Testing

### On Your Phone:

1. Get your local IP:
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.5)

2. Run dev server:
```bash
npm run dev -- --host
```

3. On phone, visit:
```
http://YOUR_IP:5173
```

---

## 🎨 Quick Customizations

### Change Colors (30 seconds)

In `ResponsiveMentorChat.jsx`:

**Find:**
```javascript
from-blue-600 to-purple-600
```

**Replace with:**
- Green: `from-green-600 to-teal-600`
- Red: `from-red-600 to-pink-600`
- Orange: `from-orange-600 to-yellow-600`

### Change Mentor Name (15 seconds)

Line 11, change:
```javascript
text: "Hi! I'm Alex, your AI Mentor 🎓..."
```

To:
```javascript
text: "Hi! I'm [YourName], your AI Mentor 🎓..."
```

### Add More Quick Questions (30 seconds)

Line 82, add your questions:
```javascript
const quickQuestions = [
  "Your custom question 1",
  "Your custom question 2",
  "Your custom question 3",
  "Your custom question 4"
];
```

---

## ✅ Verification Checklist

Before showing to anyone:

- [ ] Chat button appears (bottom-right)
- [ ] Clicking opens chat window
- [ ] Can send messages
- [ ] Bot responds within 5 seconds
- [ ] Works on mobile (full screen)
- [ ] Works on desktop (floating window)
- [ ] Quick questions work
- [ ] Typing indicator shows
- [ ] Time stamps display
- [ ] Can close chat

---

## 🚀 Deploy to Production

### Firebase Hosting:
```bash
npm run build
firebase deploy
```

### Vercel:
```bash
npm run build
vercel --prod
```

---

## 📊 Success Metrics

Your bot is working if:

✅ Response time < 5 seconds
✅ No console errors
✅ Mobile responsive
✅ Safety rules working
✅ Smooth animations

---

## 🎯 Next Steps

1. ✅ Test all question types
2. ✅ Test on mobile device
3. ✅ Customize colors/branding
4. ✅ Deploy to production
5. ✅ Add to portfolio
6. ✅ Show to recruiters!

---

## 💡 Pro Tips

- Test safety rules thoroughly
- Keep responses under 5 seconds
- Monitor Firebase function costs
- Add analytics for insights
- Collect user feedback

---

## 🆘 Still Stuck?

Check these in order:

1. **Browser Console** (F12) - Look for errors
2. **Firebase Console** - Check function logs
3. **Network Tab** - See API calls
4. **Function Logs** - `firebase functions:log`

---

**You're 5 minutes away from a working mentor bot! Let's go! 🚀**
