import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { auth, database } from '../firebase';

export default function Year() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dept = searchParams.get('dept') || 'cs';
  const [yearProgress, setYearProgress] = useState({});

  const years = [
    {
      id: '1',
      name: '1st Year',
      subtitle: 'Foundation Building',
      icon: '🌱',
      color: 'from-green-400 to-green-600',
      description: 'Build strong fundamentals and explore basics',
      totalTopics: 8
    },
    {
      id: '2',
      name: '2nd Year',
      subtitle: 'Skill Development',
      icon: '📚',
      color: 'from-blue-400 to-blue-600',
      description: 'Develop core technical skills and knowledge',
      totalTopics: 8
    },
    {
      id: '3',
      name: '3rd Year',
      subtitle: 'Specialization',
      icon: '🎯',
      color: 'from-purple-400 to-purple-600',
      description: 'Focus on specialization and projects',
      totalTopics: 8
    },
    {
      id: '4',
      name: '4th Year',
      subtitle: 'Career Preparation',
      icon: '🚀',
      color: 'from-orange-400 to-orange-600',
      description: 'Prepare for placements and career launch',
      totalTopics: 9
    }
  ];

  const loadYearProgress = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const progressRef = ref(database, `progress/${user.uid}/topics`);
      const snapshot = await get(progressRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const yearProgressMap = {};
        
        // Year 1: topics 1-8, Year 2: 9-16, Year 3: 17-24, Year 4: 25-33
        const yearRanges = {
          '1': [1, 8],
          '2': [9, 16],
          '3': [17, 24],
          '4': [25, 33]
        };
        
        years.forEach(year => {
          const [start, end] = yearRanges[year.id];
          let totalProgress = 0;
          let count = 0;
          
          for (let i = start; i <= end; i++) {
            if (data[i.toString()]) {
              totalProgress += data[i.toString()].progress || 0;
              count++;
            }
          }
          
          yearProgressMap[year.id] = count > 0 ? Math.round(totalProgress / (end - start + 1)) : 0;
        });
        
        setYearProgress(yearProgressMap);
      }
    } catch (error) {
      console.error('Error loading year progress:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadYearProgress();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleYearSelect = (yearId) => {
    navigate(`/roadmap?dept=${dept}&year=${yearId}`);
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Select Your Year</h1>
          <p className="text-lg text-gray-600">Choose your current academic year</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {years.map((year) => {
            const progress = yearProgress[year.id] || 0;
            return (
              <button
                key={year.id}
                onClick={() => handleYearSelect(year.id)}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3"
              >
                <div className={`w-24 h-24 bg-gradient-to-br ${year.color} rounded-3xl flex items-center justify-center text-5xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  {year.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{year.name}</h3>
                <p className="text-blue-600 font-semibold mb-3">{year.subtitle}</p>
                <p className="text-gray-600 text-sm mb-4">{year.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-blue-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`bg-gradient-to-r ${year.color} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-blue-600 font-medium flex items-center justify-center gap-2">
                  View Roadmap
                  <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


