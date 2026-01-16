# 🎓 AI Mentor Chatbot - Responsive & Safe

> A production-ready, mobile-first AI mentor chatbot built with React, Firebase, and Gemini API

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.7-orange.svg)](https://firebase.google.com/)
[![Gemini](https://img.shields.io/badge/Gemini-API-purple.svg)](https://ai.google.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.1-teal.svg)](https://tailwindcss.com/)

---

## 🌟 Features

### 📱 Fully Responsive
- **Mobile:** Full-screen chat experience
- **Tablet:** Floating window with smooth animations
- **Desktop:** Fixed bottom-right position

### 🛡️ Safe & Ethical
- Built-in safety rules
- No medical/therapy advice
- Gentle emotional support
- Student-focused responses

### ⚡ Great UX
- Typing indicators
- Quick question buttons
- Auto-scroll messages
- Smooth animations
- Time stamps

### 🔒 Secure Architecture
- API keys in backend
- Firebase Cloud Functions
- CORS protection
- Error handling

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd functions
npm install @google/generative-ai cors
cd ..
```

### 2. Configure API Key
```bash
firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY"
```

Get your key: [Google AI Studio](https://aistudio.google.com)

### 3. Deploy Backend
```bash
firebase deploy --only functions
```

### 4. Update Frontend
Edit `src/components/ResponsiveMentorChat.jsx` line 48:
```javascript
const FUNCTION_URL = "YOUR_FIREBASE_FUNCTION_URL";
```

### 5. Run
```bash
npm run dev
```

---

## 📸 Screenshots

### Mobile View
```
┌─────────────────────────┐
│  🎓 AI Mentor       [X] │
├─────────────────────────┤
│                         │
│  ┌──────────────────┐  │
│  │ Hi! I'm your AI  │  │
│  │ Mentor 🎓        │  │
│  └──────────────────┘  │
│                         │
│         ┌────────────┐  │
│         │ Hello!     │  │
│         └────────────┘  │
│                         │
├─────────────────────────┤
│ [Quick Questions]       │
├─────────────────────────┤
│ [Type message...] [→]   │
└─────────────────────────┘
```

### Desktop View
```
                    ┌──────────────────┐
                    │ 🎓 AI Mentor [X] │
                    ├──────────────────┤
                    │  Bot messages    │
                    │  User messages   │
                    ├──────────────────┤
                    │ [Quick Q's]      │
                    ├──────────────────┤
                    │ [Input] [Send]   │
                    └──────────────────┘
                           ↑
                    Floating window
```

---

## 🎯 Use Cases

### ✅ Study Help
```
User: "Explain React hooks"
Bot: "Hey! Great question! 🎓 Let me break down React hooks..."
```

### ✅ Career Guidance
```
User: "How to prepare for interviews?"
Bot: "I've seen so many students succeed! Here's what works..."
```

### ✅ Emotional Support
```
User: "I'm feeling stressed about exams"
Bot: "I hear you! 💙 Take a deep breath. Here's what helps..."
```

### ❌ Safety (Refuses Appropriately)
```
User: "Diagnose my depression"
Bot: "I'm not equipped for this. Please talk to a professional..."
```

---

## 🏗️ Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────┐
│  React Component        │
│  ResponsiveMentorChat   │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  Firebase Function      │
│  mentorChat             │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  Gemini API             │
│  (with mentor prompt)   │
└─────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18.3, Tailwind CSS 4.1
- **Backend:** Firebase Cloud Functions
- **AI:** Google Gemini API
- **Deployment:** Firebase Hosting / Vercel

---

## 📦 Project Structure

```
career-roadmap/
├── functions/
│   ├── index.js              # Backend function with mentor logic
│   └── package.json
├── src/
│   ├── components/
│   │   └── ResponsiveMentorChat.jsx  # Main chatbot component
│   ├── App.jsx               # Integrated chatbot
│   └── ...
├── QUICK_START.md            # 5-minute setup guide
├── RESPONSIVE_MENTOR_SETUP.md # Detailed setup
├── MENTOR_FEATURES.md        # Feature comparison
└── RESPONSIVE_DESIGN.md      # Design specifications
```

---

## 🎨 Customization

### Change Colors
```javascript
// In ResponsiveMentorChat.jsx
className="from-blue-600 to-purple-600"
// Change to:
className="from-green-600 to-teal-600"
```

### Change Mentor Name
```javascript
text: "Hi! I'm Alex, your AI Mentor 🎓..."
// Change to:
text: "Hi! I'm [YourName], your AI Mentor 🎓..."
```

### Add Quick Questions
```javascript
const quickQuestions = [
  "Your custom question 1",
  "Your custom question 2",
];
```

---

## 🧪 Testing

### Test Questions
```bash
# Study
"Explain DBMS normalization"
"How do I learn DSA?"

# Career
"Interview preparation tips?"
"Best projects for resume?"

# Emotional
"I'm feeling stressed"
"I failed my exam"

# Safety (should refuse)
"Diagnose my depression"
```

---

## 🐛 Troubleshooting

### Function not found
```bash
firebase functions:list
firebase deploy --only functions
```

### API key error
```bash
firebase functions:config:get
firebase functions:config:set gemini.key="YOUR_KEY"
```

### CORS error
Already handled! Check logs:
```bash
firebase functions:log
```

---

## 📈 Future Enhancements

- [ ] Chat history (Firestore)
- [ ] User authentication
- [ ] Voice input
- [ ] Multi-language support
- [ ] Code syntax highlighting
- [ ] File attachments
- [ ] Analytics dashboard

---

## 🎓 Learning Outcomes

This project demonstrates:

✅ Firebase Cloud Functions (serverless backend)
✅ Gemini API integration
✅ Responsive design (mobile-first)
✅ React state management
✅ Security best practices
✅ Ethical AI implementation
✅ Production deployment

---

## 📄 License

MIT License - Feel free to use for your projects!

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch
3. Submit a pull request

---

## 📞 Support

- 📖 [Quick Start Guide](QUICK_START.md)
- 📖 [Setup Guide](RESPONSIVE_MENTOR_SETUP.md)
- 📖 [Features](MENTOR_FEATURES.md)
- 📖 [Design Specs](RESPONSIVE_DESIGN.md)

---

## ⭐ Show Your Support

If this helped you, give it a ⭐️!

---

## 👨‍💻 Author

Built with ❤️ for students everywhere

---

## 🎉 Acknowledgments

- Google Gemini API
- Firebase Platform
- React Community
- Tailwind CSS

---

**Made with 💙 to help students succeed**
