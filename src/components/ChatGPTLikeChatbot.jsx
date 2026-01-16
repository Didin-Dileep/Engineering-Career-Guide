import React, { useState, useRef, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { trackChatbotUsed } from '../utils/analytics';

export default function ChatGPTLikeChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! I'm your AI assistant. I can help with coding, career advice, explanations, or just have a friendly chat. What's on your mind?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userContext, setUserContext] = useState({
    name: '',
    year: '',
    preferences: {}
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Load user context
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

  // Build conversation context for better responses
  const buildConversationContext = () => {
    const recentMessages = messages.slice(-6); // Last 6 messages for context
    const context = recentMessages.map(msg => 
      `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
    ).join('\n');
    
    return context;
  };

  // Enhanced AI response with human-like conversation
  const getAIResponse = async (userMessage) => {
    setIsTyping(true);
    setStreamingMessage('');
    const startTime = Date.now();
    
    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PASTE_YOUR_NEW_API_KEY_HERE') {
        console.log('No valid API key, using intelligent fallback');
        throw new Error('API key not configured');
      }

      // Build conversation context
      const recentMessages = messages.slice(-8).map(msg => 
        `${msg.sender === 'user' ? 'Human' : 'Assistant'}: ${msg.text}`
      ).join('\n');
      
      const systemPrompt = `You are a helpful, friendly AI assistant. Be conversational, natural, and human-like in your responses.

Conversation history:
${recentMessages}

Human: ${userMessage}

Respond naturally as a helpful AI assistant. Be conversational, use "I" and "you", and provide helpful information. Keep responses focused but friendly.`;

      const requestBody = {
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 50,
          topP: 0.95,
          maxOutputTokens: 800
        }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        console.log(`API request failed with status: ${response.status}`);
        throw new Error(`API failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const aiText = data.candidates[0].content.parts[0].text;
        
        setIsTyping(false);
        await simulateStreaming(aiText);
        
        setConversationHistory(prev => [...prev, 
          { role: 'user', content: userMessage },
          { role: 'assistant', content: aiText }
        ]);
        
        const responseTime = Date.now() - startTime;
        trackChatbotUsed(userMessage, responseTime);
        
        return aiText;
      } else {
        console.log('Invalid API response structure:', data);
        throw new Error('Invalid response structure');
      }
      
    } catch (error) {
      console.error('AI Error:', error.message);
      setIsTyping(false);
      
      const fallback = getHumanLikeFallback(userMessage);
      await simulateStreaming(fallback);
      return fallback;
    }
  };

  // Simulate streaming like ChatGPT
  const simulateStreaming = async (text) => {
    const words = text.split(' ');
    setStreamingMessage('');
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50)); // Slightly slower for readability
      setStreamingMessage(words.slice(0, i + 1).join(' '));
    }
    setStreamingMessage('');
  };

  // Human-like fallback responses
  const getHumanLikeFallback = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    // Greetings - be warm and personal
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('good morning') || msg.includes('good afternoon')) {
      const greetings = [
        "Hey there! 👋 Great to meet you! I'm here to help with whatever you need - coding questions, career advice, or just a friendly chat. What's on your mind?",
        "Hi! 😊 I'm excited to help you today. Whether you want to talk about programming, get some advice, or explore new ideas together - I'm all ears!",
        "Hello! Nice to see you here! I love helping people learn and solve problems. What would you like to dive into today?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // How are you - be conversational
    if (msg.includes('how are you') || msg.includes('how do you do')) {
      return "I'm doing great, thanks for asking! 😊 I'm always excited to help people learn new things and solve interesting problems. I find every conversation unique and engaging. How are you doing today? What brings you here?";
    }

    // Programming questions - be encouraging
    if (msg.includes('react') || msg.includes('javascript') || msg.includes('code') || msg.includes('programming')) {
      return "Oh, I love talking about programming! 💻 It's such a creative and problem-solving field. Whether you're just starting out or working on something complex, I'm here to help break things down and make them clearer. What specific challenge are you working on? Feel free to share code snippets if you'd like!";
    }

    // Career questions - be supportive
    if (msg.includes('career') || msg.includes('job') || msg.includes('interview') || msg.includes('work')) {
      return "Career development is such an important topic! 🚀 I really enjoy helping people navigate their professional journey. Whether you're looking for advice on skill development, interview prep, or just figuring out your next steps - I'm here to support you. What aspect of your career are you thinking about?";
    }

    // Learning questions - be motivational
    if (msg.includes('learn') || msg.includes('study') || msg.includes('understand') || msg.includes('explain')) {
      return "I absolutely love helping people learn! 📚 There's something really rewarding about breaking down complex topics and seeing that 'aha!' moment. I believe everyone can master anything with the right approach and support. What would you like to explore together?";
    }

    // Personal questions - be friendly but appropriate
    if (msg.includes('who are you') || msg.includes('what are you') || msg.includes('tell me about yourself')) {
      return "I'm an AI assistant who genuinely enjoys helping people! 🤖 I love having conversations about technology, learning, problem-solving, and pretty much anything that sparks curiosity. I try to be helpful, encouraging, and maybe a bit fun too. I'm here to support your goals and answer your questions. What would you like to know or work on together?";
    }

    // Thank you - be gracious
    if (msg.includes('thank') || msg.includes('thanks') || msg.includes('appreciate')) {
      return "You're so welcome! 😊 I really enjoy our conversation and I'm glad I could help. Feel free to ask me anything else - I'm always here and happy to assist with whatever you're working on!";
    }

    // Confused or need help
    if (msg.includes('confused') || msg.includes('don\'t understand') || msg.includes('help me') || msg.includes('stuck')) {
      return "I totally get that feeling! 🤔 Sometimes things can seem overwhelming, but we can definitely work through it together. I find that breaking problems down into smaller pieces usually helps a lot. Can you tell me more about what's got you stuck? I'm here to help figure it out step by step.";
    }

    // Default responses - be engaging and varied
    const defaultResponses = [
      "That's an interesting question! I'd love to help you with that. Could you tell me a bit more about what you're looking for? I want to make sure I give you the most helpful response possible.",
      "I'm here and ready to help! 😊 Whether it's coding, career advice, learning something new, or just having a good conversation - I'm all in. What's on your mind?",
      "Great question! I enjoy tackling all kinds of topics and problems. Feel free to share more details about what you're thinking about, and I'll do my best to provide helpful insights.",
      "I'm excited to help you with whatever you're working on! I find that every question leads to interesting discussions. What would you like to explore together?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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
    const currentInput = inputText;
    setInputText('');

    const aiResponse = await getAIResponse(currentInput);
    
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

  const clearConversation = () => {
    setMessages([{
      id: 1,
      text: "Hello! I'm your AI assistant. I can help you with programming, career advice, study plans, and much more. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }]);
    setConversationHistory([]);
  };

  const quickPrompts = [
    "Hi! How are you today?",
    "Can you help me understand React hooks?",
    "I'm feeling stuck with my coding project",
    "What's the best way to prepare for interviews?",
    "Explain JavaScript promises to me",
    "I need career advice"
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        >
          {isOpen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" />
            </svg>
          )}
        </button>
        
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
          AI
        </div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[420px] h-[600px] bg-white rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs text-green-100">Just like ChatGPT, but better! 😊</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearConversation}
                className="text-white/80 hover:text-white p-1 rounded"
                title="Clear conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm border'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Streaming Message */}
            {streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-4 rounded-2xl bg-white text-gray-800 shadow-sm border">
                  <p className="text-sm whitespace-pre-line leading-relaxed">{streamingMessage}<span className="animate-pulse">|</span></p>
                </div>
              </div>
            )}
            
            {/* Typing Indicator */}
            {isTyping && !streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-sm border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="p-4 border-t bg-white">
              <p className="text-xs text-gray-600 mb-3 font-medium">Try these prompts:</p>
              <div className="grid grid-cols-1 gap-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(prompt)}
                    className="text-left text-xs bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message AI Assistant..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="w-12 h-12 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
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


