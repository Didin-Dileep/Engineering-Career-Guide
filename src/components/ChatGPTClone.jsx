import React, { useState, useRef, useEffect } from 'react';
import { findBestMatch } from '../data/chatbotDataset';
import { retrieveRelevantKnowledge } from '../data/roadmapKnowledge';
import { callGeminiAPI } from '../utils/geminiAPI';

export default function ChatGPTClone() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey there! I'm so glad you're here. 😊\n\nThink of me as your senior who's been through all the confusion, late-night coding sessions, and career anxiety you might be feeling. I'm here to help - whether you're stuck on a technical concept, worried about your future, or just need someone to talk to.\n\nWhat's on your mind today? Don't worry about asking 'silly' questions - there's no such thing. We all start somewhere!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentMode, setCurrentMode] = useState('CHAT');
  const [manualMode, setManualMode] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const profile = localStorage.getItem('studentProfile');
    if (profile) {
      setStudentProfile(JSON.parse(profile));
    } else {
      setShowProfileSetup(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveProfile = (profile) => {
    localStorage.setItem('studentProfile', JSON.stringify(profile));
    setStudentProfile(profile);
    setShowProfileSetup(false);
  };

  const detectResponseMode = (userMessage) => {
    const msg = userMessage.toLowerCase();
    const mentorKeywords = ['stress', 'anxious', 'worried', 'scared', 'confused', 'lost', 'behind', 'give up', 'quit', 'overwhelm', 'pressure', 'imposter', 'career', 'future', 'job', 'interview', 'should i', 'help me decide', 'motivation'];
    const teacherKeywords = ['what is', 'how to', 'explain', 'teach me', 'learn', 'understand', 'difference between', 'why', 'when to use', 'example', 'tutorial', 'algorithm', 'data structure', 'roadmap', 'study plan', 'prepare'];
    
    if (mentorKeywords.some(kw => msg.includes(kw))) return 'MENTOR';
    if (teacherKeywords.some(kw => msg.includes(kw))) return 'TEACHER';
    return 'CHAT';
  };

  const getModePrompt = (mode) => {
    if (mode === 'MENTOR') {
      return `You are a caring MENTOR. When student expresses stress/fear/confusion: 1) Acknowledge emotion 2) Normalize feeling 3) Give reassurance 4) Provide guidance. Be warm, empathetic, supportive. Answer ANY question they ask.`;
    } else if (mode === 'TEACHER') {
      return `You are a patient TEACHER. Break topics into simple steps, use analogies, start from basics, make learning achievable. Answer ANY question clearly.`;
    } else {
      return `You are a helpful ASSISTANT. Answer ANY question clearly and accurately. Be friendly, informative, and helpful.`;
    }
  };

  const getStudentContext = () => {
    if (!studentProfile) return '';
    return `\n\nStudent: ${studentProfile.name}, ${studentProfile.branch}, ${studentProfile.year}. Completed: ${studentProfile.completedTopics || 'Just starting'}. Focus: ${studentProfile.currentFocus || 'Exploring'}.`;
  };

  const generateMentorResponse = (userMessage, profile) => {
    const msg = userMessage.toLowerCase();
    const name = profile?.name ? `, ${profile.name}` : '';
    
    // Study plans and roadmaps
    if (msg.includes('study plan') || msg.includes('roadmap')) {
      if (msg.includes('c') && msg.includes('1 day')) {
        return `Perfect${name}! Here's your 1-day C programming crash course! 📚\n\n**Morning (9 AM - 12 PM): Basics**\n• Syntax, variables, data types\n• Input/output (printf, scanf)\n• Operators & expressions\n• Practice: 5 simple programs\n\n**Afternoon (1 PM - 4 PM): Control Flow**\n• If-else, switch\n• Loops (for, while, do-while)\n• Break & continue\n• Practice: 5 pattern programs\n\n**Evening (5 PM - 8 PM): Functions & Arrays**\n• Function basics\n• Arrays & strings\n• Pointers introduction\n• Practice: 3 mini projects\n\n💡 Tips:\n• Code along, don't just read\n• Use online compiler\n• Focus on understanding, not memorizing\n\nReady to start? 🚀`;
      }
      if (msg.includes('oop') && msg.includes('3 day')) {
        return `Awesome${name}! Here's your 3-day OOP mastery plan! 🎯\n\n**Day 1: Foundations**\n• Classes & Objects\n• Constructors & Destructors\n• Access modifiers\n• Practice: Create 3 classes\n\n**Day 2: Core Concepts**\n• Inheritance\n• Polymorphism\n• Encapsulation\n• Practice: Build class hierarchy\n\n**Day 3: Advanced**\n• Abstraction\n• Interfaces\n• Real project\n• Practice: Complete mini-app\n\n💡 Each day: 4-5 hours study + practice\n\nWhich language? Java, Python, C++? 🚀`;
      }
      return `I love that you're planning ahead${name}! 😊\n\nTo create the perfect study plan, tell me:\n• What topic? (DSA, OOP, Web Dev, etc.)\n• How many days?\n• Your current level?\n\nI'll create a customized roadmap just for you! 🚀`;
    }
    
    if (msg.includes('dsa') || msg.includes('data structure')) {
      return `Hey${name}! Let me explain DSA in a way that makes sense. 😊\n\nDSA stands for Data Structures and Algorithms. Think of it like this:\n\n📦 Data Structures = Ways to organize information\n- Arrays: Like a numbered list\n- Trees: Like a family tree\n- Graphs: Like a map of connected cities\n\n⚙️ Algorithms = Step-by-step recipes to solve problems\n- Sorting: Arranging things in order\n- Searching: Finding specific items\n\nWhy does this matter? Every app you use - Instagram, Google, Netflix - uses DSA to work fast!\n\nAre you just starting with DSA, or working on something specific? I'm here to help break it down! 🚀`;
    }
    
    if (msg.includes('os') || msg.includes('operating system')) {
      return `Great question${name}! Let me explain Operating Systems simply. 😊\n\nThink of an OS as the manager of your computer. It's like a conductor making sure everything works together.\n\n🖥️ What it does:\n1. Manages memory (RAM)\n2. Runs your programs\n3. Controls hardware\n4. Handles files\n5. Provides security\n\n💻 Examples: Windows, macOS, Linux, Android, iOS\n\nWhy learn this? Understanding OS helps you write better code!\n\nAre you studying this for a course? 🤔`;
    }
    
    if (msg.includes('oop') || msg.includes('object oriented')) {
      return `Ah, OOP! 😊 Let me break this down${name}.\n\nOOP (Object-Oriented Programming) is writing code like real-world things.\n\n🎯 Key concepts:\n1. Classes = Blueprints\n2. Objects = Actual things\n3. Inheritance = Reusing code\n4. Encapsulation = Hiding details\n\n💡 Example: A "Student" class has properties (name, age) and actions (study, takeExam).\n\nWhy use OOP? Makes code organized and reusable!\n\nWhich language are you learning? Java, Python, C++? 🚀`;
    }
    
    if (msg.includes('network') || msg.includes('cn')) {
      return `Computer Networks! 🌐 Let me explain simply${name}.\n\nIt's how computers talk to each other!\n\n📡 Key concepts:\n1. Internet = Global network\n2. Protocols = Communication rules (HTTP, TCP/IP)\n3. IP Address = Computer's address\n4. Router = Traffic controller\n\n💻 When you open Instagram:\n1. Phone sends request\n2. Router forwards it\n3. Server responds\n4. Data comes back\n\nAll in milliseconds!\n\nStudying for exams? 🚀`;
    }
    
    return `I'm here to help you${name}! 😊\n\nI can see you're asking about "${userMessage}". Let me help you understand this better.\n\nCould you tell me:\n• Are you just starting?\n• Stuck on something specific?\n• Preparing for exams?\n\nThe more I know, the better I can guide you! 💪\n\n(Note: AI is temporarily unavailable. Get a new API key from https://aistudio.google.com/app/apikey to enable full AI responses)`;
  };

  const getAIResponse = async (userMessage) => {
    const mode = manualMode || detectResponseMode(userMessage);
    const ragContext = retrieveRelevantKnowledge(userMessage, studentProfile);
    
    try {
      const systemPrompt = `${getModePrompt(mode)}\n\nRules: Explain simply, never judge, break into steps, give examples, be caring.${getStudentContext()}${ragContext}\n\nRespond in ${mode} MODE:`;
      const response = await callGeminiAPI(userMessage, systemPrompt);
      if (response) return response;
    } catch (error) {
      console.error('AI Error:', error);
    }
    
    return generateMentorResponse(userMessage, studentProfile);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now(), text: inputText, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    const mode = manualMode || detectResponseMode(currentInput);
    setCurrentMode(mode);
    const response = await getAIResponse(currentInput);
    setIsTyping(false);
    
    const botMessage = { id: Date.now() + 1, text: response, sender: 'bot', timestamp: new Date() };
    setMessages(prev => [...prev, botMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {showProfileSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Let's get to know you! 😊</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              saveProfile({
                name: formData.get('name'),
                branch: formData.get('branch'),
                year: formData.get('year'),
                completedTopics: formData.get('completed'),
                currentFocus: formData.get('focus')
              });
            }}>
              <input name="name" placeholder="Your name" className="w-full px-3 py-2 border rounded-lg mb-3" required />
              <select name="branch" className="w-full px-3 py-2 border rounded-lg mb-3" required>
                <option value="">Select Branch</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
              </select>
              <select name="year" className="w-full px-3 py-2 border rounded-lg mb-3" required>
                <option value="">Select Year</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
              <input name="completed" placeholder="Completed topics (optional)" className="w-full px-3 py-2 border rounded-lg mb-3" />
              <input name="focus" placeholder="Current focus (optional)" className="w-full px-3 py-2 border rounded-lg mb-4" />
              <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Start Chatting!</button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Your Mentor {studentProfile?.name ? `- ${studentProfile.name}` : ''}</h1>
            <p className="text-sm text-gray-500">{studentProfile ? `${studentProfile.branch} | ${studentProfile.year}` : 'Here to guide and support you'}</p>
            <div className="flex gap-1 mt-1">
              <button onClick={() => setManualMode(manualMode === 'MENTOR' ? null : 'MENTOR')} className={`text-xs px-2 py-1 rounded ${manualMode === 'MENTOR' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}>💙 Mentor</button>
              <button onClick={() => setManualMode(manualMode === 'TEACHER' ? null : 'TEACHER')} className={`text-xs px-2 py-1 rounded ${manualMode === 'TEACHER' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>📚 Teacher</button>
              <button onClick={() => setManualMode(manualMode === 'CHAT' ? null : 'CHAT')} className={`text-xs px-2 py-1 rounded ${manualMode === 'CHAT' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>💬 Chat</button>
              {manualMode && <button onClick={() => setManualMode(null)} className="text-xs px-2 py-1 rounded bg-gray-200">Auto</button>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowProfileSetup(true)} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Edit</button>
            <button onClick={() => setMessages([{ id: 1, text: "Hey there! I'm so glad you're here. 😊\n\nWhat's on your mind?", sender: 'bot', timestamp: new Date() }])} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">New Chat</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}`}>
                  {message.sender === 'user' ? '👤' : '🤖'}
                </div>
                <div className={`px-4 py-3 rounded-2xl ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 shadow-sm border'}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">🤖</div>
                <div className="px-4 py-3 rounded-2xl bg-white shadow-sm border">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <span className="text-xs text-gray-500">{manualMode ? `${manualMode} Mode (Manual)` : `${currentMode} Mode (Auto)`}</span>
              <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={handleKeyPress} placeholder="Share what's on your mind..." className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows="1" disabled={isTyping} />
            </div>
            <button onClick={handleSend} disabled={!inputText.trim() || isTyping} className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50">Send</button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Every expert was once a beginner. You're doing great! 💙</p>
        </div>
      </div>
    </div>
  );
}



