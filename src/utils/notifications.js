import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { auth } from '../firebase';

// Initialize messaging only in browser environment
let messaging = null;
if (typeof window !== 'undefined') {
  try {
    const { initializeApp } = await import('firebase/app');
    const firebaseConfig = {
      apiKey: "AIzaSyDj9au717SrZXS11jmlAnLYXO6CxnbHLO8",
      authDomain: "career-roadmap-e7b2c.firebaseapp.com",
      projectId: "career-roadmap-e7b2c",
      appId: "1:1078476909848:web:aea270ff372812ec79426d",
      measurementId: "G-Y3KE7BK3WX"
    };
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Messaging not available:', error);
  }
}

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // Get from Firebase Console
      });
      console.log('FCM Token:', token);
      return token;
    }
  } catch (error) {
    console.error('Notification permission error:', error);
  }
};

// Listen for foreground messages
export const setupNotificationListener = () => {
  if (!messaging) return;
  
  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: '/favicon.ico'
    });
  });
};

// Study reminder notifications
export const scheduleStudyReminders = () => {
  // Daily reminder at 7 PM
  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(19, 0, 0, 0);
  
  if (reminderTime <= now) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }
  
  const timeUntilReminder = reminderTime.getTime() - now.getTime();
  
  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('📚 Study Time!', {
        body: 'Continue your learning journey. You\'re doing great!',
        icon: '/favicon.ico'
      });
    }
    
    // Schedule next day
    scheduleStudyReminders();
  }, timeUntilReminder);
};


