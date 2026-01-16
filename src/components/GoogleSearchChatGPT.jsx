import React, { useState, useRef, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { trackChatbotUsed } from '../utils/analytics';

export default function GoogleSearchChatGPT() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I can search Google and get you real-time information on any topic. Just ask me anything and I'll fetch the latest content from the web! 🔍",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Real Google search function
  const searchGoogle = async (query) => {
    try {
      setIsSearching(true);
      
      // Using SerpAPI for real Google search results
      const SERPAPI_KEY = 'demo'; // You can get free API key from serpapi.com
      
      const response = await fetch(`https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=5`);
      
      if (!response.ok) {
        // Fallback to web scraping method
        return await fallbackSearch(query);
      }
      
      const data = await response.json();
      
      const searchResults = {
        query: query,
        results: data.organic_results || [],
        answer_box: data.answer_box,
        knowledge_graph: data.knowledge_graph
      };
      
      setIsSearching(false);
      return searchResults;
      
    } catch (error) {
      console.log('Search error:', error);
      setIsSearching(false);
      return await fallbackSearch(query);
    }
  };

  // Fallback search using web scraping
  const fallbackSearch = async (query) => {
    try {
      // Using a CORS proxy to search Google
      const proxyUrl = 'https://api.allorigins.win/get?url=';
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=5`;
      
      const response = await fetch(proxyUrl + encodeURIComponent(googleUrl));
      const data = await response.json();
      
      // Extract basic information from HTML (simplified)
      const htmlContent = data.contents;
      
      // Simple extraction of search snippets
      const snippets = [];
      const snippetRegex = /<span class="st">(.*?)<\/span>/g;
      let match;
      
      while ((match = snippetRegex.exec(htmlContent)) !== null && snippets.length < 3) {
        snippets.push(match[1].replace(/<[^>]*>/g, ''));
      }
      
      return {
        query: query,
        results: snippets.map((snippet, index) => ({
          title: `Result ${index + 1}`,
          snippet: snippet
        })),
        hasResults: snippets.length > 0
      };
      
    } catch (error) {
      console.log('Fallback search error:', error);
      return {
        query: query,
        results: [],
        hasResults: false,
        error: 'Search temporarily unavailable'
      };
    }
  };

  // AI response with Google search integration
  const getSearchResponse = async (userMessage) => {
    setIsTyping(true);
    setStreamingMessage('');
    const startTime = Date.now();
    
    try {
      // First, search Google for the query
      const searchResults = await searchGoogle(userMessage);
      
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PASTE_YOUR_NEW_API_KEY_HERE') {
        throw new Error('API key not configured');
      }

      // Build search context for AI
      let searchContext = '';
      if (searchResults.hasResults !== false) {
        searchContext = `
GOOGLE SEARCH RESULTS for "${searchResults.query}":

${searchResults.answer_box ? `Direct Answer: ${JSON.stringify(searchResults.answer_box)}` : ''}

${searchResults.knowledge_graph ? `Knowledge Graph: ${JSON.stringify(searchResults.knowledge_graph)}` : ''}

Search Results:
${searchResults.results.map((result, index) => 
  `${index + 1}. ${result.title || 'Result'}: ${result.snippet || result}`
).join('\n')}
`;
      }
      
      const searchPrompt = `You are an AI assistant with access to real-time Google search results. Use the search results to provide accurate, current information.

${searchContext}

User Question: "${userMessage}"

Instructions:
- Use the Google search results above to answer the user's question
- Provide accurate, up-to-date information based on the search results
- If search results are available, reference them in your response
- Be conversational and helpful
- Include specific details from the search results
- If no search results, provide general knowledge response

Provide a comprehensive response based on the search results:`;

      const requestBody = {
        contents: [{
          parts: [{ text: searchPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 1200
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
        
        // Add search indicator
        if (searchResults.hasResults !== false) {
          aiText = `🔍 *Based on current Google search results*\n\n${aiText}`;
        }
        
        setIsTyping(false);
        await simulateStreaming(aiText);
        
        const responseTime = Date.now() - startTime;
        trackChatbotUsed(userMessage, responseTime);
        
        return aiText;
      } else {
        throw new Error('Invalid response structure');
      }
      
    } catch (error) {
      console.error('Search Response Error:', error.message);
      setIsTyping(false);
      
      const fallback = getSearchFallback(userMessage);
      await simulateStreaming(fallback);
      return fallback;
    }
  };

  // Simulate streaming
  const simulateStreaming = async (text) => {
    const words = text.split(' ');
    setStreamingMessage('');
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 60));
      setStreamingMessage(words.slice(0, i + 1).join(' '));
    }
    setStreamingMessage('');
  };

  // Search-aware fallback
  const getSearchFallback = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('what is') || msg.includes('define') || msg.includes('explain')) {
      return `🔍 *Searching Google for: "${userMessage}"*

I'm having trouble accessing Google search right now, but I can still help you with comprehensive information based on my knowledge!

For questions like "${userMessage}", I typically search for:
• Latest definitions and explanations
• Current examples and use cases  
• Recent developments and trends
• Expert opinions and best practices

What specific aspect would you like me to focus on? I can provide detailed information even without live search results!`;
    }

    if (msg.includes('latest') || msg.includes('current') || msg.includes('recent') || msg.includes('2024') || msg.includes('2025')) {
      return `🔍 *Attempting to search Google for current information*

I'm designed to fetch the latest information from Google for queries like yours. While I'm having connectivity issues with live search right now, I can still provide you with:

• **Current trends** and developments I'm aware of
• **Recent updates** in the field you're asking about
• **Best practices** as of recent knowledge
• **Reliable sources** where you can find the latest information

Could you be more specific about what current information you're looking for? I'll do my best to help with what I know!`;
    }

    return `🔍 *Google Search Integration Active*

I'm designed to search Google and bring you real-time information on any topic! I can help you find:

• **Current news** and updates
• **Latest information** on any subject
• **Recent developments** in technology, science, etc.
• **Up-to-date facts** and statistics
• **Current trends** and best practices

What would you like me to search Google for? Just ask me anything like:
- "What's the latest news about AI?"
- "Current JavaScript frameworks 2024"
- "Recent developments in machine learning"
- "Latest programming trends"

I'll fetch the most current information from Google for you!`;
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

    const aiResponse = await getSearchResponse(currentInput);
    
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
      text: "Hi! I can search Google and get you real-time information on any topic. Just ask me anything and I'll fetch the latest content from the web! 🔍",
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  const searchPrompts = [
    "What is artificial intelligence?",
    "Latest JavaScript frameworks 2024",
    "Current trends in web development",
    "What is machine learning?",
    "Recent news about technology",
    "Best programming languages to learn"
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
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
        
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-400 to-orange-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse font-bold">
          🔍
        </div>
      </div>

      {/* Google Search Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[520px] h-[750px] bg-white rounded-3xl shadow-2xl z-40 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white p-5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-purple-400 opacity-20"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl">🔍</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Google Search AI</h3>
                <p className="text-xs text-green-100">Real-time web search results</p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <button
                onClick={clearConversation}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="New search session"
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
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-green-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-800 shadow-md border border-green-100'
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
                <div className="max-w-[85%] p-4 rounded-2xl bg-white text-gray-800 shadow-md border border-green-100">
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {streamingMessage}
                    <span className="inline-block w-2 h-5 bg-green-500 ml-1 animate-pulse rounded"></span>
                  </p>
                </div>
              </div>
            )}
            
            {/* Search/Typing Indicator */}
            {(isTyping || isSearching) && !streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-md border border-green-100">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {isSearching ? '🔍 Searching Google...' : '🤖 Processing results...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Search Prompts */}
          {messages.length <= 1 && (
            <div className="p-5 border-t bg-gradient-to-r from-green-50 to-blue-50">
              <p className="text-xs text-gray-600 mb-3 font-semibold">🔍 Try searching for:</p>
              <div className="grid grid-cols-1 gap-2">
                {searchPrompts.slice(0, 3).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(prompt)}
                    className="text-left text-xs bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-xl hover:from-green-100 hover:to-blue-100 transition-all duration-200 border border-green-200 hover:border-blue-300 hover:shadow-md"
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
                  placeholder="Ask me anything - I'll search Google for you!"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none max-h-24 min-h-[48px]"
                  disabled={isTyping || isSearching}
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping || isSearching}
                className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


