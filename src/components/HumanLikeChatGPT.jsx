import React, { useState, useRef, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { trackChatbotUsed } from '../utils/analytics';

export default function HumanLikeChatGPT() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey there! 👋 I'm your AI buddy. I love chatting about coding, career stuff, or just helping you figure things out. What's on your mind today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userName, setUserName] = useState('');
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
            setUserName(userData.name || '');
          }
        } catch (error) {
          console.log('Context load error:', error);
        }
      }
    };
    loadUserContext();
  }, []);

  // Human-like AI response
  const getHumanResponse = async (userMessage) => {
    setIsTyping(true);
    setStreamingMessage('');
    const startTime = Date.now();
    
    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PASTE_YOUR_NEW_API_KEY_HERE') {
        throw new Error('API key not configured');
      }

      // Build conversation context
      const recentMessages = messages.slice(-8).map(msg => 
        `${msg.sender === 'user' ? 'Human' : 'AI'}: ${msg.text}`
      ).join('\n');
      
      const humanPrompt = `You are a friendly, helpful AI assistant having a natural conversation. Be conversational, use "I" and "you", show personality, and be genuinely helpful.

Previous conversation:
${recentMessages}

Human just said: "${userMessage}"

Respond naturally like you're chatting with a friend. Be helpful, conversational, and show personality. Use casual language, contractions, and be genuinely interested in helping them.`;

      const requestBody = {
        contents: [{
          parts: [{ text: humanPrompt }]
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
        console.log(`API Error: ${response.status}`);
        throw new Error(`API failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        let aiText = data.candidates[0].content.parts[0].text;
        
        setIsTyping(false);
        await simulateHumanTyping(aiText);
        
        setConversationHistory(prev => [...prev, 
          { role: 'user', content: userMessage },
          { role: 'assistant', content: aiText }
        ]);
        
        const responseTime = Date.now() - startTime;
        trackChatbotUsed(userMessage, responseTime);
        
        return aiText;
      } else {
        throw new Error('Invalid response structure');
      }
      
    } catch (error) {
      console.error('AI Error:', error.message);
      setIsTyping(false);
      
      const fallback = getPersonalizedFallback(userMessage);
      await simulateHumanTyping(fallback);
      return fallback;
    }
  };

  // Human-like typing simulation
  const simulateHumanTyping = async (text) => {
    const words = text.split(' ');
    setStreamingMessage('');
    
    for (let i = 0; i < words.length; i++) {
      // Variable typing speed like humans
      const delay = words[i].length > 6 ? 80 : 60;
      await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 40));
      
      setStreamingMessage(words.slice(0, i + 1).join(' '));
      
      // Pause at punctuation like humans do
      if (words[i].includes('.') || words[i].includes('!') || words[i].includes('?')) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    setStreamingMessage('');
  };

  // Personalized fallback responses
  const getPersonalizedFallback = (userMessage) => {
    const msg = userMessage.toLowerCase();
    const name = userName ? `, ${userName}` : '';
    
    // Language choice for DSA
    if (msg.includes('python or c++') || (msg.includes('language') && msg.includes('dsa'))) {
      return `Oh${name}, great question! 🤔 So you're trying to decide between Python and C++ for DSA? I totally get why this is confusing!

Here's my honest take: **Go with Python first**. I know, I know - everyone says C++ is faster, but hear me out! 

When you're learning DSA concepts, Python lets you focus on the *logic* instead of wrestling with syntax. Like, you can write a binary search in 5 lines instead of 15! Plus, most companies (Google, Facebook, etc.) are totally cool with Python in interviews.

Here's what I'd do if I were you:
• **Month 1-2:** Learn Python + basic DSA (arrays, strings)
• **Month 3-4:** Get comfortable with trees, graphs in Python  
• **Month 5+:** If you want speed for competitive programming, then learn C++

The thing is${name}, understanding *how* algorithms work is way more important than which language you use. Once you get the concepts in Python, switching to C++ later is pretty easy.

What do you think? Are you leaning towards one already, or still totally unsure? 😊`;
    }

    // LeetCode and platforms
    if (msg.includes('leetcode') || msg.includes('coding platform') || msg.includes('practice')) {
      return `Ah${name}, looking for good coding practice sites? You've come to the right place! 😄

**LeetCode** is definitely the king - https://leetcode.com/. Like, if you're serious about getting into good companies, this is where you'll spend most of your time. They have problems sorted by company (Google, Amazon, etc.) which is super helpful!

But honestly? Don't just stick to one platform. Here's what I'd recommend:

**Start here:**
• **GeeksforGeeks** - Amazing for learning concepts first
• **HackerRank** - Great for beginners, builds confidence

**Then move to:**
• **LeetCode** - The main event for interview prep
• **CodeChef** - If you want to try competitive programming

**Pro tip${name}:** Start with GeeksforGeeks to understand the theory, then jump to LeetCode to practice. Don't go straight to LeetCode - you'll just get frustrated!

I usually tell people to solve like 2-3 easy problems daily rather than trying to do 10 in one day and then burning out. Consistency beats intensity every time!

Which one sounds good to start with? Or are you already using any of these? 🤓`;
    }

    // DSA learning
    if (msg.includes('dsa') || msg.includes('data structures') || msg.includes('algorithms')) {
      return `Hey${name}! DSA questions - I love these! 🚀 It's like the foundation of everything in programming, right?

So here's the thing about DSA - it seems super overwhelming at first (trust me, we've all been there!), but once you get the hang of it, it's actually pretty fun. Like solving puzzles!

**Here's how I'd approach it:**

**Week 1-2: Arrays & Strings**
Start simple! Two pointers, sliding window - these patterns show up EVERYWHERE. Do like 20-30 easy problems just to get comfortable.

**Week 3-4: Linked Lists & Stacks**
These teach you pointer manipulation. Super important for interviews!

**Month 2: Trees**
This is where it gets interesting! Binary trees, BSTs - once you nail tree traversals, you'll feel like a coding wizard 🧙‍♂️

**Month 3: Graphs & DP**
The final boss levels! But by this point, you'll be ready.

The key${name} is to not rush it. I see so many people trying to learn everything in 2 weeks and then giving up. Take your time, understand each concept properly.

What's your current level? Complete beginner or have you done some programming before? That'll help me give you more specific advice! 😊`;
    }

    // Career guidance
    if (msg.includes('career') || msg.includes('job') || msg.includes('placement') || msg.includes('interview')) {
      return `Oh${name}, career planning! This is such an important topic, and I'm excited you're thinking about it early! 🌟

You know what? The job market right now is actually pretty good for developers, but it's also competitive. The companies that are hiring are looking for people who really know their stuff.

**Here's what's working in 2024:**

**For getting interviews:**
• Strong DSA skills (yeah, I know, everyone says this!)
• 2-3 solid projects that actually work and look good
• A clean GitHub profile that shows you code regularly

**For acing interviews:**
• Being able to explain your thought process clearly
• Knowing your projects inside and out
• Having good communication skills (this is HUGE!)

**Package-wise**, I'm seeing:
• Service companies: 4-8 LPA for freshers
• Product companies: 8-15 LPA  
• Top tier (FAANG): 15+ LPA

But honestly${name}, don't just chase the money. Find a place where you'll learn and grow. A good first job teaches you more than any course ever will!

What stage are you at right now? Still studying or getting ready to apply? And what kind of companies interest you most? 🤔`;
    }

    // Greetings
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      const greetings = [
        `Hey${name}! 😊 Great to see you here! I'm really excited to chat with you. What's going on in your world today?`,
        `Hi there${name}! 👋 I'm so glad you stopped by. I love helping people with coding, career stuff, or just having good conversations. What's on your mind?`,
        `Hello${name}! 🌟 Nice to meet you! I'm here to help with whatever you're working on - whether it's technical stuff, career questions, or just brainstorming. What can we dive into together?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Default personalized response
    const defaults = [
      `That's a really interesting question${name}! I love how you're thinking about this. Let me share what I know and see if we can figure this out together. What specific part of this are you most curious about?`,
      `Great question${name}! 🤔 I can tell you're really thinking deeply about this stuff, which I totally respect. Let me break down what I know about this topic and we can explore it together!`,
      `Oh${name}, this is exactly the kind of thing I enjoy discussing! There's actually quite a bit to unpack here. What's your current understanding of this? I'd love to build on what you already know!`
    ];
    
    return defaults[Math.floor(Math.random() * defaults.length)];
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

    const aiResponse = await getHumanResponse(currentInput);
    
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
      text: "Hey there! 👋 I'm your AI buddy. I love chatting about coding, career stuff, or just helping you figure things out. What's on your mind today?",
      sender: 'bot',
      timestamp: new Date()
    }]);
    setConversationHistory([]);
  };

  const casualPrompts = [
    "Hey! How's it going?",
    "Python or C++ for DSA? I'm confused 😅",
    "What's the best way to practice coding?",
    "I'm feeling overwhelmed with placement prep",
    "Can you help me understand algorithms?",
    "What should I focus on for my career?"
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-indigo-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          {isOpen ? (
            <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </button>
        
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce font-bold">
          😊
        </div>
      </div>

      {/* Human-like Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[500px] h-[720px] bg-white rounded-3xl shadow-2xl z-40 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-indigo-400 opacity-20"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl">😊</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Your AI Buddy</h3>
                <p className="text-xs text-pink-100">Friendly, helpful, and human-like!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <button
                onClick={clearConversation}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Fresh start"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-purple-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-white text-gray-800 shadow-md border border-purple-100'
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
                <div className="max-w-[85%] p-4 rounded-2xl bg-white text-gray-800 shadow-md border border-purple-100">
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {streamingMessage}
                    <span className="inline-block w-2 h-5 bg-purple-500 ml-1 animate-pulse rounded"></span>
                  </p>
                </div>
              </div>
            )}
            
            {/* Typing Indicator */}
            {isTyping && !streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-md border border-purple-100">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">😊 Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Casual Prompts */}
          {messages.length <= 1 && (
            <div className="p-5 border-t bg-gradient-to-r from-purple-50 to-pink-50">
              <p className="text-xs text-gray-600 mb-3 font-semibold">😊 Let's chat about:</p>
              <div className="grid grid-cols-1 gap-2">
                {casualPrompts.slice(0, 3).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(prompt)}
                    className="text-left text-xs bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-xl hover:from-pink-100 hover:to-purple-100 transition-all duration-200 border border-pink-200 hover:border-purple-300 hover:shadow-md"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-5 border-t bg-white">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Just chat with me like a friend! 😊"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none max-h-24 min-h-[48px]"
                  disabled={isTyping}
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
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


