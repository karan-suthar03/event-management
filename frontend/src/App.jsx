import {useEffect, useState} from 'react'
import viteLogo from '/vite.svg'
import './App.css'
import {BrowserRouter as Router, Link, Navigate, Route, Routes} from 'react-router-dom'
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
import ManageEvents from './pages/ManageEvents'
import AdminViewOffering from './pages/AdminViewOffering'
import OfferingDetails from './pages/OfferingDetails'
import AddOfferingPage from './pages/AddOfferingPage'
import AdminSettings from './pages/AdminSettings'
import ProtectedRoute from './components/ProtectedRoute'
import AuthGuard from './components/AuthGuard'
import ScrollToTop from './components/ScrollToTop'
import authService from './utils/authService'

function App() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [globalDiscount, setGlobalDiscount] = useState(null);
    const [discountLoaded, setDiscountLoaded] = useState(false);
    const [unreadRequestsCount, setUnreadRequestsCount] = useState(0);

    useEffect(() => {
        // Load global discount
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
    }, []);

    // Function to fetch unread requests count
    const fetchUnreadRequests = async (isAuthenticated) => {
        if (isAuthenticated) {
            try {
                const data = await apiService.get('/api/event-requests/unviewed-count', true);
                setUnreadRequestsCount(data.count || 0);
            } catch (error) {
                console.error('Failed to fetch unread requests:', error);
                setUnreadRequestsCount(0);
            }
        } else {
            setUnreadRequestsCount(0);
        }
    };

    if (!discountLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900 text-sky-400 text-2xl font-bold">
                Loading...
            </div>
        );
    }

    return (
        <Router>
            <AuthGuard>
                {(isAuthenticated) => (
                    <AppContent
                        isAuthenticated={isAuthenticated}
                        globalDiscount={globalDiscount}
                        isMobileMenuOpen={isMobileMenuOpen}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                        unreadRequestsCount={unreadRequestsCount}
                        fetchUnreadRequests={fetchUnreadRequests}
                    />
                )}
            </AuthGuard>
        </Router>
    )
}

