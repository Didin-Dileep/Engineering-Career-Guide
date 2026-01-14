import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '../firebase';

export default function Learn() {
  const { topicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const topic = location.state?.topic;
  const [activeResource, setActiveResource] = useState(null);
  const [resourceStartTime, setResourceStartTime] = useState(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);

  const quizQuestions = topic?.id === 1 ? [
    { question: "What is an algorithm?", options: ["A programming language", "A step-by-step procedure to solve a problem", "A type of computer", "A software application"], correct: 1 },
    { question: "What is the purpose of a flowchart?", options: ["To write code faster", "To visualize the flow of an algorithm", "To debug programs", "To compile code"], correct: 1 },
    { question: "What is pseudocode?", options: ["Fake code that doesn't work", "A high-level description of an algorithm using plain language", "Code written in Python", "Encrypted code"], correct: 1 },
    { question: "Which comes first in problem solving?", options: ["Writing code", "Testing the program", "Understanding the problem", "Debugging"], correct: 2 }
  ] : topic?.id === 2 ? [
    { question: "What is a variable?", options: ["A fixed value", "A container to store data", "A type of loop", "A function"], correct: 1 },
    { question: "Which is a valid data type?", options: ["Integer", "Algorithm", "Flowchart", "Compiler"], correct: 0 },
    { question: "What does 'if-else' do?", options: ["Repeats code", "Stores data", "Makes decisions", "Defines functions"], correct: 2 },
    { question: "What is a loop used for?", options: ["Store variables", "Repeat code multiple times", "Print output", "Define conditions"], correct: 1 }
  ] : topic?.id === 3 ? [
    { question: "What is an array?", options: ["A single variable", "A collection of elements of same type", "A function", "A loop"], correct: 1 },
    { question: "Which follows LIFO principle?", options: ["Queue", "Array", "Stack", "String"], correct: 2 },
    { question: "What is a queue?", options: ["LIFO structure", "FIFO structure", "Random access", "Tree structure"], correct: 1 },
    { question: "What is a linked list?", options: ["Fixed size array", "Nodes connected by pointers", "Stack implementation", "Sorting algorithm"], correct: 1 }
  ] : topic?.id === 4 ? [
    { question: "What is binary search?", options: ["Search from start to end", "Search in sorted array by dividing", "Random search", "Search using stack"], correct: 1 },
    { question: "Which sorting is simplest?", options: ["Merge sort", "Quick sort", "Bubble sort", "Heap sort"], correct: 2 },
    { question: "What does Big O notation represent?", options: ["Memory usage", "Time complexity", "Code length", "Variable count"], correct: 1 },
    { question: "What is O(n) complexity?", options: ["Constant time", "Linear time", "Quadratic time", "Logarithmic time"], correct: 1 }
  ] : topic?.id === 5 ? [
    { question: "What is a set?", options: ["Ordered collection", "Unordered collection of unique elements", "Array with duplicates", "Linked list"], correct: 1 },
    { question: "What is a relation?", options: ["A function", "Connection between sets", "A variable", "A loop"], correct: 1 },
    { question: "What is a graph?", options: ["Linear structure", "Nodes connected by edges", "Sorting algorithm", "Data type"], correct: 1 },
    { question: "What is logic in CS?", options: ["Programming syntax", "Mathematical reasoning", "Data structure", "Algorithm"], correct: 1 }
  ] : topic?.id === 6 ? [
    { question: "What is CPU?", options: ["Storage device", "Central Processing Unit", "Memory type", "Input device"], correct: 1 },
    { question: "What is RAM?", options: ["Permanent storage", "Temporary memory", "Processing unit", "Output device"], correct: 1 },
    { question: "What is instruction cycle?", options: ["Memory cycle", "Fetch-Decode-Execute cycle", "Input cycle", "Storage cycle"], correct: 1 },
    { question: "What is I/O?", options: ["Internal Operations", "Input/Output", "Instruction Order", "Integer Operations"], correct: 1 }
  ] : topic?.id === 7 ? [
    { question: "What is Git?", options: ["Programming language", "Version control system", "Database", "Web framework"], correct: 1 },
    { question: "What is a commit?", options: ["Delete code", "Save snapshot of changes", "Run program", "Create file"], correct: 1 },
    { question: "What does 'push' do?", options: ["Download code", "Upload code to remote", "Delete repository", "Create branch"], correct: 1 },
    { question: "What is a repository?", options: ["A file", "Storage location for project", "A function", "A variable"], correct: 1 }
  ] : topic?.id === 8 ? [
    { question: "Why build projects?", options: ["Just for fun", "Apply and practice concepts", "Waste time", "Copy code"], correct: 1 },
    { question: "What is a calculator project?", options: ["Advanced AI", "Basic arithmetic operations program", "Database system", "Web server"], correct: 1 },
    { question: "What does a to-do app do?", options: ["Play games", "Manage tasks", "Edit photos", "Send emails"], correct: 1 },
    { question: "Best way to learn coding?", options: ["Only watch videos", "Build projects", "Just read books", "Memorize syntax"], correct: 1 }
  ] : topic?.id === 9 ? [
    { question: "What is OOP?", options: ["Operating system", "Object-Oriented Programming", "Online platform", "Output process"], correct: 1 },
    { question: "What is inheritance?", options: ["Copying code", "Reusing properties from parent class", "Deleting objects", "Creating variables"], correct: 1 },
    { question: "What is encapsulation?", options: ["Hiding data", "Showing all data", "Deleting data", "Copying data"], correct: 0 },
    { question: "What is polymorphism?", options: ["One form", "Many forms", "No forms", "Two forms"], correct: 1 }
  ] : topic?.id === 10 ? [
    { question: "What is DBMS?", options: ["Data Building System", "Database Management System", "Digital Base System", "Data Block System"], correct: 1 },
    { question: "What is normalization?", options: ["Adding redundancy", "Removing redundancy", "Deleting data", "Copying tables"], correct: 1 },
    { question: "What is SQL?", options: ["Programming language", "Query language for databases", "Operating system", "Web framework"], correct: 1 },
    { question: "What is a primary key?", options: ["Any column", "Unique identifier", "Foreign key", "Index"], correct: 1 }
  ] : topic?.id === 11 ? [
    { question: "What is a process?", options: ["Program in execution", "Stored program", "Deleted program", "Compiled code"], correct: 0 },
    { question: "What is deadlock?", options: ["Fast execution", "Processes waiting indefinitely", "Process completion", "Memory allocation"], correct: 1 },
    { question: "What is scheduling?", options: ["Deleting processes", "Allocating CPU to processes", "Creating files", "Managing memory"], correct: 1 },
    { question: "What is virtual memory?", options: ["Physical RAM", "Simulated memory using disk", "Cache memory", "Register"], correct: 1 }
  ] : topic?.id === 12 ? [
    { question: "What is OSI model?", options: ["Operating system", "7-layer network model", "Programming model", "Database model"], correct: 1 },
    { question: "What is TCP?", options: ["Text protocol", "Transmission Control Protocol", "Transfer code", "Terminal command"], correct: 1 },
    { question: "What is DNS?", options: ["Data system", "Domain Name System", "Digital network", "Database server"], correct: 1 },
    { question: "What is HTTP?", options: ["Hardware protocol", "HyperText Transfer Protocol", "Host transfer", "Home protocol"], correct: 1 }
  ] : topic?.id === 13 ? [
    { question: "What is a binary tree?", options: ["Tree with 3 children", "Tree with max 2 children", "Linear structure", "Graph"], correct: 1 },
    { question: "What is hashing?", options: ["Sorting", "Mapping data to fixed size", "Searching", "Deleting"], correct: 1 },
    { question: "What is a heap?", options: ["Linear list", "Complete binary tree", "Graph", "Stack"], correct: 1 },
    { question: "What is a trie?", options: ["Binary tree", "Tree for string storage", "Graph", "Queue"], correct: 1 }
  ] : topic?.id === 14 ? [
    { question: "What is HTML?", options: ["Programming language", "Markup language", "Database", "Operating system"], correct: 1 },
    { question: "What is React?", options: ["Database", "JavaScript library", "Programming language", "Server"], correct: 1 },
    { question: "What is REST API?", options: ["Database", "Web service architecture", "Programming language", "Framework"], correct: 1 },
    { question: "What is CSS?", options: ["Programming language", "Styling language", "Database", "Server"], correct: 1 }
  ] : topic?.id === 15 ? [
    { question: "What is SDLC?", options: ["Software Development Life Cycle", "System data cycle", "Server development", "Storage cycle"], correct: 0 },
    { question: "What is Agile?", options: ["Programming language", "Development methodology", "Database", "Framework"], correct: 1 },
    { question: "What is unit testing?", options: ["Testing whole system", "Testing individual components", "No testing", "User testing"], correct: 1 },
    { question: "What is CI/CD?", options: ["Database", "Continuous Integration/Deployment", "Programming language", "Framework"], correct: 1 }
  ] : topic?.id === 16 ? [
    { question: "Why build full-stack projects?", options: ["Just for fun", "Learn end-to-end development", "Waste time", "Copy code"], correct: 1 },
    { question: "What is a blog app?", options: ["Game", "Content management system", "Calculator", "Chat app"], correct: 1 },
    { question: "What is a chat application?", options: ["Static website", "Real-time messaging system", "Database", "Calculator"], correct: 1 },
    { question: "Best way to learn full-stack?", options: ["Only theory", "Build complete projects", "Just watch videos", "Memorize code"], correct: 1 }
  ] : topic?.id === 17 ? [
    { question: "What is Dynamic Programming?", options: ["Random programming", "Optimization technique using subproblems", "Static programming", "Loop programming"], correct: 1 },
    { question: "What is Greedy algorithm?", options: ["Takes all solutions", "Makes locally optimal choice", "Random choice", "Backtracking"], correct: 1 },
    { question: "What is BFS?", options: ["Depth first", "Breadth First Search", "Binary search", "Best first"], correct: 1 },
    { question: "Why competitive programming?", options: ["Just for fun", "Improve problem-solving speed", "Waste time", "Easy marks"], correct: 1 }
  ] : topic?.id === 18 ? [
    { question: "What is scalability?", options: ["Small systems", "Handling increased load", "Reducing features", "Deleting data"], correct: 1 },
    { question: "What is load balancing?", options: ["Deleting servers", "Distributing traffic across servers", "Single server", "Caching"], correct: 1 },
    { question: "What is caching?", options: ["Deleting data", "Storing frequently accessed data", "Slow storage", "Database"], correct: 1 },
    { question: "What are microservices?", options: ["Monolithic app", "Small independent services", "Single service", "Database"], correct: 1 }
  ] : topic?.id === 19 ? [
    { question: "What is Machine Learning?", options: ["Manual programming", "Learning from data", "Static rules", "Database"], correct: 1 },
    { question: "What is supervised learning?", options: ["No labels", "Learning with labeled data", "Random learning", "Unsupervised"], correct: 1 },
    { question: "What is model evaluation?", options: ["Training model", "Testing model performance", "Deleting model", "Creating data"], correct: 1 },
    { question: "Why data preprocessing?", options: ["Waste time", "Clean and prepare data", "Delete data", "Ignore data"], correct: 1 }
  ] : topic?.id === 20 ? [
    { question: "What is Docker?", options: ["Database", "Containerization platform", "Programming language", "Operating system"], correct: 1 },
    { question: "What is AWS?", options: ["Database", "Cloud computing platform", "Programming language", "Framework"], correct: 1 },
    { question: "What is Linux?", options: ["Windows", "Open-source OS", "Application", "Database"], correct: 1 },
    { question: "What is cybersecurity?", options: ["Hacking", "Protecting systems from threats", "Deleting data", "Programming"], correct: 1 }
  ] : topic?.id === 21 ? [
    { question: "What is Full Stack?", options: ["Only frontend", "Frontend + Backend development", "Only backend", "Database only"], correct: 1 },
    { question: "What is Next.js?", options: ["Database", "React framework", "Programming language", "Server"], correct: 1 },
    { question: "What is authentication?", options: ["Deleting users", "Verifying user identity", "Creating UI", "Database"], correct: 1 },
    { question: "What is an API?", options: ["Database", "Interface for communication", "Programming language", "Framework"], correct: 1 }
  ] : topic?.id === 22 ? [
    { question: "Why is resume important?", options: ["Not important", "First impression for recruiters", "Waste of time", "Just formality"], correct: 1 },
    { question: "What should GitHub profile show?", options: ["Nothing", "Projects and contributions", "Personal photos", "Random code"], correct: 1 },
    { question: "Why LinkedIn?", options: ["Social media", "Professional networking", "Entertainment", "Gaming"], correct: 1 },
    { question: "What is cold emailing?", options: ["Spam", "Reaching out to recruiters", "Deleting emails", "Random emails"], correct: 1 }
  ] : topic?.id === 23 ? [
    { question: "Why major project?", options: ["Just requirement", "Showcase skills and learning", "Waste time", "Copy project"], correct: 1 },
    { question: "What makes good project?", options: ["Copied code", "Solves real problem", "Simple calculator", "No documentation"], correct: 1 },
    { question: "Should project be unique?", options: ["No, copy others", "Yes, shows creativity", "Doesn't matter", "Use templates only"], correct: 1 },
    { question: "What is project documentation?", options: ["Not needed", "Explains project details", "Random text", "Code comments"], correct: 1 }
  ] : topic?.id === 24 ? [
    { question: "What is most important for placements?", options: ["Luck", "DSA + Problem solving", "Just degree", "Connections only"], correct: 1 },
    { question: "Why mock interviews?", options: ["Waste time", "Practice and build confidence", "Not needed", "Just formality"], correct: 1 },
    { question: "What is Striver SDE Sheet?", options: ["Random problems", "Curated DSA problems", "Book", "Framework"], correct: 1 },
    { question: "Should revise core CS subjects?", options: ["No, only DSA", "Yes, asked in interviews", "Not important", "Just read once"], correct: 1 }
  ] : topic?.id === 25 ? [
    { question: "Why internship in 4th year?", options: ["Not important", "Industry exposure & experience", "Waste time", "Just formality"], correct: 1 },
    { question: "What is MLH Fellowship?", options: ["Job portal", "Open-source internship program", "College program", "Exam"], correct: 1 },
    { question: "Best platform for internships?", options: ["Only college placements", "LinkedIn, Internshala, Wellfound", "Random websites", "No need"], correct: 1 },
    { question: "What matters in internship?", options: ["Just certificate", "Learning & real work experience", "Easy work", "High stipend only"], correct: 1 }
  ] : topic?.id === 26 ? [
    { question: "What is system design?", options: ["Coding", "Designing scalable systems", "UI design", "Database only"], correct: 1 },
    { question: "What is load balancing?", options: ["Deleting servers", "Distributing traffic", "Single server", "Database"], correct: 1 },
    { question: "Why caching?", options: ["Slow down", "Improve performance", "Delete data", "Backup"], correct: 1 },
    { question: "What are microservices?", options: ["Monolith", "Independent small services", "Single service", "Database"], correct: 1 }
  ] : topic?.id === 27 ? [
    { question: "What is advanced DP?", options: ["Basic loops", "Complex optimization problems", "Simple recursion", "Arrays"], correct: 1 },
    { question: "Why bit manipulation?", options: ["Not useful", "Fast operations & interviews", "Slow operations", "Only theory"], correct: 1 },
    { question: "What is NeetCode?", options: ["Random videos", "Curated interview problems", "Social media", "Game"], correct: 1 },
    { question: "How many problems to solve?", options: ["10-20", "150-200+ for interviews", "5", "No need"], correct: 1 }
  ] : topic?.id === 28 ? [
    { question: "What is AWS?", options: ["Database", "Cloud computing platform", "Programming language", "Framework"], correct: 1 },
    { question: "What is Docker?", options: ["Database", "Containerization platform", "Programming language", "OS"], correct: 1 },
    { question: "What is CI/CD?", options: ["Database", "Continuous Integration/Deployment", "Programming", "Testing only"], correct: 1 },
    { question: "Why learn DevOps?", options: ["Not needed", "Industry standard for deployment", "Only for ops team", "Waste time"], correct: 1 }
  ] : topic?.id === 29 ? [
    { question: "Why major project important?", options: ["Just requirement", "Showcase skills to recruiters", "Waste time", "Copy project"], correct: 1 },
    { question: "Should deploy project?", options: ["No need", "Yes, shows completion", "Only local", "Not important"], correct: 1 },
    { question: "What is good documentation?", options: ["No docs", "Clear README & setup guide", "Random text", "Code comments only"], correct: 1 },
    { question: "Best hosting platform?", options: ["No hosting", "Vercel, Firebase, Netlify", "Local only", "Paid only"], correct: 1 }
  ] : topic?.id === 30 ? [
    { question: "What is most asked in placements?", options: ["Only HR", "DSA + Core CS + Projects", "Just resume", "Luck"], correct: 1 },
    { question: "Why mock interviews?", options: ["Waste time", "Build confidence & practice", "Not needed", "Just formality"], correct: 1 },
    { question: "What is behavioral interview?", options: ["Technical coding", "Soft skills & experience", "DSA only", "Resume check"], correct: 1 },
    { question: "Best resume format?", options: ["Colorful", "Clean, ATS-friendly", "Multiple pages", "No format"], correct: 1 }
  ] : topic?.id === 31 ? [
    { question: "What is Codeforces?", options: ["Social media", "Competitive programming platform", "Job portal", "Learning site"], correct: 1 },
    { question: "Why competitive programming?", options: ["Not useful", "Improve speed & problem solving", "Waste time", "Just for fun"], correct: 1 },
    { question: "What is rating?", options: ["Random number", "Skill level indicator", "Age", "Experience"], correct: 1 },
    { question: "How to improve rating?", options: ["Give up", "Regular practice & contests", "Copy solutions", "No practice"], correct: 1 }
  ] : topic?.id === 32 ? [
    { question: "What is GATE?", options: ["Job exam", "Graduate Aptitude Test", "College exam", "Internship test"], correct: 1 },
    { question: "Why GRE?", options: ["Job", "Masters abroad", "Internship", "College admission"], correct: 1 },
    { question: "What is arXiv?", options: ["Social media", "Research paper repository", "Job portal", "Learning platform"], correct: 1 },
    { question: "Should pursue higher studies?", options: ["Everyone must", "Depends on career goals", "Never", "Only for weak students"], correct: 1 }
  ] : topic?.id === 33 ? [
    { question: "Why LinkedIn important?", options: ["Social media", "Professional networking", "Entertainment", "Not important"], correct: 1 },
    { question: "What is GitHub portfolio?", options: ["Random repos", "Showcase of projects", "Social media", "Resume"], correct: 1 },
    { question: "Why technical blogging?", options: ["Waste time", "Share knowledge & build brand", "Not useful", "Only for writers"], correct: 1 },
    { question: "Best blogging platform?", options: ["No platform", "Hashnode, Dev.to, Medium", "Social media", "Email"], correct: 1 }
  ] : [];

  useEffect(() => {
    const loadProgress = async () => {
      const user = auth.currentUser;
      if (!user) {
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
          if (authUser) {
            const progressRef = ref(database, `progress/${authUser.uid}/topics/${topicId}`);
            const snapshot = await get(progressRef);
            if (snapshot.exists()) {
              const data = snapshot.val();
              setTotalTimeSpent(data.timeSpent || {});
              setQuizScore(data.quizScore !== undefined ? data.quizScore : null);
            }
            unsubscribe();
          }
        });
      } else {
        const progressRef = ref(database, `progress/${user.uid}/topics/${topicId}`);
        const snapshot = await get(progressRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setTotalTimeSpent(data.timeSpent || {});
          setQuizScore(data.quizScore !== undefined ? data.quizScore : null);
        }
      }
    };
    loadProgress();
  }, [topicId]);

  useEffect(() => {
    let interval;
    if (activeResource !== null && resourceStartTime) {
      interval = setInterval(() => {
        setTotalTimeSpent(prev => {
          const newTime = { ...prev, [activeResource]: (prev[activeResource] || 0) + 1 };
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeResource, resourceStartTime]);

  useEffect(() => {
    let saveInterval;
    if (activeResource !== null) {
      saveInterval = setInterval(() => {
        saveProgress();
      }, 5000);
    }
    return () => clearInterval(saveInterval);
  }, [activeResource, totalTimeSpent, quizScore]);

  const calculateProgress = (timeData = totalTimeSpent, quiz = quizScore) => {
    if (!topic.resources) return 0;
    let completed = 0;
    topic.resources.forEach((_, i) => {
      if ((timeData[i] || 0) >= 60) completed++;
    });
    const timeProgress = (completed / topic.resources.length) * 70;
    const quizProgress = quiz !== null ? (quiz / quizQuestions.length) * 30 : 0;
    return Math.round(timeProgress + quizProgress);
  };

  const saveProgress = async (timeData = totalTimeSpent, quiz = quizScore) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('❌ No user');
        return;
      }
      
      const progress = calculateProgress(timeData, quiz);
      const progressRef = ref(database, `progress/${user.uid}/topics/${topicId}`);
      
      console.log('💾 Saving:', { topicId, progress, timeData });
      
      await set(progressRef, {
        progress,
        timeSpent: timeData,
        quizScore: quiz,
        lastUpdated: new Date().toISOString()
      });
      
      console.log('✅ Saved!');
    } catch (error) {
      console.error('❌ Save error:', error);
    }
  };

  const handleResourceClick = (index) => {
    setActiveResource(index);
    setResourceStartTime(Date.now());
  };

  const handleResourceClose = async () => {
    await saveProgress();
    setActiveResource(null);
    setResourceStartTime(null);
  };

  const handleQuizSubmit = async () => {
    let score = 0;
    answers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correct) score++;
    });
    setQuizScore(score);
    await saveProgress(totalTimeSpent, score);
  };

  if (!topic) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Topic not found</h2>
          <Link to="/roadmap" className="text-blue-600 hover:underline">Back to Roadmap</Link>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  if (showQuiz) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Knowledge Check Quiz</h2>
            {quizScore === null ? (
              <div>
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">Question {currentQuestion + 1} of {quizQuestions.length}</p>
                  <h3 className="text-xl font-semibold mb-4">{quizQuestions[currentQuestion].question}</h3>
                  <div className="space-y-3">
                    {quizQuestions[currentQuestion].options.map((option, index) => (
                      <button key={index} onClick={() => { const newAnswers = [...answers]; newAnswers[currentQuestion] = index; setAnswers(newAnswers); }}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${answers[currentQuestion] === index ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0} className="px-6 py-2 bg-gray-300 rounded-lg disabled:opacity-50">Previous</button>
                  {currentQuestion < quizQuestions.length - 1 ? (
                    <button onClick={() => setCurrentQuestion(currentQuestion + 1)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Next</button>
                  ) : (
                    <button onClick={handleQuizSubmit} disabled={answers.length !== quizQuestions.length} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Submit Quiz</button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Quiz Complete!</h3>
                <p className="text-xl mb-6">Your Score: {quizScore}/{quizQuestions.length}</p>
                <p className="text-gray-600 mb-6">Overall Progress: {progress}%</p>
                <button onClick={() => navigate('/roadmap')} className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">Back to Roadmap</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/roadmap" className="text-blue-600 hover:underline mb-6 inline-block">&larr; Back to Roadmap</Link>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{topic.title}</h1>
              {topic.subtitle && <p className="text-lg text-gray-600">{topic.subtitle}</p>}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{progress}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
            <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="bg-blue-50 p-4 rounded-lg mb-8">
            <p className="text-sm text-gray-700"><strong>How to earn progress:</strong> Spend at least 1 minute on each resource (70%) + Complete the quiz (30%)</p>
          </div>
          {topic.topics && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">What You'll Learn</h2>
              <ul className="space-y-3">
                {topic.topics.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-3 text-xl">✓</span>
                    <span className="text-gray-700 text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {topic.resources && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Learning Resources</h2>
              <div className="space-y-4">
                {topic.resources.map((resource, index) => {
                  const timeSpent = totalTimeSpent[index] || 0;
                  const isComplete = timeSpent >= 60;
                  const minutes = Math.floor(timeSpent / 60);
                  const seconds = timeSpent % 60;
                  return (
                    <div key={index} className={`bg-blue-50 p-4 rounded-lg border-2 ${isComplete ? 'border-green-500' : 'border-transparent'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{resource.title}</h3>
                          <span className="text-sm text-gray-600 capitalize">{resource.type}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{minutes}:{seconds.toString().padStart(2, '0')}</div>
                          <div className="text-xs text-gray-600">/ 1:00 min</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={resource.link} target="_blank" rel="noopener noreferrer" onClick={() => handleResourceClick(index)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center">
                          {activeResource === index ? 'Studying...' : 'Start Learning'}
                        </a>
                        {activeResource === index && (
                          <button onClick={handleResourceClose} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Pause</button>
                        )}
                      </div>
                      {isComplete && <div className="mt-2 text-green-600 font-semibold text-sm">✓ Completed</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <button onClick={() => setShowQuiz(true)} className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Take Knowledge Check Quiz (30% of progress)
          </button>
        </div>
      </div>
    </div>
  );
}