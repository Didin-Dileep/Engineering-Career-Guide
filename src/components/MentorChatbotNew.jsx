import React, { useState, useRef, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { trackChatbotUsed } from '../utils/analytics';

export default function MentorChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Alex, your personal AI mentor 🤖 I understand emotions and create personalized study plans just for you!\n\nI'm here to help with:\n• Emotional support during tough times\n• Custom study schedules based on your time\n• Breaking down complex concepts\n• Career guidance with empathy\n\nHow are you feeling today? 😊",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [userContext, setUserContext] = useState({
    name: '',
    year: '',
    mood: '',
    timeAvailable: ''
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user context from Firebase
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

  // Detect emotional state
  const detectMood = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('stress') || msg.includes('overwhelm') || msg.includes('anxious') || msg.includes('worried')) return 'stressed';
    if (msg.includes('confused') || msg.includes('lost') || msg.includes('don\'t understand')) return 'confused';
    if (msg.includes('excited') || msg.includes('motivated') || msg.includes('ready')) return 'motivated';
    if (msg.includes('tired') || msg.includes('exhausted') || msg.includes('burnout')) return 'tired';
    if (msg.includes('sad') || msg.includes('depressed') || msg.includes('down')) return 'sad';
    return 'neutral';
  };

  // Detect time availability
  const detectTimeAvailable = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('1 hour') || msg.includes('one hour')) return '1 hour';
    if (msg.includes('2 hour') || msg.includes('two hour')) return '2 hours';
    if (msg.includes('30 min') || msg.includes('half hour')) return '30 minutes';
    if (msg.includes('weekend') || msg.includes('saturday') || msg.includes('sunday')) return 'weekend';
    if (msg.includes('busy') || msg.includes('no time')) return 'very limited';
    return 'not specified';
  };

  // Enhanced AI responses with emotional intelligence
  const getAIResponse = async (userMessage) => {
    setIsTyping(true);
    setStreamingMessage('');
    const startTime = Date.now();
    
    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY) {
        throw new Error('API key not found');
      }

      const mood = detectMood(userMessage);
      const timeAvailable = detectTimeAvailable(userMessage);
      
      const simplePrompt = `You are Alex, a friendly AI mentor. Student asks: "${userMessage}". Give a helpful, encouraging response in under 100 words.`;

      const requestBody = {
        contents: [{
          parts: [{ text: contextualPrompt }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 50,
          topP: 0.95,
          maxOutputTokens: 250
        }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: simplePrompt }] }]
        })
      });
      
      if (!response.ok) {
        throw new Error(`API failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const aiText = data.candidates[0].content.parts[0].text;
        
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
      
      const fallback = getEmotionalFallback(userMessage);
      await simulateStreaming(fallback);
      return fallback;
    }
  };

  // Simulate streaming for better UX
  const simulateStreaming = async (text) => {
    const words = text.split(' ');
    setStreamingMessage('');
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30));
      setStreamingMessage(words.slice(0, i + 1).join(' '));
    }
    setStreamingMessage('');
  };

  // Emotional fallback responses
  const getEmotionalFallback = (userMessage) => {
    const msg = userMessage.toLowerCase();
    const mood = detectMood(userMessage);
    const timeAvailable = detectTimeAvailable(userMessage);
    const name = userContext.name ? `, ${userContext.name}` : '';
    
    // Emotional responses first
    if (mood === 'stressed') {
      return `Hey${name} 🤗 I can sense you're feeling overwhelmed right now, and that's completely okay. Take a deep breath with me for a moment.

When I work with stressed students, here's what helps:
• Break everything into tiny 15-minute chunks
• Start with just ONE easy problem today
• Remember: progress > perfection
• You're not behind - you're exactly where you need to be

What's the biggest thing stressing you out right now? Let's tackle it together. 💙`;
    }
    
    if (mood === 'confused') {
      return `I hear the confusion in your message${name}, and honestly? That means you're learning! 🌱

Confusion is just your brain making new connections. Here's how we'll clear the fog:
• Let's identify the EXACT concept that's tricky
• I'll break it down into bite-sized pieces
• We'll find 3 different ways to understand it
• Practice with super simple examples first

What specific topic has you scratching your head? I'm here to untangle it with you! 🧩`;
    }
    
    if (mood === 'tired') {
      return `Oh${name}, I can feel the exhaustion in your words 😴 Your brain needs rest to absorb all that learning!

When you're this tired:
• 20-minute study sessions MAX
• Focus on review, not new concepts
• Try the Pomodoro technique
• Sleep is NOT optional - it's when learning happens

How many hours did you sleep last night? Sometimes the best study plan is a good nap first! 💤`;
    }
    
    // Study plan requests
    if (msg.includes('study plan') || msg.includes('schedule')) {
      let plan = `Perfect${name}! Let me create a personalized study plan for you 📅

`;
      
      if (timeAvailable === '1 hour') {
        plan += `**Your 1-Hour Daily Plan:**
• 20 min: Review previous concepts
• 30 min: Learn 1 new topic
• 10 min: Practice problems

This is actually perfect - focused learning beats marathon sessions!`;
      } else if (timeAvailable === '2 hours') {
        plan += `**Your 2-Hour Power Plan:**
• 45 min: Deep dive into 1 major topic
• 15 min: Break (seriously, take it!)
• 45 min: Practice problems
• 15 min: Review and plan tomorrow`;
      } else if (timeAvailable === 'weekend') {
        plan += `**Weekend Warrior Plan:**
• Saturday: 3 hours spread across morning/evening
• Sunday: 2 hours + project work
• Include fun coding projects - weekends should be enjoyable!`;
      } else {
        plan += `**Flexible Daily Plan:**
• Morning: 30 min theory (fresh brain!)
• Evening: 45 min practice
• Before bed: 15 min review

How much time can you realistically dedicate daily?`;
      }
      
      return plan;
    }
    
    // DSA with emotional support
    if (msg.includes('algorithm') || msg.includes('dsa')) {
      return `${name}, DSA can feel like climbing Mount Everest at first - I've been there! 🏔️

Here's my proven approach for ${userContext.year || 'your'} year:
• Week 1-2: Arrays & Strings (build confidence!)
• Week 3-4: Linked Lists & Stacks
• Week 5-6: Trees & Recursion
• Celebrate EVERY small win

Feeling overwhelmed? Start with just 1 easy problem today. I believe in you! What's your biggest DSA fear right now? 💪`;
    }
    
    // Career guidance with empathy
    if (msg.includes('career') || msg.includes('job') || msg.includes('future')) {
      return `${name}, career anxiety is SO normal - every successful engineer felt this way! 🌟

Your ${userContext.year || ''} year journey:
• Focus on building 2-3 solid projects
• Network with seniors (they want to help!)
• Apply to internships even if you feel "not ready"
• Remember: companies hire potential, not perfection

What's your dream company? Let's reverse-engineer the path there together! 🚀`;
    }
    
    return `Hey there${name}! 👋 I'm Alex, and I'm genuinely excited to help you succeed! 

I specialize in:
• Creating personalized study plans
• Emotional support during tough times
• Breaking down complex concepts
• Career guidance & confidence building

What's on your mind today? I'm here to listen and help! 😊`;
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
    "I'm feeling overwhelmed with studies",
    "Create a study plan for me",
    "I have 2 hours daily, help me",
    "I'm confused about my career path"
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
                <h3 className="font-semibold">Alex - Your AI Mentor</h3>
                <p className="text-xs text-blue-100">Emotionally intelligent & caring!</p>
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
              <p className="text-xs text-gray-600 mb-2">Try asking:</p>
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
                placeholder="Share what's on your mind..."
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


