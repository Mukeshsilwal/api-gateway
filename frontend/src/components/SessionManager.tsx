import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const SessionManager = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentSessionId = authService.getSessionId();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const activeSessions = await authService.getActiveSessions();
            setSessions(activeSessions);
        } catch (error) {
            console.error("Error fetching sessions:", error);
            toast.error("Failed to load active sessions");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutDevice = async (sessionId) => {
        try {
            const success = await authService.logoutDevice(sessionId);
            if (success) {
                toast.success("Device logged out successfully");
                // If current device, redirect to login
                if (sessionId === currentSessionId) {
                    authService.logout();
                    window.location.href = '/login';
                } else {
                    fetchSessions();
                }
            } else {
                toast.error("Failed to logout device");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleLogoutAll = async () => {
        if (!window.confirm("Are you sure you want to logout from all other devices?")) return;

        try {
            const success = await authService.logoutAllDevices();
            if (success) {
                toast.success("Logged out from all other devices");
                fetchSessions();
            } else {
                toast.error("Failed to logout all devices");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Loading sessions...</div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Active Sessions</h2>
                {sessions.length > 1 && (
                    <button
                        onClick={handleLogoutAll}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                        Logout All Other Devices
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {sessions.length === 0 ? (
                    <p className="text-gray-500 text-sm">No active sessions found.</p>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session.sessionId}
                            className={`flex items-center justify-between p-4 rounded-xl border ${session.sessionId === currentSessionId
                                    ? 'bg-indigo-50 border-indigo-200'
                                    : 'bg-gray-50 border-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${session.sessionId === currentSessionId ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900">
                                            {session.deviceInfo || 'Unknown Device'}
                                        </p>
                                        {session.sessionId === currentSessionId && (
                                            <span className="px-2 py-0.5 bg-indigo-200 text-indigo-800 text-xs rounded-full font-semibold">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {session.ipAddress} • {new Date(session.loginTime).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleLogoutDevice(session.sessionId)}
                                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SessionManager;
