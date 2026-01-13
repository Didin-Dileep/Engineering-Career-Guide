import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    department: 'Computer Science',
    year: '3rd Year'
  });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Profile Header */}
          <div className="flex items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-3xl text-white mr-6">
              👤
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-gray-600">{user.department} • {user.year}</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">Email</h3>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">Department</h3>
              <p className="text-gray-600">{user.department}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">Current Year</h3>
              <p className="text-gray-600">{user.year}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">Progress</h3>
              <p className="text-gray-600">75% Complete</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Edit Profile
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}