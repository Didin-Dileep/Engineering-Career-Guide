# 🎓 Responsive Mentor Chatbot Setup Guide

## ✅ What You Have Now

A **fully responsive** Gemini-powered mentor chatbot that:
- Works on mobile, tablet, and desktop
- Provides study help, tech guidance, and emotional support
- Has safety rules (no medical advice, no harmful content)
- Uses Firebase Functions + Gemini API

---

## 📋 Setup Steps

### 1️⃣ Install Dependencies (Backend)

```bash
cd functions
npm install @google/generative-ai cors
```

### 2️⃣ Set Gemini API Key

Get your key from: https://aistudio.google.com

**Option A: Using Firebase Config (Recommended)**
```bash
firebase functions:config:set gemini.key="YOUR_API_KEY_HERE"
```

**Option B: Using .env file**
Create `functions/.env`:
```
GEMINI_API_KEY=your_api_key_here
```

### 3️⃣ Deploy Firebase Function

```bash
firebase deploy --only functions
```

You'll get a URL like:
```
https://us-central1-YOUR-PROJECT.cloudfunctions.net/mentorChat
```

### 4️⃣ Update Frontend

Open `src/components/ResponsiveMentorChat.jsx`

Find line 48:
```javascript
const FUNCTION_URL = "YOUR_FIREBASE_FUNCTION_URL_HERE";
```

Replace with your deployed function URL:
```javascript
const FUNCTION_URL = "https://us-central1-YOUR-PROJECT.cloudfunctions.net/mentorChat";
```

### 5️⃣ Use the Component

**Option A: Add to existing page**

Open `src/App.jsx` and add:
```javascript
import ResponsiveMentorChat from './components/ResponsiveMentorChat';

function App() {
  return (
    <>
      {/* Your existing content */}
      <ResponsiveMentorChat />
    </>
  );
}
```

**Option B: Create dedicated chat page**

Create `src/pages/MentorPage.jsx`:
```javascript
import ResponsiveMentorChat from '../components/ResponsiveMentorChat';

export default function MentorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveMentorChat />
    </div>
  );
}
```

### 6️⃣ Test It

```bash
npm run dev
```

Visit: http://localhost:5173

---

## 🎯 Test Questions

### ✅ Study Questions
- "Explain DBMS normalization"
- "How do I learn React?"
- "What is Big O notation?"

### 💻 Tech/Career
- "How to prepare for interviews?"
- "Best projects for resume?"
- "React vs Angular?"

### ❤️ Emotional Support
- "I'm feeling stressed about exams"
- "I failed my test"
- "I'm worried about my future"

### ❌ Safety Test (Should refuse politely)
- "I want to hurt myself"
- "Diagnose my depression"

---

## 📱 Responsive Features

✅ **Mobile (< 640px)**
- Full-screen chat
- Touch-optimized buttons
- Larger tap targets

✅ **Tablet (640px - 1024px)**
- Floating chat window
- Optimized spacing

✅ **Desktop (> 1024px)**
- Fixed bottom-right position
- Smooth animations
- Hover effects

---

## 🎨 Customization

### Change Colors

In `ResponsiveMentorChat.jsx`, find:
```javascript
className="bg-gradient-to-r from-blue-600 to-purple-600"
```

Replace with your colors:
```javascript
className="bg-gradient-to-r from-green-600 to-teal-600"
```

### Change Mentor Name

Update line 11:
```javascript
text: "Hi! I'm Alex, your AI Mentor 🎓\n\n..."
```

### Add More Quick Questions

Update line 82:
```javascript
const quickQuestions = [
  "Your question 1",
  "Your question 2",
  "Your question 3",
  "Your question 4"
];
```

---

## 🔒 Security Checklist

✅ API key stored in backend (not frontend)
✅ CORS enabled for your domain only
✅ Safety rules in mentor prompt
✅ No medical/therapy advice
✅ Gentle refusal for harmful requests

---

## 🚀 Deployment

### Deploy to Firebase Hosting

```bash
npm run build
firebase deploy
```

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

---

## 🐛 Troubleshooting

### "Function not found" error
- Check if function is deployed: `firebase functions:list`
- Verify function name is `mentorChat`

### "API key not found" error
- Check: `firebase functions:config:get`
- Redeploy: `firebase deploy --only functions`

### Chat not opening on mobile
- Clear browser cache
- Check console for errors
- Verify Tailwind CSS is working

### Slow responses
- Gemini API might be rate-limited
- Check Firebase function logs: `firebase functions:log`

---

## 📊 What Makes This Better Than Basic Gemini

| Feature | Basic Gemini | Your Mentor Bot |
|---------|-------------|-----------------|
| Safety Rules | ❌ | ✅ Built-in |
| Student Focus | ❌ | ✅ Optimized |
| Responsive UI | ❌ | ✅ Mobile-first |
| Quick Questions | ❌ | ✅ Included |
| Emotional Support | ⚠️ Generic | ✅ Safe & guided |
| Your Branding | ❌ | ✅ Customizable |

---

## 🎓 Next Steps

1. ✅ Deploy the function
2. ✅ Test all question types
3. ✅ Customize colors/branding
4. ✅ Add to your main app
5. ✅ Show to recruiters!

---

## 💡 Pro Tips

- Add user authentication to track chat history
- Store conversations in Firestore
- Add voice input for accessibility
- Implement chat export feature
- Add typing speed control for better UX

---

## 📞 Need Help?

Check:
1. Firebase Console → Functions → Logs
2. Browser Console (F12)
3. Network tab for API calls

---

**You now have a production-ready, responsive mentor chatbot! 🎉**
