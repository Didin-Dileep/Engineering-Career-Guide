import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { auth, database } from '../firebase';
import TopicCard from '../components/TopicCard';

export default function Roadmap() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dept = searchParams.get('dept');
  const year = searchParams.get('year');

  // CS First Year Topics in proper learning order
  const csFirstYearTopics = [
    { 
      id: 1, 
      title: '🟦 Computational Thinking', 
      subtitle: 'How computers solve problems',
      progress: 0,
      topics: [
        'What is an algorithm?',
        'Flowcharts',
        'Pseudocode',
        'Logical thinking'
      ],
      resources: [
        { title: 'Harvard CS50 Lecture 0 – Problem Solving', type: 'video', link: 'https://www.youtube.com/watch?v=jjqgP9dpD1k' },
        { title: 'What is an Algorithm? - Abdul Bari', type: 'video', link: 'https://www.youtube.com/watch?v=0IAPZzGSbME' },
        { title: 'Flowchart Basics - GeeksforGeeks', type: 'blog', link: 'https://www.geeksforgeeks.org/flowchart-introduction/' },
        { title: 'Pseudocode Guide', type: 'blog', link: 'https://www.geeksforgeeks.org/how-to-write-a-pseudo-code/' }
      ]
    },
    { 
      id: 2, 
      title: 'Programming Fundamentals (Python/C)', 
      subtitle: 'First actual coding',
      progress: 0,
      topics: [
        'Variables and Data types',
        'Input/output operations',
        'Conditions (if/else)',
        'Loops (for/while)',
        'Functions basics'
      ],
      resources: [
        { title: 'Corey Schafer Python Playlist', type: 'video', link: 'https://www.youtube.com/playlist?list=PL-osiE80TeTskrapNbzXhwoFUiLCjGgY7' },
        { title: 'FreeCodeCamp Python Full Course', type: 'video', link: 'https://www.youtube.com/watch?v=rfscVS0vtbw' },
        { title: 'Neso Academy C Programming Playlist', type: 'video', link: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRggZZgYpPMUxdY1CYkZtARR' },
        { title: 'Practice: Solve 10 Beginner Problems', type: 'practice', link: 'https://www.hackerrank.com/domains/python' }
      ]
    },
    { 
      id: 3, 
      title: 'Data Structures Basics', 
      subtitle: 'How data is stored and organized',
      progress: 0,
      topics: [
        'Arrays',
        'Strings',
        'Stacks',
        'Queues',
        'Linked Lists (concept only)'
      ],
      resources: [
        { title: 'Abdul Bari DSA Playlist', type: 'video', link: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O' },
        { title: 'Neso Academy Data Structures', type: 'video', link: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRj9lld8sWIUNwlKfdUoPd1Y' },
        { title: 'GeeksforGeeks Data Structures', type: 'blog', link: 'https://www.geeksforgeeks.org/data-structures/' },
        { title: 'Practice: Array & Stack Problems', type: 'practice', link: 'https://www.hackerrank.com/domains/data-structures' }
      ]
    },
    { 
      id: 4, 
      title: 'Algorithms Basics', 
      subtitle: 'How efficiently problems are solved',
      progress: 0,
      topics: [
        'Searching (Linear, Binary)',
        'Sorting (Bubble, Selection, Merge)',
        'Time complexity basics (Big O)'
      ],
      resources: [
        { title: 'Abdul Bari Algorithms Playlist', type: 'video', link: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O' },
        { title: 'VisuAlgo - Algorithm Visualizations', type: 'interactive', link: 'https://visualgo.net/en' },
        { title: 'Big O Notation Explained', type: 'blog', link: 'https://www.freecodecamp.org/news/big-o-notation-why-it-matters-and-why-it-doesnt-1674cfa8a23c/' },
        { title: 'Practice: Sorting & Searching', type: 'practice', link: 'https://www.hackerrank.com/domains/algorithms' }
      ]
    },
    { 
      id: 5, 
      title: 'Discrete Mathematics', 
      subtitle: 'Math behind CS',
      progress: 0,
      topics: [
        'Logic',
        'Sets',
        'Relations',
        'Functions',
        'Graph basics'
      ],
      resources: [
        { title: 'Neso Academy Discrete Maths', type: 'video', link: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRhqJPDXcvYlLfXPh37L89g3' },
        { title: 'MIT Discrete Math Lectures', type: 'video', link: 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/' },
        { title: 'Discrete Math Tutorial', type: 'blog', link: 'https://www.tutorialspoint.com/discrete_mathematics/index.htm' },
        { title: 'Practice: Logic Problems', type: 'practice', link: 'https://brilliant.org/courses/logic/' }
      ]
    },
    { 
      id: 6, 
      title: 'Computer Organization', 
      subtitle: 'How computers work inside',
      progress: 0,
      topics: [
        'CPU',
        'Memory',
        'Input/Output',
        'Instruction cycle'
      ],
      resources: [
        { title: 'Neso Academy COA Playlist', type: 'video', link: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRgLLlzdgiTUKULKJPYc0A4q' },
        { title: 'Computer Organization Basics', type: 'blog', link: 'https://www.geeksforgeeks.org/computer-organization-and-architecture-tutorials/' },
        { title: 'How CPU Works', type: 'video', link: 'https://www.youtube.com/watch?v=cNN_tTXABUA' },
        { title: 'Memory Hierarchy Explained', type: 'blog', link: 'https://www.tutorialspoint.com/computer_fundamentals/computer_memory.htm' }
      ]
    },
    { 
      id: 7, 
      title: 'Version Control (Git & GitHub)', 
      subtitle: 'How engineers manage code',
      progress: 0,
      topics: [
        'Git basics',
        'Repositories',
        'Commits',
        'Push / Pull'
      ],
      resources: [
        { title: 'GitHub Hello World Guide', type: 'interactive', link: 'https://guides.github.com/activities/hello-world/' },
        { title: 'Traversy Media Git Tutorial', type: 'video', link: 'https://www.youtube.com/watch?v=SWYqp7iY_Tc' },
        { title: 'Git Handbook', type: 'blog', link: 'https://guides.github.com/introduction/git-handbook/' },
        { title: 'Practice: First Repository', type: 'practice', link: 'https://github.com/' }
      ]
    },
    { 
      id: 8, 
      title: 'Mini Projects', 
      subtitle: 'Apply learning',
      progress: 0,
      topics: [
        'Calculator',
        'Number guessing game',
        'Simple to-do app'
      ],
      resources: [
        { title: 'Build a Calculator in Python', type: 'video', link: 'https://www.youtube.com/watch?v=u51Zjlnui4Y' },
        { title: 'Number Guessing Game Tutorial', type: 'blog', link: 'https://www.geeksforgeeks.org/number-guessing-game-in-python/' },
        { title: 'To-Do App Project', type: 'video', link: 'https://www.youtube.com/watch?v=WXsD0ZgxjRw' },
        { title: 'Project Ideas for Beginners', type: 'blog', link: 'https://www.freecodecamp.org/news/python-projects-for-beginners/' }
      ]
    }
  ];

  // CS Second Year Topics
  const csSecondYearTopics = [
    { id: 9, title: 'Object-Oriented Programming (OOP)', subtitle: 'Structure large programs', progress: 0,
      topics: ['Classes & objects', 'Inheritance', 'Polymorphism', 'Abstraction', 'Encapsulation'],
      resources: [
        { title: 'Neso Academy OOP Playlist', type: 'video', link: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRjMH3mWf6kwqiTbT798eAOm' },
        { title: 'Corey Schafer Python OOP', type: 'video', link: 'https://www.youtube.com/playlist?list=PL-osiE80TeTsqhIuOqKhwlXsIBIdSeYtc' },
        { title: 'Telusko Java OOP', type: 'video', link: 'https://www.youtube.com/watch?v=BGTx91t8q50' },
        { title: 'Practice: Build Class-based Projects', type: 'practice', link: 'https://www.hackerrank.com/domains/java' }
      ]
    },
    { id: 10, title: 'Database Management Systems (DBMS)', subtitle: 'How data is stored and managed', progress: 0,
      topics: ['ER diagrams', 'Normalization', 'SQL queries', 'Indexing', 'Transactions'],
      resources: [
        { title: 'Neso Academy DBMS', type: 'video', link: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRiyryTrbKHX1Sh9luYI0dhX' },
        { title: 'Stanford DBMS Lectures', type: 'video', link: 'https://www.youtube.com/playlist?list=PLroEs25KGvwzmvIxYHRhoGTz9w8LeXek0' },
        { title: 'W3Schools SQL Tutorial', type: 'interactive', link: 'https://www.w3schools.com/sql/' },
        { title: 'Practice: Write 30+ SQL Queries', type: 'practice', link: 'https://www.hackerrank.com/domains/sql' }
      ]
    },
    { id: 11, title: 'Operating Systems', subtitle: 'How computers manage processes', progress: 0,
      topics: ['Processes & threads', 'Scheduling', 'Deadlocks', 'Memory management', 'File systems'],
      resources: [
        { title: 'Neso Academy OS', type: 'video', link: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O' },
        { title: 'Gate Smashers OS', type: 'video', link: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p' },
        { title: 'OS Concepts - GeeksforGeeks', type: 'blog', link: 'https://www.geeksforgeeks.org/operating-systems/' },
        { title: 'Practice: OS Problems', type: 'practice', link: 'https://www.geeksforgeeks.org/operating-systems-gq/' }
      ]
    },
    { id: 12, title: 'Computer Networks', subtitle: 'How computers communicate', progress: 0,
      topics: ['OSI model', 'TCP/IP', 'Routing', 'DNS', 'HTTP/HTTPS'],
      resources: [
        { title: 'Neso Academy CN', type: 'video', link: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRgMCUAG0XRw78UA8qnv6jEx' },
        { title: 'Gate Smashers CN', type: 'video', link: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_' },
        { title: 'Computer Networks Tutorial', type: 'blog', link: 'https://www.geeksforgeeks.org/computer-network-tutorials/' },
        { title: 'Practice: Network Problems', type: 'practice', link: 'https://www.geeksforgeeks.org/computer-networks-gq/' }
      ]
    },
    { id: 13, title: 'Advanced Data Structures', subtitle: 'Efficiency matters', progress: 0,
      topics: ['Trees', 'Heaps', 'Hashing', 'Graphs', 'Tries'],
      resources: [
        { title: 'Abdul Bari Advanced DSA', type: 'video', link: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O' },
        { title: 'GeeksforGeeks Advanced DS', type: 'blog', link: 'https://www.geeksforgeeks.org/advanced-data-structures/' },
        { title: 'VisuAlgo - Tree Visualizations', type: 'interactive', link: 'https://visualgo.net/en/bst' },
        { title: 'Practice: Tree & Graph Problems', type: 'practice', link: 'https://leetcode.com/problemset/all/' }
      ]
    },
    { id: 14, title: 'Web Development Basics', subtitle: 'Build real products', progress: 0,
      topics: ['HTML, CSS, JS', 'React basics', 'REST APIs'],
      resources: [
        { title: 'FreeCodeCamp Web Dev', type: 'video', link: 'https://www.youtube.com/watch?v=mU6anWqZJcc' },
        { title: 'Traversy Media React', type: 'video', link: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8' },
        { title: 'Mozilla MDN Web Docs', type: 'blog', link: 'https://developer.mozilla.org/en-US/' },
        { title: 'Practice: Build a Portfolio Site', type: 'practice', link: 'https://www.frontendmentor.io/' }
      ]
    },
    { id: 15, title: 'Software Engineering', subtitle: 'How real software is built', progress: 0,
      topics: ['SDLC', 'Agile', 'Testing', 'Version control workflows'],
      resources: [
        { title: 'Neso Academy SE', type: 'video', link: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRgMCUAG0XRw78UA8qnv6jEx' },
        { title: 'Atlassian Agile Guides', type: 'blog', link: 'https://www.atlassian.com/agile' },
        { title: 'Software Testing Tutorial', type: 'blog', link: 'https://www.guru99.com/software-testing.html' },
        { title: 'Practice: Contribute to Open Source', type: 'practice', link: 'https://github.com/explore' }
      ]
    },
    { id: 16, title: 'Mini Projects', subtitle: 'Apply everything', progress: 0,
      topics: ['Student management system', 'Blog app', 'Chat application'],
      resources: [
        { title: 'Student Management System Project', type: 'video', link: 'https://www.youtube.com/watch?v=gCo6JqGMi30' },
        { title: 'Build a Blog with React', type: 'video', link: 'https://www.youtube.com/watch?v=tlTdbc5byAs' },
        { title: 'Chat App Tutorial', type: 'video', link: 'https://www.youtube.com/watch?v=jD7FnbI76Hg' },
        { title: 'Full Stack Project Ideas', type: 'blog', link: 'https://www.geeksforgeeks.org/top-10-projects-for-beginners-to-practice-html-and-css-skills/' }
      ]
    }
  ];

  // CS Third Year Topics
  const csThirdYearTopics = [
    { id: 17, title: 'Advanced Algorithms & Competitive Programming', subtitle: 'Improve problem-solving and speed', progress: 0,
      topics: ['Dynamic Programming', 'Greedy algorithms', 'Backtracking', 'Graph algorithms (Dijkstra, BFS, DFS)', 'Segment trees (optional)'],
      resources: [
        { title: 'Abdul Bari Algorithms', type: 'video', link: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O' },
        { title: 'Codeforces EDU', type: 'interactive', link: 'https://codeforces.com/edu/courses' },
        { title: 'GeeksforGeeks DP Tutorial', type: 'blog', link: 'https://www.geeksforgeeks.org/dynamic-programming/' },
        { title: 'Practice: Solve 100+ Problems', type: 'practice', link: 'https://leetcode.com/problemset/all/' }
      ]
    },
    { id: 18, title: 'System Design Basics', subtitle: 'How large systems are built', progress: 0,
      topics: ['Scalability', 'Load balancing', 'Caching', 'Databases at scale', 'Microservices (intro)'],
      resources: [
        { title: 'Gaurav Sen System Design', type: 'video', link: 'https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX' },
        { title: 'System Design Primer (GitHub)', type: 'blog', link: 'https://github.com/donnemartin/system-design-primer' },
        { title: 'ByteByteGo System Design', type: 'video', link: 'https://www.youtube.com/@ByteByteGo' },
        { title: 'Practice: Design Systems', type: 'practice', link: 'https://www.educative.io/courses/grokking-the-system-design-interview' }
      ]
    },
    { id: 19, title: 'Machine Learning / Data Science', subtitle: 'AI-focused students (Optional)', progress: 0,
      topics: ['Python for ML', 'Supervised learning', 'Model evaluation', 'Data preprocessing'],
      resources: [
        { title: 'Andrew Ng Coursera ML', type: 'video', link: 'https://www.coursera.org/learn/machine-learning' },
        { title: 'StatQuest ML Basics', type: 'video', link: 'https://www.youtube.com/c/joshstarmer' },
        { title: 'Kaggle Learn', type: 'interactive', link: 'https://www.kaggle.com/learn' },
        { title: 'Practice: Kaggle Competitions', type: 'practice', link: 'https://www.kaggle.com/competitions' }
      ]
    },
    { id: 20, title: 'Cybersecurity / Cloud / DevOps', subtitle: 'Infrastructure & security (Optional)', progress: 0,
      topics: ['Linux basics', 'Docker', 'AWS basics', 'Security fundamentals'],
      resources: [
        { title: 'AWS Cloud Practitioner', type: 'video', link: 'https://www.youtube.com/watch?v=SOTamWNgDKc' },
        { title: 'NetworkChuck YouTube', type: 'video', link: 'https://www.youtube.com/@NetworkChuck' },
        { title: 'Linux Journey', type: 'interactive', link: 'https://linuxjourney.com/' },
        { title: 'Practice: Docker Projects', type: 'practice', link: 'https://www.docker.com/101-tutorial' }
      ]
    },
    { id: 21, title: 'Full Stack Development', subtitle: 'Build production-level apps', progress: 0,
      topics: ['Frontend (React / Next.js)', 'Backend (Node / Django)', 'Authentication', 'APIs'],
      resources: [
        { title: 'FreeCodeCamp Full Stack', type: 'video', link: 'https://www.youtube.com/watch?v=nu_pCVPKzTk' },
        { title: 'Traversy Media MERN Stack', type: 'video', link: 'https://www.youtube.com/watch?v=7CqJlxBYj-M' },
        { title: 'Fireship Full Stack', type: 'video', link: 'https://www.youtube.com/@Fireship' },
        { title: 'Practice: Build Full Stack App', type: 'practice', link: 'https://www.theodinproject.com/' }
      ]
    },
    { id: 22, title: 'Internship & Resume Preparation', subtitle: 'Convert skills to opportunities', progress: 0,
      topics: ['Resume building', 'GitHub profile', 'LinkedIn branding', 'Cold emailing'],
      resources: [
        { title: 'Overleaf Resume Templates', type: 'interactive', link: 'https://www.overleaf.com/gallery/tagged/cv' },
        { title: 'Resume Worded', type: 'interactive', link: 'https://resumeworded.com/' },
        { title: 'LinkedIn Learning Career', type: 'video', link: 'https://www.linkedin.com/learning/' },
        { title: 'Practice: Build Your Resume', type: 'practice', link: 'https://www.canva.com/resumes/templates/' }
      ]
    },
    { id: 23, title: 'Major Project', subtitle: 'Final year project prep', progress: 0,
      topics: ['AI application', 'Scalable web app', 'Blockchain-based system', 'IoT system'],
      resources: [
        { title: 'Final Year Project Ideas', type: 'blog', link: 'https://www.geeksforgeeks.org/top-10-final-year-projects-for-computer-science-students/' },
        { title: 'Project Development Guide', type: 'video', link: 'https://www.youtube.com/watch?v=gCo6JqGMi30' },
        { title: 'GitHub Project Showcase', type: 'blog', link: 'https://github.com/topics/final-year-project' },
        { title: 'Practice: Build Your Project', type: 'practice', link: 'https://devpost.com/' }
      ]
    },
    { id: 24, title: 'Placement Interview Preparation', subtitle: 'Crack interviews', progress: 0,
      topics: ['DSA revision', 'Core CS revision (OS, DBMS, CN)', 'Mock interviews'],
      resources: [
        { title: 'InterviewBit', type: 'interactive', link: 'https://www.interviewbit.com/' },
        { title: 'LeetCode Top Interview Questions', type: 'practice', link: 'https://leetcode.com/problemset/top-interview-questions/' },
        { title: 'Striver SDE Sheet', type: 'blog', link: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/' },
        { title: 'Practice: Mock Interviews', type: 'practice', link: 'https://www.pramp.com/' }
      ]
    }
  ];

  // CS Fourth Year Topics
  const csFourthYearTopics = [
    { id: 25, title: 'Internship / Industry Experience', subtitle: 'Industry exposure matters most', progress: 0,
      topics: ['Resume-ready internship', 'Startup / research / open-source', 'Professional workflows'],
      resources: [
        { title: 'Internshala', type: 'interactive', link: 'https://internshala.com' },
        { title: 'LinkedIn Jobs', type: 'interactive', link: 'https://www.linkedin.com/jobs' },
        { title: 'Wellfound (AngelList)', type: 'interactive', link: 'https://wellfound.com' },
        { title: 'MLH Fellowships', type: 'interactive', link: 'https://fellowship.mlh.io' }
      ]
    },
    { id: 26, title: 'System Design', subtitle: 'Core for product companies', progress: 0,
      topics: ['Scalability', 'Load balancing', 'Caching', 'Databases', 'Microservices'],
      resources: [
        { title: 'Gaurav Sen System Design', type: 'video', link: 'https://www.youtube.com/c/GauravSensei' },
        { title: 'System Design Primer (GitHub)', type: 'blog', link: 'https://github.com/donnemartin/system-design-primer' },
        { title: 'ByteByteGo', type: 'interactive', link: 'https://bytebytego.com' },
        { title: 'Practice: Design Systems', type: 'practice', link: 'https://www.educative.io/courses/grokking-the-system-design-interview' }
      ]
    },
    { id: 27, title: 'Advanced DSA & Interview Prep', subtitle: 'Master interview patterns', progress: 0,
      topics: ['Graph algorithms', 'Dynamic programming (advanced)', 'Bit manipulation', 'Interview patterns'],
      resources: [
        { title: 'NeetCode', type: 'video', link: 'https://www.youtube.com/c/NeetCode' },
        { title: 'Striver Interview Sheet', type: 'blog', link: 'https://takeuforward.org' },
        { title: 'LeetCode', type: 'practice', link: 'https://leetcode.com' },
        { title: 'Practice: 150+ Problems', type: 'practice', link: 'https://leetcode.com/problemset/all/' }
      ]
    },
    { id: 28, title: 'Cloud & DevOps', subtitle: 'Modern infrastructure skills', progress: 0,
      topics: ['AWS / GCP / Azure basics', 'Docker', 'CI/CD', 'Kubernetes basics'],
      resources: [
        { title: 'AWS Free Tier', type: 'interactive', link: 'https://aws.amazon.com/free' },
        { title: 'TechWorld with Nana', type: 'video', link: 'https://www.youtube.com/c/TechWorldwithNana' },
        { title: 'Docker Docs', type: 'blog', link: 'https://docs.docker.com' },
        { title: 'Practice: Deploy Apps', type: 'practice', link: 'https://www.docker.com/101-tutorial' }
      ]
    },
    { id: 29, title: 'Major Project / Capstone', subtitle: 'Showcase your skills', progress: 0,
      topics: ['Full-stack app / ML project', 'Proper documentation', 'Deployment'],
      resources: [
        { title: 'GitHub', type: 'interactive', link: 'https://github.com' },
        { title: 'Firebase Hosting', type: 'interactive', link: 'https://firebase.google.com' },
        { title: 'Vercel', type: 'interactive', link: 'https://vercel.com' },
        { title: 'Practice: Build & Deploy', type: 'practice', link: 'https://www.netlify.com/' }
      ]
    },
    { id: 30, title: 'Placement Preparation', subtitle: 'Crack interviews', progress: 0,
      topics: ['Resume building', 'HR questions', 'Behavioral interview', 'Mock interviews'],
      resources: [
        { title: 'Pramp', type: 'interactive', link: 'https://www.pramp.com' },
        { title: 'InterviewBit', type: 'interactive', link: 'https://www.interviewbit.com' },
        { title: 'Glassdoor', type: 'blog', link: 'https://www.glassdoor.com' },
        { title: 'Practice: Mock Interviews', type: 'practice', link: 'https://interviewing.io/' }
      ]
    },
    { id: 31, title: 'Competitive Programming (Optional)', subtitle: 'Problem solving speed', progress: 0,
      topics: ['Codeforces contests', 'Problem solving speed', 'Rating improvement'],
      resources: [
        { title: 'Codeforces', type: 'interactive', link: 'https://codeforces.com' },
        { title: 'AtCoder', type: 'interactive', link: 'https://atcoder.jp' },
        { title: 'CodeChef', type: 'interactive', link: 'https://www.codechef.com' },
        { title: 'Practice: Weekly Contests', type: 'practice', link: 'https://codeforces.com/contests' }
      ]
    },
    { id: 32, title: 'Higher Studies / Research (Optional)', subtitle: 'GATE / GRE preparation', progress: 0,
      topics: ['GATE prep', 'GRE/TOEFL', 'Research papers'],
      resources: [
        { title: 'NPTEL GATE', type: 'video', link: 'https://nptel.ac.in' },
        { title: 'Gate Overflow', type: 'interactive', link: 'https://gateoverflow.in' },
        { title: 'arXiv', type: 'blog', link: 'https://arxiv.org' },
        { title: 'Practice: Previous Papers', type: 'practice', link: 'https://gate.iitk.ac.in/' }
      ]
    },
    { id: 33, title: 'Personal Branding', subtitle: 'Build your online presence', progress: 0,
      topics: ['LinkedIn profile optimization', 'GitHub portfolio', 'Technical blogging'],
      resources: [
        { title: 'LinkedIn Learning', type: 'video', link: 'https://linkedin.com/learning' },
        { title: 'Hashnode', type: 'interactive', link: 'https://hashnode.com' },
        { title: 'Dev.to', type: 'interactive', link: 'https://dev.to' },
        { title: 'Practice: Write Blogs', type: 'practice', link: 'https://medium.com/' }
      ]
    }
  ];

  const allTopics = year === '4' ? csFourthYearTopics : year === '3' ? csThirdYearTopics : year === '2' ? csSecondYearTopics : csFirstYearTopics;
  const [topics, setTopics] = useState(allTopics);

  const loadProgress = async () => {
    try {
      const user = auth.currentUser;
      console.log('🔄 Loading progress, user:', user?.uid);
      if (user) {
        const progressRef = ref(database, `progress/${user.uid}/topics`);
        const snapshot = await get(progressRef);
        
        console.log('📊 Snapshot exists:', snapshot.exists());
        
        const progressMap = {};
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log('📦 Data:', data);
          Object.keys(data).forEach(topicId => {
            progressMap[topicId] = data[topicId].progress || 0;
          });
        }
        
        console.log('🗺️ Progress map:', progressMap);
        
        const updatedTopics = allTopics.map(topic => ({
          ...topic,
          progress: progressMap[topic.id.toString()] || 0
        }));
        
        console.log('✅ Updated topics:', updatedTopics.map(t => `${t.id}:${t.progress}%`));
        setTopics(updatedTopics);
      }
    } catch (error) {
      console.error('❌ Load error:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadProgress();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      if (auth.currentUser) {
        loadProgress();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleStartLearning = (topic) => {
    navigate(`/learn/${topic.id}`, { state: { topic } });
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            Computer Science - Year {year || '1'} Roadmap
          </h1>
          <p className="text-lg text-gray-600">
            Track your progress through essential CS topics
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic.title}
              progress={topic.progress}
              onStartLearning={() => handleStartLearning(topic)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}