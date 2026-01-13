import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              step: '1',
              title: 'Choose Your Branch',
              description: 'Select from Computer Science, Mechanical, Electrical, Civil, and more.'
            },
            {
              step: '2',
              title: 'Select Your Year',
              description: 'Get guidance specific to your current academic year (1st to 4th year)'
            },
            {
              step: '3',
              title: 'Follow The Roadmap',
              description: 'Get curated resources, skills, projects, and internship guidance'
            }
          ].map((item) => (
            <div key={item.step} className="text-center p-8 border rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Departments Preview */}
        <div className="bg-gradient-to-r from-blue-50 to-gray-100 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center mb-8">Available Engineering Branches</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Computer Science', icon: '💻', color: 'bg-blue-100' },
              { name: 'Mechanical', icon: '⚙️', color: 'bg-red-100' },
              { name: 'Electrical', icon: '⚡', color: 'bg-yellow-100' },
              { name: 'Electronics', icon: '📡', color: 'bg-purple-100' },
              { name: 'Civil', icon: '🏗️', color: 'bg-green-100' }
            ].map((dept, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 ${dept.color}`}>
                  {dept.icon}
                </div>
                <span className="text-gray-700 font-medium">{dept.name}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link 
              to="/department" 
              className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Branches
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;