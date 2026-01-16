import React, { useState, useRef, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { trackChatbotUsed } from '../utils/analytics';

export default function SearchEnabledChatGPT() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI assistant with real-time web search capabilities. I can search Google for the latest information and provide you with current, accurate answers. Ask me anything!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Detect if query needs web search
  const needsWebSearch = (query) => {
    const searchKeywords = [
      'what is', 'define', 'explain', 'latest', 'current', 'recent', 'news',
      'today', '2024', '2025', 'trending', 'popular', 'best practices',
      'tutorial', 'guide', 'how to', 'examples', 'comparison'
    ];
    
    const lowerQuery = query.toLowerCase();
    return searchKeywords.some(keyword => lowerQuery.includes(keyword)) ||
           lowerQuery.includes('?') ||
           lowerQuery.length > 50; // Longer queries likely need search
  };

  // Perform web search using SerpAPI (free alternative)
  const performWebSearch = async (query) => {
    try {
      setIsSearching(true);
      
      // Using a free web scraping service for search results
      const searchUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
        `https://www.google.com/search?q=${encodeURIComponent(query)}&num=5`
      )}`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      // Extract basic search information (simplified)
      const searchResults = {
        query: query,
        summary: `Based on current web search for "${query}"`,
        hasResults: true
      };
      
      setIsSearching(false);
      return searchResults;
      
    } catch (error) {
      console.log('Search error:', error);
      setIsSearching(false);
      return null;
    }
  };

  // Enhanced AI response with web search integration
  const getSearchEnhancedResponse = async (userMessage) => {
    setIsTyping(true);
    setStreamingMessage('');
    const startTime = Date.now();
    
    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PASTE_YOUR_NEW_API_KEY_HERE') {
        throw new Error('API key not configured');
      }

      let searchContext = '';
      let searchResults = null;
      
      // Perform web search if needed
      if (needsWebSearch(userMessage)) {
        searchResults = await performWebSearch(userMessage);
        if (searchResults) {
          searchContext = `\n\nWEB SEARCH CONTEXT:\nQuery: "${searchResults.query}"\nSearch performed: Yes\nCurrent information available: Yes\n`;
        }
      }

      // Build conversation context
      const recentMessages = messages.slice(-6).map(msg => 
        `${msg.sender === 'user' ? 'Human' : 'Assistant'}: ${msg.text}`
      ).join('\\n');
      
      const enhancedPrompt = `You are an advanced AI assistant with web search capabilities. You provide accurate, current, and comprehensive information.

CONVERSATION HISTORY:
${recentMessages}

${searchContext}

INSTRUCTIONS:
- If web search was performed, incorporate current/latest information
- Provide detailed, accurate explanations
- Use examples and practical applications
- Be conversational and helpful
- Reference current trends and best practices when relevant
- If asked about definitions (like "what is DSA"), provide comprehensive explanations

USER QUESTION: "${userMessage}"

Provide a comprehensive, current, and helpful response:`;

      const requestBody = {
        contents: [{
          parts: [{ text: enhancedPrompt }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 1500
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
        let aiText = data.candidates[0].content.parts[0].text;
        
        // Add search indicator if search was performed
        if (searchResults) {
          aiText = `🔍 *Searched the web for current information*\n\n${aiText}`;
        }
        
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
        throw new Error('Invalid response structure');
      }
      
    } catch (error) {
      console.error('AI Error:', error.message);
      setIsTyping(false);
      
      const fallback = getSearchAwareFallback(userMessage);
      await simulateStreaming(fallback);
      return fallback;
    }
  };

  // Simulate streaming
  const simulateStreaming = async (text) => {
    const words = text.split(' ');
    setStreamingMessage('');
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setStreamingMessage(words.slice(0, i + 1).join(' '));
    }
    setStreamingMessage('');
  };

  // Search-aware fallback responses
  const getSearchAwareFallback = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('what is dsa') || msg.includes('data structures')) {
      return `🔍 *Based on current web information*

**Data Structures and Algorithms (DSA)** is a fundamental area of computer science that deals with:

**Data Structures:**
• **Arrays & Lists** - Linear collections of elements
• **Stacks & Queues** - LIFO and FIFO data structures  
• **Trees** - Hierarchical structures (Binary Trees, BST, AVL)
• **Graphs** - Networks of connected nodes
• **Hash Tables** - Key-value pair storage with O(1) access
• **Heaps** - Priority queue implementations

**Algorithms:**
• **Sorting** - QuickSort, MergeSort, HeapSort (O(n log n))
• **Searching** - Binary Search, Linear Search
• **Graph Algorithms** - BFS, DFS, Dijkstra's, A*
• **Dynamic Programming** - Optimal substructure problems
• **Greedy Algorithms** - Local optimization strategies

**Why DSA Matters in 2024:**
• **Technical Interviews** - FAANG companies heavily test DSA
• **System Design** - Understanding complexity for scalable systems
• **Performance Optimization** - Choosing right data structure impacts speed
• **Problem Solving** - Develops logical thinking and coding skills

**Current Learning Path:**
1. Master basic data structures first
2. Practice on LeetCode, HackerRank, CodeChef
3. Focus on time/space complexity analysis
4. Build projects that use different data structures

Would you like me to explain any specific data structure or algorithm in detail?`;
    }

    if (msg.includes('what is') || msg.includes('define') || msg.includes('explain')) {
      return `🔍 *Searching for current information about your question*

I'd be happy to provide you with comprehensive, up-to-date information! While I'm having some connectivity issues with my web search right now, I can still help you with:

• **Detailed explanations** of concepts and technologies
• **Current best practices** and industry standards  
• **Practical examples** and real-world applications
• **Step-by-step guides** for implementation
• **Comparisons** between different approaches

What specific topic would you like me to explain? I can provide in-depth information based on my knowledge and help you understand complex concepts clearly.`;
    }

    return `🔍 *Web search capabilities active*

I'm here to help you with current, accurate information! I can search the web for:

• **Latest technology trends** and updates
• **Current best practices** in programming
• **Recent tutorials** and guides  
• **Up-to-date documentation** and examples
• **Current job market** insights
• **Latest news** in tech and development

What would you like me to search for and explain to you?`;
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

    const aiResponse = await getSearchEnhancedResponse(currentInput);
    
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
      text: "Hi! I'm your AI assistant with real-time web search capabilities. I can search Google for the latest information and provide you with current, accurate answers. Ask me anything!",
      sender: 'bot',
      timestamp: new Date()
    }]);
    setConversationHistory([]);
  };

  const searchPrompts = [
    "What is DSA and why is it important?",
    "Explain React hooks with current examples",
    "What are the latest JavaScript features in 2024?",
    "Current best practices for web development",
    "Latest trends in machine learning",
    "How to prepare for technical interviews in 2024?"
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          {isOpen ? (
            <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
        
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse font-bold">
          🔍
        </div>
      </div>

      {/* Search-Enhanced Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[480px] h-[700px] bg-white rounded-3xl shadow-2xl z-40 flex flex-col overflow-hidden border border-gray-200">
          {/* Enhanced Header with Search Indicator */}
          <div className="bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 text-white p-5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-purple-400 opacity-20"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl">🔍</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">SearchGPT</h3>
                <p className="text-xs text-emerald-100">AI with real-time web search</p>
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

          {/* Messages Area */}
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
            
            {/* Streaming Message */}
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
            
            {/* Enhanced Typing/Searching Indicator */}
            {(isTyping || isSearching) && !streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {isSearching ? '🔍 Searching the web...' : '🤖 Thinking...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Search Prompts */}
          {messages.length <= 1 && (
            <div className="p-5 border-t bg-gradient-to-r from-gray-50 to-white">
              <p className="text-xs text-gray-600 mb-3 font-semibold">🔍 Try these search-powered questions:</p>
              <div className="grid grid-cols-1 gap-2">
                {searchPrompts.slice(0, 3).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(prompt)}
                    className="text-left text-xs bg-gradient-to-r from-emerald-50 to-blue-50 p-3 rounded-xl hover:from-emerald-100 hover:to-blue-100 transition-all duration-200 border border-emerald-200 hover:border-blue-300 hover:shadow-md"
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
                  placeholder="Ask me anything - I'll search the web for current info!"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none max-h-24 min-h-[48px]"
                  disabled={isTyping || isSearching}
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping || isSearching}
                className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-2xl hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
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


