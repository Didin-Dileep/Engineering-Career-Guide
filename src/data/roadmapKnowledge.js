// Roadmap Knowledge Base for RAG
export const roadmapKnowledge = {
  // Year-wise roadmaps
  "1st year": {
    focus: "Foundation building and exploration",
    subjects: ["Programming Fundamentals", "Logic & Problem Solving", "Core CS Subjects", "Git & GitHub"],
    advice: "First year is about building strong foundations. Don't rush - focus on understanding basics deeply.",
    resources: {
      programming: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
      cs50: "https://cs50.harvard.edu/x/"
    }
  },
  
  "2nd year": {
    focus: "Skill building, direction selection & internship preparation",
    subjects: ["DSA (basics to intermediate)", "OOP", "Operating Systems", "DBMS", "Domain Selection"],
    advice: "Second year is the most important for skill development. Choose ONE primary domain and build real projects.",
    keyPoints: [
      "Strengthen core CS skills",
      "Choose one primary domain (Web Dev, Data Science, or Core CS)",
      "Start internship-oriented preparation",
      "Build 3-5 resume-worthy projects"
    ],
    domains: {
      webDev: "HTML, CSS, JavaScript, React basics, Backend intro",
      dataScience: "Python, Pandas, NumPy, Basic data analysis",
      coreCS: "Strong DSA, OOP, OS basics"
    },
    resources: {
      dsa: "https://www.youtube.com/playlist?list=PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9",
      oop: "https://www.youtube.com/playlist?list=PLsyeobzWxl7poL9JTVyndKe62ieoN-MZ3",
      webDev: "https://www.freecodecamp.org/learn/"
    }
  },
  
  "3rd year": {
    focus: "Internships, interview preparation & industry readiness",
    subjects: ["Advanced DSA", "System Design basics", "Domain Specialization", "Interview Prep"],
    advice: "Third year is the turning point. Convert skills into internships and start serious placement preparation.",
    keyPoints: [
      "Internship conversion is critical",
      "Strong DSA & CS fundamentals",
      "Resume-ready projects with deployment",
      "Interview readiness - DSA + HR questions"
    ],
    mustDo: [
      "Apply for internships consistently",
      "Practice LeetCode Medium problems daily",
      "Polish LinkedIn and GitHub profiles",
      "Build full-stack or advanced domain projects"
    ],
    resources: {
      dsa: "https://www.youtube.com/c/NeetCode",
      interviews: "https://www.youtube.com/c/takeUforward",
      projects: "https://www.youtube.com/c/JavaScriptMastery"
    }
  },
  
  "4th year": {
    focus: "Placement preparation & job conversion",
    subjects: ["DSA Revision", "Mock Interviews", "System Design", "HR Prep"],
    advice: "Fourth year is execution year, not experimentation. Focus on converting preparation into full-time job or PPO.",
    keyPoints: [
      "Revise all DSA patterns",
      "Practice Medium to Hard problems",
      "Perfect your resume (1 page, impact-focused)",
      "Mock interviews weekly",
      "Convert internship to PPO if possible"
    ],
    avoidMistakes: [
      "Don't learn new domains now",
      "Don't ignore HR preparation",
      "Don't apply randomly - be strategic"
    ],
    resources: {
      leetcode: "https://leetcode.com/",
      mockInterviews: "https://www.pramp.com/",
      resume: "https://youtu.be/y8YH0Qbu5h4"
    }
  },
  
  // Topic-specific knowledge
  topics: {
    dsa: {
      importance: "DSA is the foundation of technical interviews. Every product company tests DSA skills.",
      beginnerTopics: ["Arrays", "Strings", "Linked Lists", "Stacks", "Queues", "Basic Sorting"],
      intermediateTopics: ["Trees", "Graphs", "Binary Search", "Recursion", "Backtracking"],
      advancedTopics: ["Dynamic Programming", "Advanced Graphs", "Segment Trees"],
      studyPlan: "Start with easy problems, do 3-5 daily, focus on patterns not memorization",
      resources: "Striver's A2Z DSA sheet, NeetCode 150, LeetCode"
    },
    
    webDev: {
      importance: "Most common career path for CS students. High demand, good pay, creative work.",
      frontend: "HTML, CSS, JavaScript, React, Tailwind CSS",
      backend: "Node.js, Express, MongoDB/SQL, REST APIs, Authentication",
      fullStack: "Combine frontend + backend + deployment",
      projectIdeas: ["Portfolio website", "Todo app", "Blog platform", "E-commerce clone"],
      resources: "freeCodeCamp, JavaScript Mastery, Traversy Media"
    },
    
    internships: {
      when: "Start applying in 2nd year, must have by 3rd year",
      where: "LinkedIn Jobs, Company career pages, AngelList, Internshala (selective)",
      preparation: "Strong resume, 3-5 projects, DSA basics, good communication",
      tips: "Apply consistently, focus on learning over stipend, get referrals when possible"
    },
    
    projects: {
      firstYear: "Calculator, To-do list, Simple games",
      secondYear: "Student management system, Blog website, Portfolio with backend",
      thirdYear: "Full-stack apps, Deployed projects, API-based systems",
      fourthYear: "Polish existing projects, add metrics and impact",
      tips: "Focus on problem-solving, clean code, proper README, deployment"
    }
  },
  
  // Common FAQs
  faqs: {
    "feeling behind": "You're not behind! Everyone learns at their own pace. Focus on YOUR progress, not others. Consistency beats speed. What matters is that you're moving forward.",
    
    "which domain": "Choose based on interest: Web Dev (most common, creative), Data Science (math + coding), Core CS/SDE (pure problem-solving). Pick ONE and go deep.",
    
    "no internship": "It's okay! Focus on: 1) Building strong projects, 2) Contributing to open source, 3) Networking on LinkedIn, 4) Preparing for placements. Many get jobs without internships.",
    
    "weak in DSA": "Start from basics. Do 2-3 easy problems daily. Use Striver's sheet. Focus on understanding patterns, not memorizing solutions. Consistency is key.",
    
    "project ideas": "Build what interests you! Start simple: Todo app, Calculator. Then advance: Blog, E-commerce clone, Dashboard. Focus on completing projects, not starting many."
  }
};

