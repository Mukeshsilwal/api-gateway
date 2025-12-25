import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Ticket, Sun, Moon, ShoppingCart } from 'lucide-react';
import authService from '../services/authService';
import Button from './ui/Button';
import { User } from '../types/auth'; // Import User type
import { useUnifiedBookingCart } from '../hooks/useUnifiedBookingCart';
import { CartDrawer } from './unified-booking/CartDrawer';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as 'light' | 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Explicitly type the user state
  const [user, setUser] = useState<User | null>(authService.getCurrentUser() as User | null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/home';
  const { itemCount, totalAmount } = useUnifiedBookingCart();

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

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Bus', path: '/buslist' },
    { name: 'Hotels', path: '/hotels' },
    { name: 'Events', path: '/events' },
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
      : 'text-gray-700 hover:text-purple-600'}
    `;

  return (
    <>
      <nav className={navbarClasses}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <span className={`text-xl font-display font-bold text-gray-900`}>
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

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full transition-colors hover:bg-gray-100 text-gray-700"
              aria-label="Open cart"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors hover:bg-gray-100 text-gray-700`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className={`text-sm font-medium text-gray-700`}>
                  Hi, {user.firstName || 'User'}
                </span>
                <Link
                  to="/my-bookings"
                  className={`text-sm font-medium hover:underline text-indigo-600`}
                >
                  My Bookings
                </Link>
                <Link
                  to="/trips"
                  className={`text-sm font-medium hover:underline text-orange-600`}
                >
                  My Trips
                </Link>
                <Link
                  to="/alerts"
                  className={`text-sm font-medium hover:underline text-red-600`}
                >
                  Alerts
                </Link>
                <Button
                  variant={'ghost'}
                  size="sm"
                  className={''}
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
                    variant={'ghost'}
                    size="sm"
                    className={'text-gray-700 hover:bg-gray-100'}
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
            className={`md:hidden p-2 text-gray-900`}
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
              <button
                onClick={() => { toggleTheme(); setIsOpen(false); }}
                className="flex items-center gap-2 text-gray-700 font-medium p-2 hover:bg-gray-50 rounded-lg"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
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
                  <Link
                    to="/trips"
                    className="text-gray-700 font-medium p-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    My Trips
                  </Link>
                  <Link
                    to="/alerts"
                    className="text-gray-700 font-medium p-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Alerts
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
      </nav>

      {/* Unified Booking Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
