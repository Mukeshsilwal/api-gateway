import React, { useState } from 'react';

interface Notification {
    id: number;
    title: string;
    time: string;
    unread: boolean;
}

interface HeaderProps {
    onSearch?: (query: string) => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    onProfileSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, isDarkMode, toggleDarkMode, onProfileSettings }) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const [showProfile, setShowProfile] = useState<boolean>(false);

    const notifications: Notification[] = [
        { id: 1, title: 'New booking received', time: '5 min ago', unread: true },
        { id: 2, title: 'Admin request pending', time: '1 hour ago', unread: true },
        { id: 3, title: 'Route updated successfully', time: '2 hours ago', unread: false },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch) onSearch(searchQuery);
    };

    return (
        <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-slate-800 sticky top-0 z-10 shadow-sm transition-colors duration-300">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-gray-50 dark:bg-slate-800 placeholder-gray-400 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                                placeholder="Search buses, routes, tickets..."
                            />
                        </div>
                    </form>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-gray-200/60 dark:border-slate-700/60"
                            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDarkMode ? (
                                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden z-50">
                                    <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                        <p className="text-sm text-gray-600 dark:text-slate-400">{unreadCount} unread</p>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
                                        {notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${notif.unread ? 'bg-purple-50/30 dark:bg-purple-950/20' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {notif.unread && (
                                                        <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full mt-2" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{notif.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-slate-800/60 text-center border-t border-gray-100 dark:border-slate-800">
                                        <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                                            View all notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfile(!showProfile)}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                                    A
                                </div>
                                <svg className="w-4 h-4 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showProfile && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden z-50">
                                    <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80">
                                        <p className="font-semibold text-gray-900 dark:text-white">Admin User</p>
                                        <p className="text-sm text-gray-600 dark:text-slate-400">admin@ticketkatum.com</p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                if (onProfileSettings) onProfileSettings();
                                                setShowProfile(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Profile Settings
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (onProfileSettings) onProfileSettings();
                                                setShowProfile(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Settings
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
