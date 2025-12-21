import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Ticket } from 'lucide-react';
import authService from '../services/authService';
import Button from './ui/Button';
import { User } from '../types/auth'; // Import User type

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  // Explicitly type the user state
  const [user, setUser] = useState<User | null>(authService.getCurrentUser() as User | null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/home';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Update user state on location change (login/logout)
    const currentUser = authService.getCurrentUser();
    // Ensure the service returns compatible structure or cast it
    setUser(currentUser as User | null);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Bus', path: '/buslist' },
    { name: 'Hotels', path: '/hotels' },
    { name: 'Flights', path: '/plane-list' },
    { name: 'Movies', path: '/qfx/movies' },
    { name: 'Market', path: '/market' },
  ];

  const navbarClasses = `
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled || !isHome ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}
    `;

  const linkClasses = (path: string) => `
        text-sm font-medium transition-colors hover:text-primary
        ${location.pathname === path
      ? 'text-primary font-bold'
      : (scrolled || !isHome ? 'text-gray-700' : 'text-white/90 hover:text-white')}
    `;

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
            T
          </div>
          <span className={`text-xl font-display font-bold ${scrolled || !isHome ? 'text-gray-900' : 'text-white'}`}>
            TicketKatum
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={linkClasses(link.path)}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium ${scrolled || !isHome ? 'text-gray-700' : 'text-white'}`}>
                Hi, {user.firstName || 'User'}
              </span>
              <Link
                to="/my-bookings"
                className={`text-sm font-medium hover:underline ${scrolled || !isHome ? 'text-indigo-600' : 'text-white'}`}
              >
                My Bookings
              </Link>
              <Button
                variant={scrolled || !isHome ? 'ghost' : 'white'}
                size="sm"
                className={!scrolled && isHome ? 'bg-white/10 text-white hover:bg-white/20 border-0' : ''}
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button
                  variant={scrolled || !isHome ? 'ghost' : 'white'}
                  size="sm"
                  className={!scrolled && isHome ? 'bg-white/10 text-white hover:bg-white/20 border-0' : ''}
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-2 ${scrolled || !isHome ? 'text-gray-900' : 'text-white'}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {
        isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl p-4 flex flex-col gap-4 animate-slide-down">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-700 font-medium p-2 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-gray-100 my-2"></div>
            {user ? (
              <>
                <div className="px-2 py-2 text-sm text-gray-500">
                  Signed in as <span className="font-medium text-gray-900">{user.email}</span>
                </div>
                <Link
                  to="/my-bookings"
                  className="text-gray-700 font-medium p-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Ticket size={18} />
                  My Bookings
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" className="w-full justify-center">Register</Button>
                </Link>
              </>
            )}
          </div>
        )
      }
    </nav >
  );
};

export default Navbar;