# Firebase Cloud Functions Setup

## Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

## Select options:
- Use existing project: career-roadmap-e7b2c
- Language: JavaScript
- ESLint: Yes
- Install dependencies: Yes

## Function code (functions/index.js):
```javascript
const functions = require('firebase-functions');
const cors = require('cors')({origin: true});

exports.chatWithAI = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const { message } = req.body;
      const GEMINI_API_KEY = functions.config().gemini.key;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI Career Mentor for engineering students. Provide helpful advice about: ${message}`
            }]
          }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;

      res.json({ response: aiResponse });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'AI service unavailable' });
    }
  });
});
```

## Deploy:
```bash
firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY"
firebase deploy --only functions
```

## Update your React app to use Cloud Function instead of direct API