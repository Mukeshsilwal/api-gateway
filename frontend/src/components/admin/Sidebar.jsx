import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    LayoutDashboard,
    Users,
    Shield,
    Bus,
    Map,
    Hotel,
    Film,
    Ticket,
    FileText,
    Activity,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    Calendar,
    LifeBuoy
} from 'lucide-react';
import authService from '../../services/authService';

export function Sidebar({ activeTab, setActiveTab, onLogout, isCollapsed, onToggle }) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogoutClick = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await onLogout();
        } catch (error) {
            console.error("Logout failed", error);
            setIsLoggingOut(false);
        }
    };

    const userRole = authService.getRoleDisplayName();
    const userData = authService.getUserData() || {};

    const menuGroups = [
        {
            title: "Overview",
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
            ]
        },
        {
            title: "User Management",
            items: [
                { id: 'users', label: 'Users', icon: Users },
                { id: 'roles', label: 'Roles & Permissions', icon: Shield }
            ]
        },
        {
            title: "Operations",
            items: [
                { id: 'buses', label: 'Bus Manager', icon: Bus },
                { id: 'routes', label: 'Route Manager', icon: Map },
                { id: 'events', label: 'Event Manager', icon: Calendar },
                { id: 'hotels', label: 'Hotel Manager', icon: Hotel },
                { id: 'cinemas', label: 'Cinema Manager', icon: Film },
                { id: 'tickets', label: 'Ticket Manager', icon: Ticket },
                { id: 'scheduler', label: 'Trip Scheduler', icon: Calendar }
            ]
        },
        {
            title: "Support",
            items: [
                { id: 'support', label: 'Support Dashboard', icon: LifeBuoy }
            ]
        },
        {
            title: "Governance",
            items: [
                { id: 'audit', label: 'Audit Logs', icon: Activity },
                { id: 'reports', label: 'Reports', icon: FileText }
            ]
        },
        {
            title: "App Configuration",
            items: [
                { id: 'settings', label: 'General Settings', icon: Settings }
            ]
        },
        {
            title: "System Controls",
            items: [
                { id: 'health', label: 'System Health', icon: Activity }
            ]
        }
    ];

    return (
        <div
            className={`${isCollapsed ? 'w-20' : 'w-72'} bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col z-20 transition-all duration-300 ease-in-out border-r border-slate-800 shadow-xl`}
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
                <div className={`flex items-center gap-2 font-bold text-xl tracking-tight transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-white">A</span>
                    </div>
                    <span className="whitespace-nowrap">Admin</span>
                </div>
                <button
                    onClick={onToggle}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                    {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* User Profile */}
            <div className={`border-b border-slate-800 bg-slate-800/50 transition-all duration-300 overflow-hidden ${isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100 p-4'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
                        {(userData.name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{userData.name || 'Admin User'}</p>
                        <p className="text-xs text-slate-400 truncate">{userRole}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
                {menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        <h3 className={`px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'h-0 opacity-0 mb-0' : 'h-auto opacity-100'}`}>
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${activeTab === item.id
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <item.icon size={20} className={`shrink-0 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'} transition-colors`} />

                                    <span className={`font-medium text-sm text-left transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 flex-1'}`}>
                                        {item.label}
                                    </span>

                                    {/* Active Indicator for Collapsed Mode */}
                                    {isCollapsed && activeTab === item.id && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 shrink-0">
                <button
                    onClick={handleLogoutClick}
                    disabled={isLoggingOut}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''} ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Logout"
                >
                    <LogOut size={20} className={isLoggingOut ? 'animate-pulse' : ''} />
                    <span className={`font-medium text-sm transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </span>
                </button>
            </div>
        </div>
    );
}

Sidebar.propTypes = {
    activeTab: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    isCollapsed: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired
};
