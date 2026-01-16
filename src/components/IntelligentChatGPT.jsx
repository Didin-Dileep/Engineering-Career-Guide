import React, { useState, useRef, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { trackChatbotUsed } from '../utils/analytics';

export default function IntelligentChatGPT() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your intelligent AI assistant. I provide specific, actionable advice on programming, career guidance, and technical topics. Ask me anything and I'll give you detailed, practical suggestions!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Intelligent AI response with comprehensive knowledge
  const getIntelligentResponse = async (userMessage) => {
    setIsTyping(true);
    setStreamingMessage('');
    const startTime = Date.now();
    
    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PASTE_YOUR_NEW_API_KEY_HERE') {
        throw new Error('API key not configured');
      }

      // Build conversation context
      const recentMessages = messages.slice(-6).map(msg => 
        `${msg.sender === 'user' ? 'Human' : 'Assistant'}: ${msg.text}`
      ).join('\n');
      
      const expertPrompt = `You are an expert AI assistant with comprehensive knowledge. Provide detailed, specific, and actionable responses.

CONVERSATION HISTORY:
${recentMessages}

INSTRUCTIONS:
- Give specific, practical advice with actionable steps
- Include current trends, best practices, and real-world examples
- Provide links, resources, and concrete recommendations
- Be comprehensive yet easy to understand
- Focus on helping the user make informed decisions
- Use bullet points and clear structure for readability

USER QUESTION: "${userMessage}"

Provide a detailed, expert-level response with specific recommendations and actionable advice:`;

      const requestBody = {
        contents: [{
          parts: [{ text: expertPrompt }]
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
      
      const fallback = getExpertFallback(userMessage);
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

  // Expert fallback responses with specific advice
  const getExpertFallback = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    // Language choice for DSA
    if (msg.includes('python or c++') || msg.includes('which language') || (msg.includes('language') && msg.includes('dsa'))) {
      return `**🎯 For BTech 3rd Year: Python vs C++ for DSA**

**🐍 PYTHON - RECOMMENDED CHOICE:**

**Why Python First:**
• **Faster Learning** - Focus on logic, not syntax
• **Interview Friendly** - 90% companies allow Python
• **Built-in Data Structures** - Lists, dicts, sets ready to use
• **Readable Code** - Easier to debug and understand
• **Rapid Development** - Code 3x faster than C++

**⚡ C++ Advantages:**
• **Performance** - 10-50x faster execution
• **Memory Control** - Better understanding of pointers
• **Competitive Programming** - Standard for contests
• **Industry Preference** - Some companies prefer C++

**🎯 MY RECOMMENDATION:**
**Start with Python** → Master concepts → **Switch to C++** if needed

**📅 Learning Timeline:**
• **Month 1-2:** Python + Basic DSA (Arrays, Strings)
• **Month 3-4:** Advanced DSA in Python (Trees, Graphs)
• **Month 5+:** C++ for competitive programming (optional)

**🔥 Why This Works:**
1. **Concept Clarity** - Python helps you understand algorithms faster
2. **Interview Success** - Most companies accept Python solutions
3. **Time Efficiency** - Learn DSA concepts in half the time

**📚 Resources:**
• **Python DSA:** GeeksforGeeks Python section
• **Practice:** LeetCode (Python solutions)
• **Books:** "Python Algorithms" by Magnus Lie Hetland

**Bottom Line:** Python gets you job-ready faster. C++ is for optimization later.

Want a specific Python DSA learning roadmap?`;
    }

    // LeetCode and coding platforms
    if (msg.includes('leetcode') || msg.includes('coding platform') || msg.includes('practice') || msg.includes('site')) {
      return `**🚀 Complete Coding Practice Platform Guide**

**🏆 TOP PLATFORMS RANKED:**

**1. LeetCode** - https://leetcode.com/
• **Best For:** Interview preparation (FAANG focus)
• **Problems:** 2500+ with company tags
• **Features:** Mock interviews, discuss section
• **Cost:** Free (Premium $35/month)
• **Must-Do:** Top 100 Liked Questions

**2. GeeksforGeeks** - https://geeksforgeeks.org/
• **Best For:** Concept learning + practice
• **Strength:** Detailed explanations with code
• **Free:** All content available
• **Perfect For:** Understanding theory first

**3. HackerRank** - https://hackerrank.com/
• **Best For:** Beginners, skill assessment
• **Features:** Certificates, company challenges
• **Good For:** Building confidence initially

**4. CodeChef** - https://codechef.com/
• **Best For:** Competitive programming
• **Contests:** Monthly long/short contests
• **Community:** Strong Indian developer base

**5. Codeforces** - https://codeforces.com/
• **Best For:** Advanced competitive programming
• **Rating System:** Track your progress
• **Difficulty:** Higher than other platforms

**🎯 RECOMMENDED STRATEGY:**

**Phase 1 (Month 1-2): Foundation**
• **GeeksforGeeks:** Learn concepts
• **LeetCode Easy:** 50 problems
• **Focus:** Arrays, Strings, Basic Math

**Phase 2 (Month 3-4): Building Skills**
• **LeetCode Medium:** 100 problems
• **HackerRank:** Data structures track
• **Focus:** Trees, Graphs, DP basics

**Phase 3 (Month 5-6): Interview Ready**
• **LeetCode:** Company-specific problems
• **Mock Interviews:** Pramp, InterviewBit
• **Target:** 300+ total problems solved

**📱 Mobile Apps:**
• **LeetCode Mobile** - Practice anywhere
• **GeeksforGeeks App** - Quick concept review

**💡 PRO TIPS:**
• **Start with Easy** - Build confidence first
• **Time Yourself** - Practice under pressure
• **Review Solutions** - Learn multiple approaches
• **Join Communities** - LeetCode discuss, Reddit

**🎯 For Placements:** Focus 80% on LeetCode, 20% on GeeksforGeeks

Ready to start? Which platform should we begin with?`;
    }

    // DSA learning path
    if (msg.includes('dsa') || msg.includes('data structures') || msg.includes('algorithms')) {
      return `**🎯 Complete DSA Mastery Roadmap (BTech 3rd Year)**

**📅 6-MONTH STRATEGIC PLAN:**

**MONTH 1-2: FOUNDATIONS** 🏗️
**Week 1-2: Arrays & Strings**
• Basic operations, two pointers, sliding window
• **Practice:** 30 LeetCode easy problems
• **Key Topics:** Sorting, searching, string manipulation

**Week 3-4: Mathematics & Bit Manipulation**
• GCD, LCM, prime numbers, bit operations
• **Practice:** 20 problems on number theory
• **Applications:** Optimization tricks, fast calculations

**MONTH 3-4: CORE STRUCTURES** 🌳
**Week 5-6: Linked Lists & Stacks/Queues**
• Single/double linked lists, stack applications
• **Practice:** 40 medium problems
• **Focus:** Pointer manipulation, LIFO/FIFO concepts

**Week 7-8: Trees & Binary Search Trees**
• Binary trees, BST operations, tree traversals
• **Practice:** 50 tree problems
• **Master:** DFS, BFS, tree construction

**MONTH 5-6: ADVANCED TOPICS** 🚀
**Week 9-10: Graphs & Advanced Trees**
• Graph representations, BFS/DFS, shortest paths
• **Practice:** 40 graph problems
• **Include:** Dijkstra, Union-Find, Topological sort

**Week 11-12: Dynamic Programming & Greedy**
• DP patterns, memoization, greedy strategies
• **Practice:** 60 DP problems
• **Master:** Knapsack, LIS, matrix DP

**📊 PROBLEM DISTRIBUTION:**
• **Easy:** 100 problems (confidence building)
• **Medium:** 150 problems (interview level)
• **Hard:** 50 problems (competitive edge)
• **Total:** 300+ problems

**🎯 DAILY SCHEDULE:**
• **Morning (1 hour):** Learn new concept
• **Evening (1.5 hours):** Solve 2-3 problems
• **Weekend:** Review and practice contests

**📚 BEST RESOURCES:**

**Learning:**
• **YouTube:** Striver's A2Z DSA Course
• **Books:** "Introduction to Algorithms" (CLRS)
• **Website:** GeeksforGeeks for concepts

**Practice:**
• **Primary:** LeetCode (interview focus)
• **Secondary:** GeeksforGeeks (concept reinforcement)
• **Contests:** CodeChef, Codeforces (weekends)

**🏆 MILESTONE TRACKING:**
• **Month 2:** Solve 50 easy problems
• **Month 4:** Solve 100 medium problems
• **Month 6:** Complete 300+ total problems

**💼 WHY THIS MATTERS:**
• **Placements:** 95% companies test DSA
• **Salary Impact:** Good DSA = 2-3x higher packages
• **Problem Solving:** Develops logical thinking
• **Confidence:** Handle any coding challenge

**🎯 SUCCESS METRICS:**
• Solve any medium problem in 30 minutes
• Explain time/space complexity clearly
• Code without syntax errors
• Handle edge cases automatically

Ready to start? Which topic should we tackle first - Arrays or want a specific daily plan?`;
    }

    // Career and placement guidance
    if (msg.includes('placement') || msg.includes('job') || msg.includes('career') || msg.includes('interview')) {
      return `**🚀 Complete BTech Placement Strategy (2024-25)**

**📊 CURRENT MARKET REALITY:**

**Package Ranges (Freshers):**
• **Service Companies:** 3-7 LPA (TCS, Infosys, Wipro)
• **Product Companies:** 8-15 LPA (Flipkart, Paytm, Zomato)
• **FAANG/Tier-1:** 15-45 LPA (Google, Microsoft, Amazon)
• **Startups:** 6-20 LPA (varies widely)

**🎯 6-MONTH PLACEMENT ROADMAP:**

**PHASE 1 (Month 1-2): FOUNDATION**
**Technical Skills (70% time):**
• **DSA:** 100 LeetCode problems (Easy→Medium)
• **Development:** Choose one stack (MERN/Django/Spring)
• **CS Fundamentals:** OS, DBMS, Networks basics

**Soft Skills (30% time):**
• **Communication:** Practice explaining technical concepts
• **Resume Building:** 2-3 strong projects
• **Aptitude:** Quantitative, logical reasoning

**PHASE 2 (Month 3-4): SKILL BUILDING**
**Advanced Technical:**
• **DSA:** 200+ problems, focus on medium difficulty
• **Projects:** 2 full-stack applications with deployment
• **System Design:** Basics (for senior developer roles)

**Interview Preparation:**
• **Mock Interviews:** Practice with peers/online platforms
• **Behavioral Questions:** STAR method preparation
• **Company Research:** Target company preparation

**PHASE 3 (Month 5-6): INTERVIEW SEASON**
**Final Preparation:**
• **DSA:** 300+ problems, quick revision
• **Projects:** Polish and prepare detailed explanations
• **Mock Interviews:** Daily practice sessions

**Application Strategy:**
• **Mass Applications:** Apply to 50+ companies
• **Targeted Applications:** 10-15 dream companies
• **Backup Plans:** Multiple offer strategies

**🏢 COMPANY-WISE STRATEGY:**

**FAANG/Product Companies:**
**Requirements:**
• 400+ DSA problems solved
• Strong system design knowledge
• 2-3 impressive projects with scale
• Open source contributions (bonus)

**Preparation Timeline:** 8-12 months
**Success Rate:** 5-10% (high competition)
**Package:** 15-45 LPA

**Service Companies (Mass Recruiters):**
**Requirements:**
• 150+ DSA problems
• Basic development skills
• Good communication
• Strong aptitude scores

**Preparation Timeline:** 4-6 months
**Success Rate:** 60-80%
**Package:** 3-7 LPA

**Mid-Tier Product Companies:**
**Requirements:**
• 250+ DSA problems
• 2-3 solid projects
• Good problem-solving skills
• Domain knowledge (optional)

**Preparation Timeline:** 6-8 months
**Success Rate:** 20-30%
**Package:** 8-15 LPA

**📚 ESSENTIAL RESOURCES:**

**DSA Practice:**
• **Primary:** LeetCode (interview focus)
• **Theory:** GeeksforGeeks
• **Books:** Cracking the Coding Interview

**Development:**
• **Web Dev:** FreeCodeCamp, The Odin Project
• **Backend:** Official documentation
• **Projects:** Build real-world applications

**Interview Prep:**
• **Mock Interviews:** Pramp, InterviewBit
• **Behavioral:** Glassdoor company reviews
• **Aptitude:** IndiaBix, PrepInsta

**🎯 SUCCESS METRICS:**

**Technical Readiness:**
• Solve medium DSA problems in 25-30 minutes
• Explain projects confidently for 15+ minutes
• Code without major syntax errors
• Handle system design basics

**Soft Skills Readiness:**
• Clear communication in English
• Confident body language
• Good problem-solving approach
• Team collaboration examples

**📈 MONTHLY TARGETS:**
• **Month 1:** 50 DSA problems + 1 project
• **Month 2:** 100 DSA problems + 1 project
• **Month 3:** 150 DSA problems + resume ready
• **Month 4:** 200 DSA problems + mock interviews
• **Month 5:** 250+ problems + applications
• **Month 6:** Interview season + offers

**💡 PRO TIPS:**
• **Start Early:** Don't wait for placement season
• **Consistency:** Daily practice beats weekend marathons
• **Network:** Connect with seniors and alumni
• **Multiple Offers:** Never rely on single company
• **Backup Plans:** Keep options open

**🎯 IMMEDIATE ACTION PLAN:**
1. **Today:** Start with 2 easy DSA problems
2. **This Week:** Choose your tech stack
3. **This Month:** Complete 20 problems + start project
4. **Next Month:** Increase to 50 problems + finish project

Which area needs immediate focus - DSA, projects, or interview skills? I can create a detailed weekly plan for you!`;
    }

    // Default intelligent response
    return `I'm here to provide you with specific, actionable advice! Based on your question, I can help you with:

**🎯 Technical Guidance:**
• Programming language recommendations with reasons
• Detailed learning roadmaps with timelines
• Best resources and platforms for practice
• Project ideas and implementation strategies

**💼 Career Planning:**
• Placement preparation strategies
• Company-specific interview tips
• Skill development priorities
• Market trends and salary insights

**📚 Learning Support:**
• Concept explanations with examples
• Problem-solving approaches
• Study schedules and milestones
• Resource recommendations

**🔥 What I Provide:**
• **Specific recommendations** (not generic advice)
• **Actionable steps** you can start today
• **Current market insights** and trends
• **Detailed explanations** with examples
• **Resource links** and platform suggestions

Could you be more specific about what you'd like to know? For example:
- "Python or C++ for DSA learning?"
- "Best coding practice platforms for placements"
- "Complete roadmap for software developer role"
- "How to prepare for technical interviews"

I'll give you detailed, practical advice that you can implement immediately!`;
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

    const aiResponse = await getIntelligentResponse(currentInput);
    
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
      text: "Hi! I'm your intelligent AI assistant. I provide specific, actionable advice on programming, career guidance, and technical topics. Ask me anything and I'll give you detailed, practical suggestions!",
      sender: 'bot',
      timestamp: new Date()
    }]);
    setConversationHistory([]);
  };

  const smartPrompts = [
    "Python or C++ for DSA? I'm BTech 3rd year",
    "Best coding practice websites like LeetCode",
    "Complete placement preparation strategy",
    "How to master data structures quickly?",
    "Which programming language should I learn first?",
    "Best resources for competitive programming"
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          {isOpen ? (
            <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )}
        </button>
        
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse font-bold">
          💡
        </div>
      </div>

      {/* Intelligent Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[480px] h-[700px] bg-white rounded-3xl shadow-2xl z-40 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-20"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">IntelliGPT</h3>
                <p className="text-xs text-purple-100">Smart AI with expert advice</p>
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
            
            {/* Typing Indicator */}
            {isTyping && !streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">💡 Thinking of the best advice...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Smart Prompts */}
          {messages.length <= 1 && (
            <div className="p-5 border-t bg-gradient-to-r from-gray-50 to-white">
              <p className="text-xs text-gray-600 mb-3 font-semibold">💡 Ask me for specific advice:</p>
              <div className="grid grid-cols-1 gap-2">
                {smartPrompts.slice(0, 3).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(prompt)}
                    className="text-left text-xs bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-xl hover:from-purple-100 hover:to-blue-100 transition-all duration-200 border border-purple-200 hover:border-blue-300 hover:shadow-md"
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
                  placeholder="Ask for specific advice - I'll give detailed suggestions!"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none max-h-24 min-h-[48px]"
                  disabled={isTyping}
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
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


