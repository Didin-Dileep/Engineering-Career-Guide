import React, { useState, useRef, useEffect } from 'react';

export default function WorkingChatGPT() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey there! I'm here as your mentor and guide. I know engineering can feel overwhelming sometimes, but you're not alone in this journey. What's on your mind today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an empathetic AI mentor for engineering students. Your role is to guide, motivate, and emotionally support students.

Behavior rules:
1. Always respond like a supportive senior/mentor, not a chatbot
2. First acknowledge the student's feeling (confusion, fear, pressure, stress)
3. Then give clear, practical, step-by-step guidance
4. Avoid generic advice like "work hard" or "be consistent"
5. Give 3-5 actionable steps only
6. Encourage the student and reduce anxiety
7. If student feels late or behind, reassure them with realistic examples
8. Use simple language, be calm, human, non-judgmental, honest
9. End with a gentle motivating line

Student message: "${userMessage}"

Respond as an empathetic mentor:`
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 1024
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const aiText = data.candidates[0].content.parts[0].text;
        setIsTyping(false);
        return aiText;
      } else {
        throw new Error('Invalid response structure');
      }
      
    } catch (error) {
      setIsTyping(false);
      return getEmpatheticResponse(userMessage);
    }
  };

  const getEmpatheticResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    // Feeling overwhelmed or stressed
    if (msg.includes('overwhelmed') || msg.includes('stressed') || msg.includes('pressure') || msg.includes('anxious')) {
      return `I can really feel the weight you're carrying right now, and it's completely understandable to feel this way. Engineering is tough, and the pressure can be intense.

Here's what I want you to do:

1. **Take a deep breath** - Right now, just pause for a moment
2. **Write down 3 things** you need to focus on this week (not everything, just 3)
3. **Start with the easiest one** - Build some momentum first
4. **Set a 25-minute timer** - Work on just that one thing, then take a break
5. **Talk to someone** - A friend, senior, or family member about how you're feeling

Remember, every successful engineer has felt exactly like you do right now. This feeling is temporary, but your growth from pushing through it will be permanent. You've got this! 💙`;
    }

    // Feeling behind or late
    if (msg.includes('behind') || msg.includes('late') || msg.includes('everyone else') || msg.includes('too late')) {
      return `I hear you, and that feeling of being "behind" is so common among students. But let me tell you something - there's no universal timeline for success.

Here's the reality:

1. **Most students feel this way** - You're not alone, even the "successful" ones felt behind at some point
2. **Start where you are** - Don't waste energy comparing, use it to move forward
3. **Pick ONE skill** - Focus on learning one thing well rather than everything poorly
4. **Small daily progress** - 1 hour daily beats 10 hours once a week
5. **Connect with seniors** - Ask them about their journey, you'll be surprised

I've seen students start in final year and still land great opportunities. Your timeline is your own, and it's never too late to begin. What matters is that you're starting now! 🌟`;
    }

    // Career confusion
    if (msg.includes('confused') || msg.includes('don\'t know') || msg.includes('what should i') || msg.includes('which field')) {
      return `That confusion you're feeling? It's actually a sign that you're thinking seriously about your future, which is great!

Let's clear this up step by step:

1. **List what you enjoy** - What subjects or activities make you lose track of time?
2. **Try before you decide** - Spend 2 weeks exploring each option that interests you
3. **Talk to people** - Find seniors or professionals in fields you're considering
4. **Start with basics** - You don't need to choose forever, just choose for now
5. **Give yourself time** - Most people change directions multiple times, and that's okay

Confusion means you care about making the right choice. Trust yourself to figure it out as you go. The path becomes clearer as you start walking it! 🚀`;
    }

    // Placement/job concerns
    if (msg.includes('placement') || msg.includes('job') || msg.includes('interview') || msg.includes('company')) {
      return `I understand the anxiety around placements - it feels like everything depends on it, right? But let me ease some of that pressure.

Here's your action plan:

1. **Know your basics** - Focus on fundamentals of your branch, not everything
2. **Build one good project** - Something you can explain confidently for 15 minutes
3. **Practice speaking** - Explain technical concepts to friends or family
4. **Apply widely** - Don't put all hopes on one "dream" company
5. **Prepare for rejections** - They're learning experiences, not reflections of your worth

Remember, placements are just one path. I know students who got jobs through referrals, startups, or even started their own ventures. Your career is a marathon, not a sprint. Keep moving forward! 💪`;
    }

    // Skills/learning questions
    if (msg.includes('learn') || msg.includes('skill') || msg.includes('programming') || msg.includes('development')) {
      return `I love that you're thinking about learning new skills! That growth mindset will take you far.

Let's make this simple:

1. **Choose ONE thing** - Pick one skill that excites you most right now
2. **Find a project** - Learn by building something, not just watching tutorials
3. **Set a 30-day goal** - What can you build in a month?
4. **Find a study buddy** - Learning with someone makes it more fun and sustainable
5. **Share your progress** - Post updates on LinkedIn or with friends

Don't try to learn everything at once. Master one thing, then move to the next. Every expert was once a beginner, and every pro was once an amateur. You're on the right track! ✨`;
    }

    // Default empathetic response
    return `I'm really glad you reached out. Sometimes just talking about what's on your mind can help clarify things.

As your mentor, I want you to know:

1. **Your feelings are valid** - Whatever you're going through, it's okay to feel that way
2. **You're not alone** - Thousands of students face similar challenges
3. **Progress over perfection** - Small steps forward are still progress
4. **It's okay to ask for help** - That's actually a sign of strength, not weakness
5. **Believe in your potential** - You have more capability than you realize

Could you tell me a bit more about what's specifically bothering you? I'm here to listen and help you figure out the next steps. Remember, every challenge you face today is building the resilience you'll need for tomorrow! 🌈`;
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

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
        >
          {isOpen ? '✕' : '💬'}
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl z-40 flex flex-col border">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="font-bold">Your AI Mentor 🤗</h3>
            <p className="text-xs opacity-90">Here to guide and support you</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
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

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


