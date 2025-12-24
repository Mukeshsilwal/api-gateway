import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import CommandPalette from './CommandPalette';
import authService from '../../services/authService';

const AdminLayout: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('dashboard');

    const navigate = useNavigate();
    const location = useLocation();

    // Sync active tab with URL
    useEffect(() => {
        const path = location.pathname.split('/')[2] || 'dashboard';
        setActiveTab(path);
    }, [location]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCommandPaletteOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/admin/login');
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans ${isDarkMode ? 'dark' : ''}`}>
            <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => navigate(`/admin/${tab}`)}
                onLogout={handleLogout}
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <div className={`transition-all duration-300 flex flex-col min-h-screen ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
                <Header
                    onSearch={() => setIsCommandPaletteOpen(true)}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                    onProfileSettings={() => navigate('/admin/settings')}
                />

                <main className="flex-1 p-6 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>

            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
            />
        </div>
    );
};

export default AdminLayout;