// RAG: Retrieve relevant knowledge based on query
export const retrieveRelevantKnowledge = (userMessage, studentProfile) => {
  const msg = userMessage.toLowerCase();
  let relevantContent = [];
  
  // Check for year-specific queries
  if (studentProfile?.year) {
    const yearKey = studentProfile.year.toLowerCase();
    if (roadmapKnowledge[yearKey]) {
      relevantContent.push(`\n📚 ${studentProfile.year} Roadmap Context:\n${JSON.stringify(roadmapKnowledge[yearKey], null, 2)}`);
    }
  }
  
  // Check for topic-specific queries
  if (msg.includes('dsa') || msg.includes('algorithm') || msg.includes('data structure')) {
    relevantContent.push(`\n📖 DSA Knowledge:\n${JSON.stringify(roadmapKnowledge.topics.dsa, null, 2)}`);
  }
  
  if (msg.includes('web') || msg.includes('react') || msg.includes('frontend') || msg.includes('backend')) {
    relevantContent.push(`\n🌐 Web Development Knowledge:\n${JSON.stringify(roadmapKnowledge.topics.webDev, null, 2)}`);
  }
  
  if (msg.includes('internship') || msg.includes('intern')) {
    relevantContent.push(`\n💼 Internship Knowledge:\n${JSON.stringify(roadmapKnowledge.topics.internships, null, 2)}`);
  }
  
  if (msg.includes('project')) {
    relevantContent.push(`\n🛠️ Project Knowledge:\n${JSON.stringify(roadmapKnowledge.topics.projects, null, 2)}`);
  }
  
  // Check FAQs
  Object.keys(roadmapKnowledge.faqs).forEach(key => {
    if (msg.includes(key)) {
      relevantContent.push(`\n❓ FAQ: ${roadmapKnowledge.faqs[key]}`);
    }
  });
  
  return relevantContent.length > 0 
    ? `\n\n📚 USE THIS ROADMAP KNOWLEDGE TO HELP THE STUDENT:\n${relevantContent.join('\n')}\n\nUse this information to give specific, personalized advice.`
    : '';
};



