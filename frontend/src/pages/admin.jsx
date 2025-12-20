import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../services/authService";
import { Sidebar } from "../components/admin/Sidebar";
import { Header } from "../components/admin/Header";
import { Dashboard } from "../components/admin/Dashboard";
import { BusManager } from "../components/admin/BusManager";
import { RouteManager } from "../components/admin/RouteManager";
import { TicketManager } from "../components/admin/TicketManager";
import { AdminRequestManager } from "../components/admin/AdminRequestManager";
import { HotelManager } from "../components/admin/HotelManager";
import { CinemaManager } from "../components/admin/CinemaManager";
import { Settings } from "../components/admin/Settings";
import TripScheduler from "../components/admin/TripScheduler";
import TicketingDashboard from "../components/admin/ticketing/TicketingDashboard";
import RoomMaintenancePage from "../components/admin/maintenance/RoomMaintenancePage";
import UserManagement from "../components/admin/UserManagement";

export function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/admin/login");
    }
  }, [navigate]);

  async function handleLogout() {
    await authService.logout();
    navigate("/admin/login");
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'buses':
        return <BusManager />;
      case 'routes':
        return <RouteManager />;
      case 'tickets':
        return <TicketManager />;
      case 'requests':
        return <AdminRequestManager />;
      case 'hotels':
        return <HotelManager />;
      case 'cinemas':
        return <CinemaManager />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <Settings isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
      case 'scheduler':
        return <TripScheduler />;
      case 'support':
        return <TicketingDashboard />;
      case 'room-maintenance':
        return <RoomMaintenancePage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className={`flex-1 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'} transition-all duration-300 flex flex-col`}>
        <Header
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onProfileSettings={() => setActiveTab('settings')}
        />

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}