import React, { useState, useRef, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { trackChatbotUsed } from '../utils/analytics';

export default function MentorChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI Career Mentor 🤖 I'm here to help you succeed in your engineering journey!\n\nFeel free to ask me about:\n• Programming & DSA tips\n• Career guidance & job hunting\n• Project ideas & building cool stuff\n• Interview prep & confidence building\n\nWhat's on your mind today? 😊",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [userContext, setUserContext] = useState({
    name: '',
    year: '',
    mood: '',
    timeAvailable: '',
    lastTopic: ''
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get user context from Firebase
  useEffect(() => {
    const loadUserContext = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserContext(prev => ({
              ...prev,
              name: userData.name || '',
              year: userData.year || ''
            }));
          }
        } catch (error) {
          console.log('Context load error:', error);
        }
      }
    };
    loadUserContext();
  }, []);

  // Real-time AI responses with streaming
  const getAIResponse = async (userMessage) => {
    setIsTyping(true);
    setStreamingMessage('');
    const startTime = Date.now();
    
    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY) {
        throw new Error('API key not found');
      }

      const requestBody = {
        contents: [{
          parts: [{
            text: `You are Alex, a friendly AI career mentor who's helped thousands of engineering students. You're encouraging, use casual language, and share personal insights. Respond naturally like you're chatting with a friend about: ${userMessage}

Guidelines:
- Use "I", "you", "we" - be personal
- Share encouraging words
- Use casual phrases like "Hey!", "Great question!", "I totally get it"
- Include relatable examples
- Keep it conversational and warm
- Max 120 words`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 200
        }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`API failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const aiText = data.candidates[0].content.parts[0].text;
        
        // Simulate streaming effect for better UX
        setIsTyping(false);
        await simulateStreaming(aiText);
        
        const responseTime = Date.now() - startTime;
        trackChatbotUsed(userMessage, responseTime);
        
        return aiText;
      } else {
        throw new Error('Invalid response');
      }
      
    } catch (error) {
      console.error('AI Error:', error);
      setIsTyping(false);
      
      // Fast fallback responses
      const fallback = getFastFallback(userMessage);
      await simulateStreaming(fallback);
      return fallback;
    }
  };

  // Simulate streaming for better UX
  const simulateStreaming = async (text) => {
    const words = text.split(' ');
    setStreamingMessage('');
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30)); // 30ms per word
      setStreamingMessage(words.slice(0, i + 1).join(' '));
    }
    setStreamingMessage('');
  };

  // Human-like fallback responses
  const getFastFallback = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('algorithm') || msg.includes('dsa')) {
      return "Hey! 😊 DSA can feel overwhelming at first - I totally get it! Here's what worked for me and thousands of students:\n\n• Start small with arrays & strings (trust me on this!)\n• Practice just 2 problems daily - consistency beats intensity\n• Focus on patterns like two pointers - they're game changers!\n\nYou've got this! 💪 LeetCode and GeeksforGeeks are your best friends here.";
    }
    if (msg.includes('career') || msg.includes('job') || msg.includes('interview')) {
      return "Great question! 🚀 I've seen so many students land amazing jobs by following this path:\n\n• Master 300+ DSA problems (sounds scary but totally doable!)\n• Build 3-4 projects you're genuinely proud of\n• Learn system design basics (super important for senior roles)\n• Practice mock interviews - seriously, this is a game changer!\n\nRemember, every expert was once a beginner. You're on the right track! 😊";
    }
    if (msg.includes('project')) {
      return "Love this question! 💡 Projects are where the magic happens. Here's what I recommend:\n\n**Starting out?** Try a calculator or todo app - they teach fundamentals\n**Getting confident?** Build a chat app or blog - users love these!\n**Ready to impress?** Go for e-commerce or social media clone\n\nPro tip: Deploy everything on Vercel or Netlify. Recruiters love seeing live projects! ✨";
    }
    if (msg.includes('resume')) {
      return "Ah, the resume! 📄 I've reviewed thousands, and here's what makes them shine:\n\n• Keep it 1-2 pages max (recruiters have short attention spans!)\n• Lead with your best projects and skills\n• Use clean, ATS-friendly format (fancy designs often backfire)\n• Always include GitHub links - show your code!\n\nRemember, your resume is your story. Make it compelling! 🌟";
    }
    if (msg.includes('stress') || msg.includes('overwhelm') || msg.includes('difficult')) {
      return "I hear you! 🤗 Learning can feel overwhelming sometimes - that's totally normal and shows you care about growing!\n\nTake a deep breath. Break things into smaller chunks. Celebrate small wins. And remember - every coding expert started exactly where you are now.\n\nYou're not behind, you're not slow. You're learning, and that's amazing! 💙";
    }
    
    return "Hey there! 👋 I'm Alex, your friendly AI mentor! I'm here to help you navigate your engineering journey.\n\nI love chatting about:\n• DSA & coding challenges\n• Career advice & job hunting\n• Project ideas & building cool stuff\n• Interview prep & confidence building\n\nWhat's on your mind today? I'm all ears! 😊";
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Get AI response
    const aiResponse = await getAIResponse(inputText);
    
    const botMessage = {
      id: messages.length + 2,
      text: aiResponse,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "How do I start with DSA?",
    "I'm feeling overwhelmed, help!",
    "What projects should I build?",
    "How to ace interviews?"
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
        >
          {isOpen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </button>
        
        {/* Notification Badge */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
          AI
        </div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div>
                <h3 className="font-semibold">AI Career Mentor</h3>
                <p className="text-xs text-blue-100">Always here to help!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Streaming Message */}
            {streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-2xl bg-gray-100 text-gray-800">
                  <p className="text-sm whitespace-pre-line">{streamingMessage}</p>
                </div>
              </div>
            )}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(question)}
                    className="w-full text-left text-xs bg-white p-2 rounded-lg hover:bg-blue-50 transition-colors border"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


