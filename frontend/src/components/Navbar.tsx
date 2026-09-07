import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Ticket, Sun, Moon, ShoppingCart } from 'lucide-react';
import authService from '../services/authService';
import Button from './ui/Button';
import { User } from '../types/auth'; // Import User type
import { useUnifiedBookingCart } from '../hooks/useUnifiedBookingCart';
import { CartDrawer } from './unified-booking/CartDrawer';
import { useTheme } from '../context/ThemeContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const { theme, toggleTheme } = useTheme();

  // Explicitly type the user state
  const [user, setUser] = useState<User | null>(authService.getCurrentUser() as User | null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/home';
  const { itemCount, totalAmount } = useUnifiedBookingCart();

  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine if scrolled more than threshold
      setScrolled(currentScrollY > 20);

      // Smart sticky logic
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & passed threshold -> Hide
        setIsVisible(false);
      } else {
        // Scrolling up -> Show
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Update user state on location change (login/logout)
    const currentUser = authService.getCurrentUser();
    // Ensure the service returns compatible structure or cast it
    setUser(currentUser as User | null);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location, lastScrollY]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Buses', path: '/buslist' },
    { name: 'Hotels', path: '/hotels' },
    { name: 'Flights', path: '/plane-list' },
    { name: 'Events', path: '/events' },
    { name: 'Market', path: '/market' },
  ];

  const navbarClasses = `
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        ${scrolled || !isHome
      ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-md border-b border-slate-200/80 dark:border-slate-800 py-3'
      : 'bg-transparent py-5'}
    `;

  const linkClasses = (path: string) => `
    font-semibold text-sm transition-all duration-200 px-3 py-1.5 rounded-xl
    ${location.pathname === path
      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 font-bold'
      : 'text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
    }
  `;

  return (
    <>
      <nav className={navbarClasses}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-orange-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 group-hover:shadow-purple-500/25 transition-all">
              <Ticket size={20} className="transform -rotate-12" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-black tracking-tight text-gray-900 dark:text-white leading-none">
                Ticket<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-500 to-purple-600">Katum</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-bold text-gray-400 dark:text-gray-500">Nepal Travel</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
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
              className="relative p-2 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
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
              className="p-2 rounded-xl transition-all duration-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700"
              aria-label="Toggle dark/light theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} className="text-slate-700" />}
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Hi, {user.firstName || 'User'}
                </span>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium hover:underline text-purple-600 dark:text-purple-400"
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-bookings"
                  className="text-sm font-medium hover:underline text-indigo-600 dark:text-indigo-400"
                >
                  My Bookings
                </Link>
                <Link
                  to="/trips"
                  className="text-sm font-medium hover:underline text-orange-600 dark:text-orange-400"
                >
                  My Trips
                </Link>
                <Link
                  to="/alerts"
                  className="text-sm font-medium hover:underline text-red-600 dark:text-red-400"
                >
                  Alerts
                </Link>
                <Button
                  variant={'ghost'}
                  size="sm"
                  className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
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
                    className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
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
            className="md:hidden p-2 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {
          isOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shadow-2xl p-4 flex flex-col gap-3 animate-slide-down">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-slate-700 dark:text-slate-200 font-semibold p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-1"></div>
              <button
                onClick={() => { toggleTheme(); setIsOpen(false); }}
                className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-semibold p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-1"></div>
              {user ? (
                <>
                  <div className="px-2.5 py-1.5 text-sm text-slate-500 dark:text-slate-400">
                    Signed in as <span className="font-semibold text-slate-900 dark:text-white">{user.email}</span>
                  </div>
                  <Link
                    to="/dashboard"
                    className="text-slate-700 dark:text-slate-200 font-semibold p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Ticket size={18} className="text-purple-600 dark:text-purple-400" />
                    Dashboard
                  </Link>
                  <Link
                    to="/my-bookings"
                    className="text-slate-700 dark:text-slate-200 font-semibold p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Ticket size={18} />
                    My Bookings
                  </Link>
                  <Link
                    to="/trips"
                    className="text-slate-700 dark:text-slate-200 font-semibold p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    My Trips
                  </Link>
                  <Link
                    to="/alerts"
                    className="text-slate-700 dark:text-slate-200 font-semibold p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Alerts
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-center text-red-600 border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/30"
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
