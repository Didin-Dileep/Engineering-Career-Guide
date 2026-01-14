import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', department: '', year: '' });
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Profile Header */}
          <div className="flex items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-3xl text-white mr-6">
              👤
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{user?.name || 'User'}</h1>
              <p className="text-gray-600">{user?.department || 'Not Set'} • {user?.year || 'Not Set'}</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">Email</h3>
              <p className="text-gray-600">{user?.email || 'Not available'}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">Name</h3>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              ) : (
                <p className="text-gray-600">{user?.name || 'Not Set'}</p>
              )}
            </div>
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">Department</h3>
              {editing ? (
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              ) : (
                <p className="text-gray-600">{user?.department || 'Not Set'}</p>
              )}
            </div>
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">Current Year</h3>
              {editing ? (
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              ) : (
                <p className="text-gray-600">{user?.year || 'Not Set'}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {editing ? (
              <>
                <button onClick={handleSave} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                  Save Changes
                </button>
                <button onClick={() => setEditing(false)} className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Edit Profile
              </button>
            )}
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