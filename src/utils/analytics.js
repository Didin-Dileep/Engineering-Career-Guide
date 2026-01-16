import { getAnalytics, logEvent } from 'firebase/analytics';
import { auth } from '../firebase';

// Initialize analytics only in browser environment
let analytics = null;
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
    analytics = getAnalytics(app);
  } catch (error) {
    console.log('Analytics not available:', error);
  }
}

// Track user actions
export const trackEvent = (eventName, parameters = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, parameters);
  }
};

// Specific tracking functions
export const trackTopicStarted = (topicId, topicName) => {
  trackEvent('topic_started', {
    topic_id: topicId,
    topic_name: topicName
  });
};

export const trackTopicCompleted = (topicId, topicName, timeSpent) => {
  trackEvent('topic_completed', {
    topic_id: topicId,
    topic_name: topicName,
    time_spent_minutes: Math.round(timeSpent / 60)
  });
};

export const trackQuizCompleted = (topicId, score, totalQuestions) => {
  trackEvent('quiz_completed', {
    topic_id: topicId,
    score: score,
    total_questions: totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100)
  });
};

export const trackChatbotUsed = (question, responseTime) => {
  trackEvent('chatbot_used', {
    question_length: question.length,
    response_time_ms: responseTime
  });
};

export const trackProgressMilestone = (overallProgress) => {
  const milestones = [25, 50, 75, 100];
  const milestone = milestones.find(m => overallProgress >= m && overallProgress < m + 5);
  
  if (milestone) {
    trackEvent('progress_milestone', {
      milestone_percentage: milestone
    });
  }
};


