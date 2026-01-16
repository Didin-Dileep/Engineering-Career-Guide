import React from 'react';
import { useNavigate } from 'react-router-dom';

const Department = () => {
  const navigate = useNavigate();
  
  const departments = [
    {
      id: 'cs',
      name: 'Computer Science',
      icon: '💻',
      color: 'from-blue-400 to-blue-600',
      description: 'Programming, AI, Web Development'
    },
    {
      id: 'mechanical',
      name: 'Mechanical Engineering',
      icon: '⚙️',
      color: 'from-red-400 to-red-600',
      description: 'CAD, Manufacturing, Design'
    },
    {
      id: 'eee',
      name: 'Electrical & Electronics',
      icon: '⚡',
      color: 'from-yellow-400 to-yellow-600',
      description: 'Power Systems, Circuits'
    },
    {
      id: 'ece',
      name: 'Electronics & Communication',
      icon: '📡',
      color: 'from-purple-400 to-purple-600',
      description: 'VLSI, Embedded Systems'
    },
    {
      id: 'civil',
      name: 'Civil Engineering',
      icon: '🏗️',
      color: 'from-green-400 to-green-600',
      description: 'Construction, Surveying'
    },
    {
      id: 'chemical',
      name: 'Chemical Engineering',
      icon: '🧪',
      color: 'from-indigo-400 to-indigo-600',
      description: 'Process Engineering'
    }
  ];

  const handleSelect = (deptId) => {
    navigate(`/year?dept=${deptId}`);
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Select Your Department</h1>
          <p className="text-lg text-gray-600">Choose your engineering branch to get started</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => handleSelect(dept.id)}
              className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${dept.color} rounded-2xl flex items-center justify-center text-4xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                {dept.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{dept.name}</h3>
              <p className="text-gray-600 text-sm">{dept.description}</p>
              <div className="mt-4 text-blue-600 font-medium flex items-center justify-center gap-2">
                Explore
                <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Department;


