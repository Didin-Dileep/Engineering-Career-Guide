import React, { useState, useRef, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { trackChatbotUsed } from '../utils/analytics';

export default function AdvancedChatGPT() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Claude, your AI assistant. I can help you with coding, explain complex concepts, provide career guidance, or discuss any topic you're curious about. What would you like to explore today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [conversationContext, setConversationContext] = useState([]);
  const [userProfile, setUserProfile] = useState({
    name: '',
    interests: [],
    skillLevel: 'beginner',
    conversationStyle: 'friendly'
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
            setUserProfile(prev => ({
              ...prev,
              name: userData.name || '',
              skillLevel: userData.year === '1st Year' ? 'beginner' : 
                         userData.year === '2nd Year' ? 'intermediate' : 'advanced'
            }));
          }
        } catch (error) {
          console.log('Context load error:', error);
        }
      }
    };
    loadUserContext();
  }, []);

  // Advanced conversation context builder
  const buildAdvancedContext = () => {
    const recentMessages = messages.slice(-10);
    const context = recentMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
    
    return context;
  };

  // Detect conversation intent and context
  const analyzeUserIntent = (message) => {
    const msg = message.toLowerCase();
    
    return {
      isQuestion: msg.includes('?') || msg.startsWith('what') || msg.startsWith('how') || msg.startsWith('why'),
      isGreeting: msg.includes('hello') || msg.includes('hi') || msg.includes('hey'),
      needsCode: msg.includes('code') || msg.includes('function') || msg.includes('syntax'),
      needsExplanation: msg.includes('explain') || msg.includes('understand') || msg.includes('learn'),
      isPersonal: msg.includes('you') || msg.includes('yourself') || msg.includes('who are'),
      emotion: msg.includes('frustrated') || msg.includes('confused') ? 'struggling' :
               msg.includes('excited') || msg.includes('love') ? 'positive' : 'neutral',
      topic: msg.includes('react') ? 'react' :
             msg.includes('javascript') ? 'javascript' :
             msg.includes('python') ? 'python' :
             msg.includes('career') ? 'career' :
             msg.includes('interview') ? 'interview' : 'general'
    };
  };

  // Advanced AI response with sophisticated prompting
  const getAdvancedAIResponse = async (userMessage) => {
    setIsTyping(true);
    setStreamingMessage('');
    const startTime = Date.now();
    
    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PASTE_YOUR_NEW_API_KEY_HERE') {
        throw new Error('API key not configured');
      }

      const context = buildAdvancedContext();
      const intent = analyzeUserIntent(userMessage);
      const userName = userProfile.name ? userProfile.name : '';
      
      // Advanced system prompt for more human-like responses
      const systemPrompt = `You are Claude, a highly intelligent and helpful AI assistant. You have a warm, engaging personality and excel at having natural conversations while providing accurate, detailed information.

CONVERSATION CONTEXT:
${context.map(msg => `${msg.role}: ${msg.content}`).join('\\n')}

USER PROFILE:
- Name: ${userName}
- Skill Level: ${userProfile.skillLevel}
- Previous topics discussed: ${conversationContext.join(', ')}

CURRENT MESSAGE ANALYSIS:
- Intent: ${intent.isQuestion ? 'Question' : intent.isGreeting ? 'Greeting' : 'Statement'}
- Topic: ${intent.topic}
- Emotion: ${intent.emotion}
- Needs code: ${intent.needsCode}

RESPONSE GUIDELINES:
1. Be conversational and natural - use "I", "you", contractions
2. Reference previous conversation when relevant
3. Match the user's energy and tone
4. Provide detailed, helpful responses
5. Ask follow-up questions to keep conversation flowing
6. Use examples and analogies when explaining concepts
7. Be encouraging and supportive
8. Show genuine interest in helping

USER MESSAGE: "${userMessage}"

Respond as Claude would - naturally, helpfully, and conversationally:`;

      const requestBody = {
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 50,
          topP: 0.95,
          maxOutputTokens: 1200,
          candidateCount: 1
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
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
        
        setIsTyping(false);
        await simulateAdvancedStreaming(aiText);
        
        // Update conversation context
        setConversationContext(prev => [...prev.slice(-5), intent.topic].filter(Boolean));
        
        const responseTime = Date.now() - startTime;
        trackChatbotUsed(userMessage, responseTime);
        
        return aiText;
      } else {
        throw new Error('Invalid response structure');
      }
      
    } catch (error) {
      console.error('AI Error:', error.message);
      setIsTyping(false);
      
      const fallback = getAdvancedFallback(userMessage);
      await simulateAdvancedStreaming(fallback);
      return fallback;
    }
  };

  // Advanced streaming with realistic typing speed
  const simulateAdvancedStreaming = async (text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    setStreamingMessage('');
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;
      
      const words = sentence.split(' ');
      
      for (let j = 0; j < words.length; j++) {
        await new Promise(resolve => setTimeout(resolve, 40 + Math.random() * 30));
        
        const currentText = sentences.slice(0, i).join('. ') + 
                           (i > 0 ? '. ' : '') + 
                           words.slice(0, j + 1).join(' ');
        
        setStreamingMessage(currentText + (j === words.length - 1 && i < sentences.length - 1 ? '.' : ''));
      }
      
      if (i < sentences.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    setStreamingMessage('');
  };

  // Advanced fallback with contextual responses
  const getAdvancedFallback = (userMessage) => {
    const msg = userMessage.toLowerCase();
    const intent = analyzeUserIntent(userMessage);
    const userName = userProfile.name ? `, ${userProfile.name}` : '';
    
    if (intent.isGreeting) {
      const greetings = [
        `Hello${userName}! It's wonderful to meet you. I'm Claude, and I'm genuinely excited to help you with whatever you're working on today. Whether it's coding challenges, learning new concepts, or just having an engaging conversation - I'm here for it all! What's sparking your curiosity right now?`,
        `Hey there${userName}! 😊 I'm Claude, your AI companion for this journey. I love diving deep into interesting topics and helping people solve problems creatively. What's on your mind today? I'm ready to explore whatever interests you!`,
        `Hi${userName}! Great to see you here. I'm Claude - think of me as your intellectual sparring partner and problem-solving buddy. I'm passionate about helping people learn and grow. What challenge or question can we tackle together today?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (intent.topic === 'react') {
      return `Ah, React! ${userName} I absolutely love discussing React - it's such an elegant way to build user interfaces. The component-based architecture and the way hooks have revolutionized state management is fascinating. 

What specifically about React has caught your attention? Are you:
- Just getting started and want to understand the fundamentals?
- Working on a specific component and running into challenges?
- Curious about advanced patterns like custom hooks or context?
- Trying to optimize performance or debug something tricky?

I'm here to help you not just solve the immediate problem, but really understand the underlying concepts. What's your React journey looking like?`;
    }

    if (intent.topic === 'career') {
      return `Career development${userName} - now that's a topic I'm passionate about! Your career journey is unique, and I love helping people navigate the exciting (and sometimes overwhelming) world of tech careers.

I'm curious about where you are in your journey:
- Are you just starting out and exploring different paths?
- Looking to level up your current skills or transition to new technologies?
- Preparing for interviews or job applications?
- Thinking about long-term career strategy and growth?

I believe in taking a holistic approach - it's not just about technical skills, but also about building confidence, networking effectively, and finding work that genuinely excites you. What aspect of your career development feels most important right now?`;
    }

    if (intent.emotion === 'struggling') {
      return `I can sense some frustration in your message${userName}, and I want you to know that's completely normal and actually a sign that you're pushing yourself to grow! Every developer, from beginners to seniors, faces moments of confusion and challenge.

Here's what I've learned about working through difficult concepts:
- Breaking problems down into smaller, manageable pieces often reveals the solution
- Sometimes stepping away for a few minutes and coming back with fresh eyes works wonders
- Explaining the problem out loud (even to a rubber duck!) can help clarify your thinking

I'm here to help you work through whatever's got you stuck. Can you tell me more about what you're wrestling with? Sometimes just talking through the problem with someone who's genuinely interested in helping can make all the difference.`;
    }

    // Default advanced response
    const defaults = [
      `That's a fascinating question${userName}! I love how curious and thoughtful you are. While I'm having some connectivity issues with my main knowledge base right now, I'm still here and eager to help you think through this together. Can you tell me more about what sparked this question? I find that understanding the context often leads to the most helpful discussions.`,
      `Interesting${userName}! You've touched on something I find genuinely engaging. Even though I'm running in a limited mode right now, I'm excited to explore this topic with you. What's your current understanding of this area? I'd love to build on what you already know and help fill in any gaps.`,
      `Great question${userName}! I can tell you're someone who thinks deeply about things, which I really appreciate. While I'm experiencing some technical limitations at the moment, I'm still here to brainstorm and problem-solve with you. What's the bigger picture you're working toward? Understanding your goals helps me provide the most relevant guidance.`
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

    const aiResponse = await getAdvancedAIResponse(currentInput);
    
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
      text: "Hello! I'm Claude, your AI assistant. I can help you with coding, explain complex concepts, provide career guidance, or discuss any topic you're curious about. What would you like to explore today?",
      sender: 'bot',
      timestamp: new Date()
    }]);
    setConversationContext([]);
  };

  const smartPrompts = [
    "I'm working on a React project and need some guidance",
    "Can you explain a complex programming concept to me?",
    "I'm feeling stuck with my coding - can you help?",
    "What's your take on the best way to learn programming?",
    "Help me think through a technical problem I'm facing",
    "I'd love to discuss career development strategies"
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          {isOpen ? (
            <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" />
            </svg>
          )}
        </button>
        
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse font-bold">
          AI
        </div>
      </div>

      {/* Advanced Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[450px] h-[650px] bg-white rounded-3xl shadow-2xl z-40 flex flex-col overflow-hidden border border-gray-200 backdrop-blur-sm">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-20"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Claude AI</h3>
                <p className="text-xs text-purple-100">Advanced conversational AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <button
                onClick={clearConversation}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="New conversation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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

          {/* Enhanced Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-800 shadow-md border border-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Enhanced Streaming Message */}
            {streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-4 rounded-2xl bg-white text-gray-800 shadow-md border border-gray-100">
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {streamingMessage}
                    <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse"></span>
                  </p>
                </div>
              </div>
            )}
            
            {/* Enhanced Typing Indicator */}
            {isTyping && !streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">Claude is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Smart Prompts */}
          {messages.length <= 1 && (
            <div className="p-5 border-t bg-gradient-to-r from-gray-50 to-white">
              <p className="text-xs text-gray-600 mb-3 font-semibold">Try these conversation starters:</p>
              <div className="grid grid-cols-1 gap-2">
                {smartPrompts.slice(0, 3).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(prompt)}
                    className="text-left text-xs bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-200 border border-blue-200 hover:border-purple-300 hover:shadow-md"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Input Area */}
          <div className="p-5 border-t bg-white">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message Claude..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none max-h-24 min-h-[48px]"
                  disabled={isTyping}
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
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