function AppContent({
                        isAuthenticated,
                        globalDiscount,
                        isMobileMenuOpen,
                        setIsMobileMenuOpen,
                        unreadRequestsCount,
                        fetchUnreadRequests
                    }) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        // Fetch unread requests when authentication state changes
        fetchUnreadRequests(isAuthenticated);

        // Set up interval for fetching unread requests if authenticated
        let interval;
        if (isAuthenticated) {
            interval = setInterval(() => fetchUnreadRequests(isAuthenticated), 60000);
        }

        // Handle scroll for navigation enhancement
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const newIsScrolled = scrollTop > 20;
            setIsScrolled(newIsScrolled);
        };

        window.addEventListener('scroll', handleScroll);

        // Handle token invalidation events
        const handleTokenInvalid = () => {
            fetchUnreadRequests(false);
            authService.logout();
        };

        const handleAuthStateChange = () => {
            // Re-fetch unread requests when auth state changes
            setTimeout(() => fetchUnreadRequests(isAuthenticated), 100);
        };

        window.addEventListener('authTokenInvalid', handleTokenInvalid);
        window.addEventListener('authStateChanged', handleAuthStateChange);

        return () => {
            if (interval) clearInterval(interval);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('authTokenInvalid', handleTokenInvalid);
            window.removeEventListener('authStateChanged', handleAuthStateChange);
        };
    }, [isAuthenticated, fetchUnreadRequests]);

    // Handle mobile menu body class
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }

        return () => {
            document.body.classList.remove('menu-open');
        };
    }, [isMobileMenuOpen]);

    const publicNavLinks = [
        {href: "/", label: "Home"},
        {href: "/events", label: "All Events"},
        {href: "/offerings", label: "All Offerings"},
        {href: "/contact", label: "Contact"},
    ];

    const adminNavLinks = [
        {href: "/admin", label: "Admin Dashboard"},
        {href: "/admin/offerings", label: "Manage Offerings"},
    ];

    const navLinks = [...publicNavLinks, ...(isAuthenticated ? adminNavLinks : [])];

    return (
        <div
            className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 text-gray-100 font-sans">
            {/* Mobile menu overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? 'bg-slate-800/98 backdrop-blur-lg border-b-2 border-sky-500/50 shadow-2xl'
                    : 'bg-slate-800/95 backdrop-blur-lg border-b border-slate-700/30 shadow-xl'
            }`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full overflow-hidden">
                    <div className="flex items-center justify-between h-20">
                        <Link to="/" className="relative z-[60] flex items-center gap-3 group">
                            <img src={viteLogo} alt="Eventify Logo"
                                 className="w-10 h-10 transform group-hover:scale-110 transition-transform duration-300"/>
                            <span
                                className="text-3xl md:text-3xl sm:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 group-hover:opacity-90 transition-opacity">
                Eventify
              </span>
                        </Link>

                        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className="cursor-pointer hover:-translate-y-px active:scale-[0.98] transition-all duration-200 relative whitespace-nowrap text-lg font-medium text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r from-purple-400 to-pink-500 group px-2 py-1 hover:drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]"
                                >
                                    {link.label}
                                    {link.href === "/admin" && unreadRequestsCount > 0 && (
                                        <span
                                            className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {unreadRequestsCount}
                    </span>
                                    )}
                                    <span
                                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                                </Link>
                            ))}

                            {isAuthenticated && (
                                <button
                                    onClick={async () => {
                                        authService.logout();
                                        fetchUnreadRequests(false);
                                        window.dispatchEvent(new CustomEvent('authStateChanged'));
                                    }}
                                    className="cursor-pointer hover:-translate-y-px active:scale-[0.98] transition-all duration-200 text-lg font-medium text-rose-400 hover:text-rose-300 px-2 py-1"
                                >
                                    Logout
                                </button>
                            )}
                        </nav>
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="cursor-pointer hover:-translate-y-px active:scale-[0.98] transition-all duration-200 text-gray-300 hover:text-purple-400 focus:outline-none focus:text-purple-400 p-2"
                                aria-label="Toggle menu"
                            >
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"/>
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M4 6h16M4 12h16m-7 6h7"/>
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div
                        className="mobile-menu md:hidden absolute top-20 left-0 right-0 bg-slate-800/98 backdrop-blur-md py-6 z-50 border-b border-slate-700/50 max-h-[calc(100vh-80px)] overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.25)]">
                        <nav className="flex flex-col items-center space-y-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="cursor-pointer hover:-translate-y-px active:scale-[0.98] transition-all duration-200 text-xl font-medium text-gray-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r from-purple-400 to-pink-500 relative px-6 py-2 rounded-lg hover:bg-slate-700/30"
                                >
                                    {link.label}
                                    {link.href === "/admin" && unreadRequestsCount > 0 && (
                                        <span
                                            className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {unreadRequestsCount}
                    </span>
                                    )}
                                </Link>
                            ))}

                            {isAuthenticated && (
                                <button
                                    onClick={async () => {
                                        authService.logout();
                                        fetchUnreadRequests(false);
                                        setIsMobileMenuOpen(false);
                                        window.dispatchEvent(new CustomEvent('authStateChanged'));
                                    }}
                                    className="cursor-pointer hover:-translate-y-px active:scale-[0.98] transition-all duration-200 text-xl font-medium text-rose-400 hover:text-rose-300 mt-4 px-6 py-2 rounded-lg hover:bg-slate-700/30"
                                >
                                    Logout
                                </button>
                            )}
                        </nav>
                    </div>
                )}
            </header>

            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
                <ScrollToTop/>
                <Routes>
                    <Route path="/" element={<Home globalDiscount={globalDiscount}/>}/>
                    <Route path="/events" element={<AllEvents/>}/>
                    <Route path="/events/:id" element={<EventDetails/>}/>
                    <Route path="/offerings" element={<AllOfferings globalDiscount={globalDiscount}/>}/>
                    <Route path="/offerings/:offeringId" element={<OfferingDetails globalDiscount={globalDiscount}/>}/>
                    <Route path="/offerings/category/:name" element={<CategoryOfferings/>}/>
                    <Route path="/contact" element={<Contact/>}/>
                    <Route path="/login" element={<Login/>}/>

                    <Route element={<ProtectedRoute/>}>
                        <Route path="/admin" element={<AdminDashboard/>}/>
                        <Route path="/admin/add-event" element={<AddEvent/>}/>
                        <Route path="/admin/edit-event/:id" element={<EditEvent/>}/>
                        <Route path="/admin/events" element={<ManageEvents/>}/>
                        <Route path="/admin/offerings" element={<ManageOfferings/>}/>
                        <Route path="/admin/offerings/add" element={<AddOfferingPage/>}/>
                        <Route path="/admin/offerings/:offeringId" element={<AdminViewOffering/>}/>
                        <Route path="/admin/settings" element={<AdminSettings/>}/>
                    </Route>

                    <Route path="*" element={<Navigate to="/"/>}/>
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
    );
}

export default App
