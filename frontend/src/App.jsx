import { useState, useEffect } from 'react'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import apiService from './utils/apiService'
import Home from './pages/Home'
import AllEvents from './pages/AllEvents'
import EventDetails from './pages/EventDetails'
import Contact from './pages/Contact'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import AddEvent from './pages/AddEvent'
import EditEvent from './pages/EditEvent'
import AllOfferings from './pages/AllOfferings'
import CategoryOfferings from './pages/CategoryOfferings'
import ManageOfferings from './pages/ManageOfferings'
import AdminViewOffering from './pages/AdminViewOffering'
import OfferingDetails from './pages/OfferingDetails'
import AddOfferingPage from './pages/AddOfferingPage'
import AdminSettings from './pages/AdminSettings'
import ProtectedRoute from './components/ProtectedRoute'
import authService from './utils/authService'

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalDiscount, setGlobalDiscount] = useState(null);
  const [discountLoaded, setDiscountLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isLoggedIn());
  const [unreadRequestsCount, setUnreadRequestsCount] = useState(0);

  useEffect(() => {
    apiService.get('/api/global-discount')
      .then(data => {
        setGlobalDiscount(Number(data.discount) || 0);
        setDiscountLoaded(true);
      })
      .catch(err => {
        console.error('Failed to fetch global discount:', err);
        setGlobalDiscount(0);
        setDiscountLoaded(true);
      });
    
    const checkAuthStatus = () => setIsAuthenticated(authService.isLoggedIn());
    window.addEventListener('storage', checkAuthStatus);
    checkAuthStatus();
    
    const fetchUnreadRequests = async () => {
      if (isAuthenticated) {
        try {
          const data = await apiService.get('/api/event-requests/unviewed-count', true);
          setUnreadRequestsCount(data.count || 0);
        } catch (error) {
          console.error('Failed to fetch unread requests:', error);
        }
      } else {
        setUnreadRequestsCount(0);
      }
    };
    
    fetchUnreadRequests();
    
    let interval;
    if (isAuthenticated) {
      interval = setInterval(fetchUnreadRequests, 60000);
    }
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated]);

  const publicNavLinks = [
    { href: "/", label: "Home" },
    { href: "/events", label: "All Events" },
    { href: "/offerings", label: "All Offerings" },
    { href: "/contact", label: "Contact" },
  ];
  
  const adminNavLinks = [
    { href: "/admin", label: "Admin Dashboard" },
    { href: "/admin/offerings", label: "Manage Offerings" },
  ];
  
  const navLinks = [...publicNavLinks, ...(isAuthenticated ? adminNavLinks : [])];

  if (!discountLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-sky-400 text-2xl font-bold">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 text-gray-100 font-sans">
        <header className="sticky top-0 z-50 shadow-xl bg-slate-800/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <Link to="/" className="flex items-center gap-3 group">
                <img src={viteLogo} alt="Eventify Logo" className="w-10 h-10 transform group-hover:scale-110 transition-transform duration-300" />
                <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 group-hover:opacity-90 transition-opacity">
                  Eventify
                </span>
              </Link>

              <nav className="hidden md:flex items-center space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-lg font-medium text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-300 relative group"
                  >
                    {link.label}
                    {link.href === "/admin" && unreadRequestsCount > 0 && (
                      <span className="absolute -top-2 -right-4 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {unreadRequestsCount}
                      </span>
                    )}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ))}
                
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      authService.logout();
                      setIsAuthenticated(false);
                      setUnreadRequestsCount(0);
                      window.dispatchEvent(new Event('storage'));
                    }}
                    className="text-lg font-medium text-rose-400 hover:text-rose-300 transition-all duration-300"
                  >
                    Logout
                  </button>
                )}
              </nav>
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-300 hover:text-purple-400 focus:outline-none focus:text-purple-400 transition-colors"
                  aria-label="Toggle menu"
                >
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-0 right-0 bg-slate-800/95 backdrop-blur-md shadow-lg py-4">
              <nav className="flex flex-col items-center space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-300 relative"
                  >
                    {link.label}
                    {link.href === "/admin" && unreadRequestsCount > 0 && (
                      <span className="absolute -top-2 -right-4 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {unreadRequestsCount}
                      </span>
                    )}
                  </Link>
                ))}
                
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      authService.logout();
                      setIsAuthenticated(false);
                      setUnreadRequestsCount(0);
                      setIsMobileMenuOpen(false);
                      window.dispatchEvent(new Event('storage'));
                    }}
                    className="text-lg font-medium text-rose-400 hover:text-rose-300 transition-all duration-300 mt-2"
                  >
                    Logout
                  </button>
                )}
              </nav>
            </div>
          )}
        </header>

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Routes>
            <Route path="/" element={<Home globalDiscount={globalDiscount} />} />
            <Route path="/events" element={<AllEvents />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/offerings" element={<AllOfferings globalDiscount={globalDiscount} />} />
            <Route path="/offerings/:offeringId" element={<OfferingDetails globalDiscount={globalDiscount} />} />
            <Route path="/offerings/category/:name" element={<CategoryOfferings />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/add-event" element={<AddEvent />} />
              <Route path="/admin/edit-event/:id" element={<EditEvent />} />
              <Route path="/admin/offerings" element={<ManageOfferings />} />
              <Route path="/admin/offerings/add" element={<AddOfferingPage />} />
              <Route path="/admin/offerings/:offeringId" element={<AdminViewOffering />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="bg-slate-800/50 border-t border-slate-700 py-8 text-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} Eventify. All rights reserved.</p>
            <p className="text-sm text-gray-500 mt-1">
              Crafted with <span className="text-pink-500 animate-pulse">❤️</span> by Your Name/Company
            </p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
