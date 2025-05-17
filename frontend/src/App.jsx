import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AllEvents from './pages/AllEvents'
import EventDetails from './pages/EventDetails'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import AddEvent from './pages/AddEvent'

function App() {
  return (
    <Router>
      <div>
        <header className="sticky top-0 z-50 flex items-center justify-between px-10 py-5 bg-white/80 backdrop-blur-md shadow-lg rounded-b-3xl border-b-4 border-pink-200">
          <div className="flex items-center gap-3">
            <img src={reactLogo} alt="Logo" className="w-12 h-12 drop-shadow-md" />
            <span className="text-3xl font-extrabold tracking-wide text-pink-700 font-cursive flex items-center gap-2">
              <span role="img" aria-label="party">🎀</span> Eventify
            </span>
          </div>
          <nav className="flex items-center gap-10">
            <a href="/" className="text-lg font-semibold text-pink-600 hover:text-pink-800 transition-colors duration-150 underline-offset-4 hover:underline">Home</a>
            <a href="/events" className="text-lg font-semibold text-pink-600 hover:text-pink-800 transition-colors duration-150 underline-offset-4 hover:underline">All Events</a>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<AllEvents />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/add-event" element={<AddEvent />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
