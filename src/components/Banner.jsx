import React from 'react';
import { Link } from 'react-router-dom';

const Banner = () => {
  return (
    <div className="pt-24 pb-16 bg-gradient-to-r from-blue-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            No More Confusion.
            <span className="block text-blue-600 mt-2">Your Engineering Career, Clearly Mapped.</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Get branch-specific, year-wise guidance with curated resources from trusted sources. 
            No AI, just direct links to proven learning materials.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/department" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Your Journey →
            </Link>
            
            <a 
              href="#how-it-works" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white border-2 border-blue-200 rounded-lg hover:bg-blue-50 transform hover:-translate-y-1 transition-all duration-300"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: '6+', label: 'Engineering Branches' },
            { value: '100+', label: 'Trusted Resources' },
            { value: 'Year-wise', label: 'Structured Roadmap' },
            { value: '100%', label: 'Free Forever' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;