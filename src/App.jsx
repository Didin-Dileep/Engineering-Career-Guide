import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Department from './pages/Department'
import Year from './pages/Year'
import Roadmap from './pages/Roadmap'
import Profile from './pages/Profile'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-lavender-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/department" element={<Department />} />
            <Route path="/year" element={<Year />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}