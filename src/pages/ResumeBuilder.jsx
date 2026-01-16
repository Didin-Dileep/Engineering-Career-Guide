import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, database } from '../firebase';
import { ref, get, set } from 'firebase/database';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [autoSkills, setAutoSkills] = useState([]);
  const [aiGenerating, setAiGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    // Personal Info
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    portfolio: '',
    
    // Education
    tenth: { school: '', board: '', percentage: '', year: '' },
    twelfth: { school: '', board: '', percentage: '', year: '' },
    graduation: { college: '', university: '', department: '', year: '', cgpa: '' },
    
    // Skills (auto-generated + custom)
    skills: [],
    
    // Projects
    projects: [],
    
    // Achievements
    achievements: [],
    
    // Experience
    experience: []
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Set email first
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));

      // Try to load user info from Realtime Database
      try {
        const userRef = ref(database, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          setFormData(prev => ({
            ...prev,
            name: userData.name || '',
            graduation: {
              ...prev.graduation,
              department: userData.department || '',
              year: userData.year || ''
            }
          }));
        }
      } catch (err) {
        console.log('No user data found, using defaults');
      }

      // Try to load existing resume data
      try {
        const resumeRef = ref(database, `resumes/${user.uid}`);
        const resumeSnapshot = await get(resumeRef);
        if (resumeSnapshot.exists()) {
          setFormData(prev => ({ ...prev, ...resumeSnapshot.val() }));
        }
      } catch (err) {
        console.log('No resume data found');
      }

      // Auto-generate skills from completed topics
      await generateSkills(user.uid);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const generateSkills = async (userId) => {
    try {
      const progressRef = ref(database, `progress/${userId}/topics`);
      const snapshot = await get(progressRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const skillsMap = {};
        
        // Map topics to skills
        Object.keys(data).forEach(topicId => {
          const progress = data[topicId].progress || 0;
          if (progress > 0) {
            const skills = getSkillsFromTopic(parseInt(topicId));
            skills.forEach(skill => {
              if (!skillsMap[skill]) {
                skillsMap[skill] = progress;
              } else {
                skillsMap[skill] = Math.max(skillsMap[skill], progress);
              }
            });
          }
        });
        
        // Convert to array with levels
        const skillsArray = Object.keys(skillsMap).map(skill => ({
          name: skill,
          level: skillsMap[skill] >= 80 ? 'Advanced' : skillsMap[skill] >= 40 ? 'Intermediate' : 'Beginner'
        }));
        
        setAutoSkills(skillsArray);
        setFormData(prev => ({ ...prev, skills: skillsArray }));
      }
    } catch (error) {
      console.error('Error generating skills:', error);
    }
  };

  const getSkillsFromTopic = (topicId) => {
    const skillMap = {
      1: ['Problem Solving', 'Algorithms', 'Flowcharts'],
      2: ['Python', 'C Programming', 'Programming Fundamentals'],
      3: ['Data Structures', 'Arrays', 'Linked Lists', 'Stacks', 'Queues'],
      4: ['Algorithms', 'Sorting', 'Searching', 'Time Complexity'],
      5: ['Discrete Mathematics', 'Logic', 'Graph Theory'],
      6: ['Computer Organization', 'Computer Architecture'],
      7: ['Git', 'GitHub', 'Version Control'],
      8: ['Project Development'],
      9: ['OOP', 'Java', 'Object-Oriented Programming'],
      10: ['DBMS', 'SQL', 'Database Design', 'Normalization'],
      11: ['Operating Systems', 'Process Management', 'Memory Management'],
      12: ['Computer Networks', 'TCP/IP', 'Networking'],
      13: ['Advanced Data Structures', 'Trees', 'Graphs', 'Hashing'],
      14: ['HTML', 'CSS', 'JavaScript', 'React', 'Web Development'],
      15: ['Software Engineering', 'SDLC', 'Agile'],
      16: ['Full Stack Development'],
      17: ['Dynamic Programming', 'Competitive Programming'],
      18: ['System Design', 'Scalability', 'Microservices'],
      19: ['Machine Learning', 'Python', 'Data Science'],
      20: ['Cloud Computing', 'AWS', 'DevOps', 'Docker'],
      21: ['React', 'Node.js', 'Full Stack'],
      22: ['Resume Building', 'LinkedIn'],
      23: ['Project Management'],
      24: ['Interview Preparation'],
      25: ['Industry Experience'],
      26: ['System Design', 'Architecture'],
      27: ['DSA', 'Problem Solving'],
      28: ['Cloud', 'DevOps'],
      29: ['Project Development'],
      30: ['Interview Skills'],
      31: ['Competitive Programming'],
      32: ['Research'],
      33: ['Personal Branding']
    };
    return skillMap[topicId] || [];
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      const resumeRef = ref(database, `resumes/${user.uid}`);
      await set(resumeRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      alert('Resume saved successfully!');
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Failed to save resume');
    }
  };

  const generateAIResume = async () => {
    setAiGenerating(true);
    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_NEW_API_KEY_HERE') {
        alert('⚠️ Please add your Gemini API key to .env file\n\n1. Go to https://aistudio.google.com/app/apikey\n2. Create API key\n3. Add to .env: VITE_GEMINI_API_KEY=your_key\n4. Restart dev server');
        setAiGenerating(false);
        return;
      }

      const prompt = `Generate 3 professional project descriptions for a ${formData.graduation.department} student with skills: ${formData.skills.map(s => s.name).join(', ')}.

Format as JSON:
{
  "projects": [
    {"title": "Project Name", "description": "Point 1\nPoint 2\nPoint 3", "techStack": "Tech1, Tech2"}
  ]
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (aiText) {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiProjects = JSON.parse(jsonMatch[0]);
          setFormData(prev => ({
            ...prev,
            projects: aiProjects.projects || prev.projects
          }));
          alert('✨ AI generated projects!');
        }
      }
    } catch (error) {
      console.error('AI error:', error);
      alert(`❌ Failed: ${error.message}\n\nPlease check:\n1. API key is valid\n2. Generative Language API is enabled\n3. Get new key from https://aistudio.google.com/app/apikey`);
    }
    setAiGenerating(false);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;
    
    // NAME - Large, Bold
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(formData.name || 'Your Name', 20, yPos);
    yPos += 10;
    
    // Contact Info - Links and Contact Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 255); // Blue for links
    const links = [];
    if (formData.portfolio) links.push(formData.portfolio.replace('https://', ''));
    if (formData.linkedin) links.push('LinkedIn');
    if (formData.github) links.push('GitHub');
    doc.text(links.join(' | '), 20, yPos);
    
    // Right-aligned contact info
    doc.setTextColor(0, 0, 0);
    const contactRight = `Email: ${formData.email} | Mobile: ${formData.phone}`;
    doc.text(contactRight, pageWidth - 20, yPos, { align: 'right' });
    yPos += 12;
    
    // EDUCATION Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 255); // Blue heading
    doc.text('EDUCATION', 20, yPos);
    doc.setDrawColor(0, 0, 255);
    doc.line(20, yPos + 1, pageWidth - 20, yPos + 1);
    yPos += 8;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    
    // Graduation
    if (formData.graduation.college) {
      doc.setFont('helvetica', 'bold');
      doc.text(formData.graduation.college, 20, yPos);
      doc.text(`${formData.graduation.department}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 6;
      
      doc.setFont('helvetica', 'italic');
      doc.text(`Btech in ${formData.graduation.department}`, 20, yPos);
      doc.text(`Year ${formData.graduation.year}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 8;
    }
    
    // 12th
    if (formData.twelfth.school) {
      doc.setFont('helvetica', 'bold');
      doc.text(formData.twelfth.school, 20, yPos);
      doc.text(formData.twelfth.year, pageWidth - 20, yPos, { align: 'right' });
      yPos += 6;
      
      doc.setFont('helvetica', 'italic');
      doc.text('Secondary and Higher Secondary School', 20, yPos);
      doc.text(`${formData.twelfth.board} - ${formData.twelfth.percentage}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 8;
    }
    
    // 10th
    if (formData.tenth.school) {
      doc.setFont('helvetica', 'bold');
      doc.text(formData.tenth.school, 20, yPos);
      doc.text(formData.tenth.year, pageWidth - 20, yPos, { align: 'right' });
      yPos += 6;
      
      doc.setFont('helvetica', 'italic');
      doc.text('Primary and Middle School', 20, yPos);
      doc.text(`${formData.tenth.board} - ${formData.tenth.percentage}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 12;
    }
    
    // PROJECTS Section
    if (formData.projects.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 255);
      doc.text('PROJECTS', 20, yPos);
      doc.line(20, yPos + 1, pageWidth - 20, yPos + 1);
      yPos += 10;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      formData.projects.forEach((project) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        // Project Title (Bold, Underlined)
        doc.setFont('helvetica', 'bold');
        doc.text(project.title.toUpperCase(), 20, yPos);
        doc.setFont('helvetica', 'normal');
        
        if (project.github) {
          doc.setTextColor(0, 0, 255);
          doc.text('Source Code', pageWidth - 20, yPos, { align: 'right' });
          doc.setTextColor(0, 0, 0);
        }
        yPos += 6;
        
        // Description with bullet points
        if (project.description) {
          const descLines = doc.splitTextToSize(project.description, pageWidth - 50);
          descLines.forEach(line => {
            doc.text('• ' + line, 25, yPos);
            yPos += 5;
          });
        }
        
        // Tech Stack in bold
        if (project.techStack) {
          doc.setFont('helvetica', 'bold');
          doc.text(`Tech: ${project.techStack}`, 25, yPos);
          doc.setFont('helvetica', 'normal');
          yPos += 5;
        }
        
        yPos += 5;
      });
    }
    
    // SKILLS Section
    if (formData.skills.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 255);
      doc.text('SKILLS', 20, yPos);
      doc.line(20, yPos + 1, pageWidth - 20, yPos + 1);
      yPos += 10;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      // Technical Skills
      doc.setFont('helvetica', 'bold');
      doc.text('1. TECHNICAL SKILLS:', 25, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      
      // Group skills by category
      const languages = formData.skills.filter(s => 
        ['Python', 'C Programming', 'Java', 'JavaScript', 'HTML', 'CSS'].includes(s.name)
      ).map(s => s.name).join(' , ');
      
      if (languages) {
        doc.text('• Languages : ' + languages, 30, yPos);
        yPos += 6;
      }
      
      const frameworks = formData.skills.filter(s => 
        ['React', 'Node.js', 'Express'].includes(s.name)
      ).map(s => s.name).join(' , ');
      
      if (frameworks) {
        doc.text('• Frameworks : ' + frameworks, 30, yPos);
        yPos += 6;
      }
      
      const tools = formData.skills.filter(s => 
        ['Git', 'GitHub', 'VS Code', 'Docker'].includes(s.name)
      ).map(s => s.name).join(' , ');
      
      if (tools) {
        doc.text('• Developer Tools : ' + tools, 30, yPos);
        yPos += 6;
      }
      
      // Other skills
      const otherSkills = formData.skills.filter(s => 
        !['Python', 'C Programming', 'Java', 'JavaScript', 'HTML', 'CSS', 'React', 'Node.js', 'Express', 'Git', 'GitHub', 'VS Code', 'Docker'].includes(s.name)
      ).map(s => s.name).join(' , ');
      
      if (otherSkills) {
        doc.text('• Other : ' + otherSkills, 30, yPos);
        yPos += 6;
      }
      
      yPos += 4;
      
      // Soft Skills
      doc.setFont('helvetica', 'bold');
      doc.text('2. Soft Skills:', 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text('Communication , Leadership , Critical Thinking , Teamwork , Problem-Solving , Time Management', 90, yPos);
    }
    
    // Save PDF
    doc.save(`${formData.name.replace(/\s+/g, '_')}_Resume.pdf`);
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { title: '', description: '', techStack: '', github: '', demo: '' }]
    }));
  };

  const removeProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.linkedin || !formData.github) {
        alert('Please fill all required fields (Name, Email, Phone, LinkedIn, GitHub)');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.tenth.school || !formData.tenth.board || !formData.tenth.percentage || !formData.tenth.year) {
        alert('Please complete 10th Standard details');
        return false;
      }
      if (!formData.twelfth.school || !formData.twelfth.board || !formData.twelfth.percentage || !formData.twelfth.year) {
        alert('Please complete 12th Standard details');
        return false;
      }
      if (!formData.graduation.college || !formData.graduation.university) {
        alert('Please complete Graduation details');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-2xl text-blue-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">📄 Resume Builder</h1>
          <p className="text-gray-600">Create your professional resume</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {s}
              </div>
              {s < 4 && <div className={`w-16 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-300'}`} />}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
                <input
                  type="url"
                  placeholder="LinkedIn URL *"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="url"
                  placeholder="GitHub URL *"
                  value={formData.github}
                  onChange={(e) => setFormData({...formData, github: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="url"
                  placeholder="Portfolio URL (optional)"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Education */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Education</h2>
              
              {/* 10th */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">10th Standard</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="School Name" value={formData.tenth.school}
                    onChange={(e) => setFormData({...formData, tenth: {...formData.tenth, school: e.target.value}})}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="Board" value={formData.tenth.board}
                    onChange={(e) => setFormData({...formData, tenth: {...formData.tenth, board: e.target.value}})}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="Percentage/CGPA" value={formData.tenth.percentage}
                    onChange={(e) => setFormData({...formData, tenth: {...formData.tenth, percentage: e.target.value}})}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="Year" value={formData.tenth.year}
                    onChange={(e) => setFormData({...formData, tenth: {...formData.tenth, year: e.target.value}})}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              {/* 12th */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">12th Standard</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="School Name" value={formData.twelfth.school}
                    onChange={(e) => setFormData({...formData, twelfth: {...formData.twelfth, school: e.target.value}})}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="Board" value={formData.twelfth.board}
                    onChange={(e) => setFormData({...formData, twelfth: {...formData.twelfth, board: e.target.value}})}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="Percentage/CGPA" value={formData.twelfth.percentage}
                    onChange={(e) => setFormData({...formData, twelfth: {...formData.twelfth, percentage: e.target.value}})}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="Year" value={formData.twelfth.year}
                    onChange={(e) => setFormData({...formData, twelfth: {...formData.twelfth, year: e.target.value}})}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              {/* Graduation */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Graduation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="College Name" value={formData.graduation.college}
                    onChange={(e) => setFormData({...formData, graduation: {...formData.graduation, college: e.target.value}})}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="University" value={formData.graduation.university}
                    onChange={(e) => setFormData({...formData, graduation: {...formData.graduation, university: e.target.value}})}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="Department" value={formData.graduation.department}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100" readOnly />
                  <input type="text" placeholder="Current Year" value={formData.graduation.year}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100" readOnly />
                  <input type="text" placeholder="CGPA (if available)" value={formData.graduation.cgpa}
                    onChange={(e) => setFormData({...formData, graduation: {...formData.graduation, cgpa: e.target.value}})}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Skills & Projects */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Skills & Projects</h2>
              
              {/* Auto-generated Skills */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Skills (Auto-generated from your progress) ✨</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {autoSkills.map((skill, i) => (
                    <span key={i} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {skill.name} - {skill.level}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500">These skills are automatically generated based on your completed topics</p>
              </div>

              {/* Projects */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg">Projects</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={generateAIResume} 
                      disabled={aiGenerating}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2"
                    >
                      {aiGenerating ? '⏳ Generating...' : '✨ AI Generate'}
                    </button>
                    <button onClick={addProject} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                      + Add Project
                    </button>
                  </div>
                </div>
                {formData.projects.map((project, index) => (
                  <div key={index} className="mb-4 p-4 border-2 border-gray-200 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Project {index + 1}</h4>
                      <button onClick={() => removeProject(index)} className="text-red-500 hover:text-red-700">Remove</button>
                    </div>
                    <div className="space-y-2">
                      <input type="text" placeholder="Project Title" value={project.title}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].title = e.target.value;
                          setFormData({...formData, projects: newProjects});
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                      <textarea placeholder="Description" value={project.description}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].description = e.target.value;
                          setFormData({...formData, projects: newProjects});
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" rows="2" />
                      <input type="text" placeholder="Tech Stack (e.g., React, Node.js)" value={project.techStack}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].techStack = e.target.value;
                          setFormData({...formData, projects: newProjects});
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                      <input type="url" placeholder="GitHub Link (optional)" value={project.github}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].github = e.target.value;
                          setFormData({...formData, projects: newProjects});
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Preview & Save */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Preview & Save</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-4">{formData.name}</h3>
                <p className="text-gray-600 mb-4">{formData.email} | {formData.phone}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Projects ({formData.projects.length})</h4>
                  {formData.projects.map((p, i) => (
                    <div key={i} className="mb-2">
                      <p className="font-medium">{p.title}</p>
                      <p className="text-sm text-gray-600">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/profile')}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              {step === 1 ? 'Cancel' : 'Previous'}
            </button>
            
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  💾 Save Resume
                </button>
                <button
                  onClick={async () => {
                    if (formData.projects.length === 0) {
                      const confirm = window.confirm('No projects found. Generate AI projects first?');
                      if (confirm) {
                        await generateAIResume();
                        setTimeout(() => downloadPDF(), 2000);
                      }
                    } else {
                      downloadPDF();
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  📥 Download PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



