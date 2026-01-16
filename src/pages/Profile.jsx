import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, get } from 'firebase/database';
import { auth, db, database } from '../firebase';
import { requestNotificationPermission, scheduleStudyReminders } from '../utils/notifications';
import { trackProgressMilestone } from '../utils/analytics';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', department: '', year: '' });
  const [overallProgress, setOverallProgress] = useState(0);
  const [yearProgress, setYearProgress] = useState({ year1: 0, year2: 0, year3: 0, year4: 0 });
  const [completedTopics, setCompletedTopics] = useState(0);
  const [totalTopics] = useState(33);
  const [currentYearProgress, setCurrentYearProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = { ...userDoc.data(), email: currentUser.email, uid: currentUser.uid };
            setUser(userData);
            setFormData({ name: userData.name, department: userData.department, year: userData.year });
          } else {
            const userData = { email: currentUser.email, name: currentUser.email.split('@')[0], department: 'Not Set', year: 'Not Set', progress: 0, uid: currentUser.uid };
            setUser(userData);
            setFormData({ name: userData.name, department: userData.department, year: userData.year });
          }
          await loadProgress(currentUser.uid);
          
          // Setup notifications and analytics
          requestNotificationPermission();
          scheduleStudyReminders();
        } catch (error) {
          console.error('Error fetching user:', error);
          const userData = { email: currentUser.email, name: currentUser.email.split('@')[0], department: 'Not Set', year: 'Not Set', progress: 0, uid: currentUser.uid };
          setUser(userData);
          setFormData({ name: userData.name, department: userData.department, year: userData.year });
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadProgress = async (userId) => {
    try {
      const progressRef = ref(database, `progress/${userId}/topics`);
      const snapshot = await get(progressRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        let totalProgress = 0;
        let completed = 0;
        const yearData = { year1: [], year2: [], year3: [], year4: [] };
        
        Object.keys(data).forEach(topicId => {
          const progress = data[topicId].progress || 0;
          totalProgress += progress;
          if (progress >= 100) completed++;
          
          const id = parseInt(topicId);
          if (id >= 1 && id <= 8) yearData.year1.push(progress);
          else if (id >= 9 && id <= 16) yearData.year2.push(progress);
          else if (id >= 17 && id <= 24) yearData.year3.push(progress);
          else if (id >= 25 && id <= 33) yearData.year4.push(progress);
        });
        
        const overall = Math.round(totalProgress / totalTopics);
        setOverallProgress(overall);
        setCompletedTopics(completed);
        
        // Track progress milestones
        trackProgressMilestone(overall);
        
        setYearProgress({
          year1: yearData.year1.length ? Math.round(yearData.year1.reduce((a, b) => a + b, 0) / 8) : 0,
          year2: yearData.year2.length ? Math.round(yearData.year2.reduce((a, b) => a + b, 0) / 8) : 0,
          year3: yearData.year3.length ? Math.round(yearData.year3.reduce((a, b) => a + b, 0) / 8) : 0,
          year4: yearData.year4.length ? Math.round(yearData.year4.reduce((a, b) => a + b, 0) / 9) : 0
        });
        
        // Calculate current year progress
        const userYear = user?.year || formData.year;
        if (userYear) {
          const yearKey = `year${userYear}`;
          const currentProgress = {
            year1: yearData.year1.length ? Math.round(yearData.year1.reduce((a, b) => a + b, 0) / 8) : 0,
            year2: yearData.year2.length ? Math.round(yearData.year2.reduce((a, b) => a + b, 0) / 8) : 0,
            year3: yearData.year3.length ? Math.round(yearData.year3.reduce((a, b) => a + b, 0) / 8) : 0,
            year4: yearData.year4.length ? Math.round(yearData.year4.reduce((a, b) => a + b, 0) / 9) : 0
          };
          setCurrentYearProgress(currentProgress[yearKey] || 0);
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), formData);
      setUser({ ...user, ...formData });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('isLoggedIn');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
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
    <div className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Overall Progress Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">Overall Learning Progress</h2>
            <p className="text-blue-100">Your complete 4-year journey</p>
          </div>
          
          <div className="flex justify-center items-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.2)" strokeWidth="16" fill="none" />
                <circle cx="96" cy="96" r="88" stroke="white" strokeWidth="16" fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - overallProgress / 100)}`}
                  className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold">{overallProgress}%</div>
                  <div className="text-sm text-blue-100">Complete</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold">{completedTopics}</div>
              <div className="text-sm text-blue-100">Topics Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold">{totalTopics - completedTopics}</div>
              <div className="text-sm text-blue-100">Topics Remaining</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold">{Math.round((completedTopics / totalTopics) * 100)}%</div>
              <div className="text-sm text-blue-100">Completion Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold">{totalTopics}</div>
              <div className="text-sm text-blue-100">Total Topics</div>
            </div>
          </div>
        </div>

        {/* Year-wise Progress */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { year: 'Year 1', progress: yearProgress.year1, color: 'from-green-400 to-green-600', topics: 8 },
            { year: 'Year 2', progress: yearProgress.year2, color: 'from-blue-400 to-blue-600', topics: 8 },
            { year: 'Year 3', progress: yearProgress.year3, color: 'from-purple-400 to-purple-600', topics: 8 },
            { year: 'Year 4', progress: yearProgress.year4, color: 'from-orange-400 to-orange-600', topics: 9 }
          ].map((item, index) => (
            <div key={index} className={`bg-gradient-to-br ${item.color} rounded-2xl shadow-lg p-6 text-white`}>
              <h3 className="text-xl font-bold mb-4">{item.year}</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.3)" strokeWidth="12" fill="none" />
                  <circle cx="64" cy="64" r="56" stroke="white" strokeWidth="12" fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - item.progress / 100)}`}
                    className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-3xl font-bold">{item.progress}%</div>
                </div>
              </div>
              <p className="text-center text-sm opacity-90">{item.topics} Topics</p>
            </div>
          ))}
        </div>

        {/* Profile Info Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          {/* Profile Header */}
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="absolute -top-16 left-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-5xl text-white border-8 border-white shadow-xl">
                👤
              </div>
            </div>
            
            {/* Edit Button */}
            <div className="flex justify-end pt-4">
              {!editing && (
                <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl">
                  ✏️ Edit Profile
                </button>
              )}
            </div>
            
            {/* User Info */}
            <div className="mt-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{user?.name || 'User'}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-6">
                <span className="flex items-center gap-2">
                  🎓 {user?.department || 'Not Set'}
                </span>
                <span className="flex items-center gap-2">
                  📅 Year {user?.year || 'Not Set'}
                </span>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                  <div className="text-3xl font-bold text-blue-600">{completedTopics}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                  <div className="text-3xl font-bold text-purple-600">{totalTopics - completedTopics}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl">
                  <div className="text-3xl font-bold text-pink-600">{overallProgress}%</div>
                  <div className="text-sm text-gray-600">Overall</div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    📧
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-semibold text-gray-800">{user?.email || 'Not available'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Full Name</div>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="font-semibold text-gray-800">{user?.name || 'Not Set'}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                    🎓
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Department</div>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="font-semibold text-gray-800">{user?.department || 'Not Set'}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                    📅
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Current Year</div>
                    {editing ? (
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    ) : (
                      <div className="font-semibold text-gray-800">Year {user?.year || 'Not Set'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                {editing ? (
                  <>
                    <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold">
                      ✅ Save Changes
                    </button>
                    <button onClick={() => setEditing(false)} className="flex-1 bg-gray-500 text-white px-6 py-4 rounded-xl hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl font-semibold">
                      ❌ Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {/* Generate Resume Button - Shows when overall progress >= 2% (testing) */}
                    {overallProgress >= 2 ? (
                      <button 
                        onClick={() => navigate('/resume-builder')}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2"
                      >
                        📄 Generate Resume
                      </button>
                    ) : (
                      <div className="flex-1 bg-gray-100 border-2 border-dashed border-gray-300 px-6 py-4 rounded-xl text-center">
                        <div className="text-gray-500 font-semibold mb-1">🔒 Resume Locked</div>
                        <div className="text-sm text-gray-400">
                          Complete {2 - overallProgress}% more overall progress to unlock
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={handleLogout}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                    >
                      🚪 Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


