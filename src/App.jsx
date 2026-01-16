import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Department from './pages/Department'
import Year from './pages/Year'
import Roadmap from './pages/Roadmap'
import Learn from './pages/Learn'
import Profile from './pages/Profile'
import ChatPage from './pages/ChatPage'
import ResumeBuilder from './pages/ResumeBuilder'
import ResponsiveMentorChat from './components/ResponsiveMentorChat'

export default function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="min-h-screen bg-lavender-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/department" element={<Department />} />
            <Route path="/year" element={<Year />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/learn/:topicId" element={<Learn />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
          </Routes>
        </main>
        <Footer />
        {/* Floating Mentor Chatbot - Available on all pages */}
        <ResponsiveMentorChat />
      </div>
    </Router>
  )
}


