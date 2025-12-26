import React, { useState, useEffect, useRef } from 'react';
import toast from "react-hot-toast";
import ApiService from '../../services/api.service';
import API_CONFIG from '../../config/api';
import authService from '../../services/authService';

interface SettingsProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

interface FormErrors {
    email?: string;
    newPassword?: string;
    confirmPassword?: string;
    otp?: string;
}

export const Settings: React.FC<SettingsProps> = ({ isDarkMode, toggleDarkMode }) => {
    // Change Password State
    const [email, setEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);

    const otpInputRef = useRef<HTMLInputElement>(null);

    // Load user email if available
    useEffect(() => {
        const userDataStr = localStorage.getItem('userData');
        const userData = userDataStr ? JSON.parse(userDataStr) : {};
        if (userData.email) {
            setEmail(userData.email);
        }
    }, []);

    const validateEmail = (value: string) => {
        return /^\S+@\S+\.\S+$/.test(value);
    };

    const validateAll = (forOtp = false) => {
        const e: FormErrors = {};
        if (!email) e.email = "Email is required";
        else if (!validateEmail(email)) e.email = "Enter a valid email";

        if (!oldPassword) {
            if (!forOtp && (!newPassword || !confirmPassword)) {
                if (!newPassword) e.newPassword = "New password is required";
                if (!confirmPassword) e.confirmPassword = "Please confirm new password";
            }
        } else {
            if (!newPassword) e.newPassword = "New password is required";
            if (!confirmPassword) e.confirmPassword = "Please confirm new password";
        }

        if (newPassword && newPassword.length < 8)
            e.newPassword = "Password must be at least 8 characters";

        if (newPassword && confirmPassword && newPassword !== confirmPassword)
            e.confirmPassword = "Passwords do not match";

        if (forOtp && !otp) e.otp = "OTP is required";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSendOtp = async () => {
        if (!email || !validateEmail(email)) {
            setErrors((s) => ({ ...s, email: !email ? "Email is required" : "Enter a valid email" }));
            return;
        }
        setErrors((s) => ({ ...s, otp: undefined }));

        setIsSendingOtp(true);
        try {
            const response = await ApiService.post(API_CONFIG.ENDPOINTS.SEND_OTP, {
                username: email,
            });

            if (response) {
                toast.success("OTP sent to your email");
                setOtpModalVisible(true);
                setTimeout(() => otpInputRef.current && otpInputRef.current.focus(), 150);
            }
        } catch (error: any) {
            console.error("Error sending OTP:", error);
            const msg = error.message || "OTP sending failed";
            toast.error(msg);
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleChangePassword = async () => {
        if (!validateAll(otpModalVisible)) return;

        const resetPasswordMode = oldPassword ? "CHANGE_PASSWORD" : "RESET_PASSWORD";

        setIsSubmitting(true);
        try {
            const response = await ApiService.post(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
                resetPassword: resetPasswordMode,
                username: email,
                oldPassword: oldPassword || undefined,
                newPassword,
                confirmPassword,
                otp: otp || undefined,
            });

            if (response) {
                toast.success("Password updated successfully!");
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setOtp("");
                setOtpModalVisible(false);
            }
        } catch (error: any) {
            console.error("Error changing password:", error);
            const msg = error.message || "Failed to change password";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account preferences and security</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Appearance Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        Appearance
                    </h3>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark theme for the admin panel</p>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`${isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </button>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Security & Password
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Old Password</label>
                            <div className="relative">
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Leave empty if forgotten"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showOldPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Min. 8 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showNewPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.newPassword && <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showConfirmPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
                        </div>

                        <div className="pt-4">
                            {!oldPassword ? (
                                <button
                                    onClick={handleSendOtp}
                                    disabled={isSendingOtp}
                                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSendingOtp ? "Sending OTP..." : "Send OTP to Email"}
                                </button>
                            ) : (
                                <button
                                    onClick={handleChangePassword}
                                    disabled={isSubmitting}
                                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Updating..." : "Change Password"}
                                </button>
                            )}
                            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                                {!oldPassword ? "Forgot your password? Use OTP to reset it." : "Enter old password to change directly."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Management */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Session Management
                </h3>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Emergency Controls</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Force logout the current user from all devices. This action cannot be undone.
                    </p>
                    <button
                        onClick={async () => {
                            // eslint-disable-next-line no-console
                            console.log('[Settings] Logout All Devices button clicked');
                            if (window.confirm("Are you sure you want to logout from ALL your devices? This will disrupt all your active sessions.")) {
                                // eslint-disable-next-line no-console
                                console.log('[Settings] User confirmed logout action');
                                try {
                                    // eslint-disable-next-line no-console
                                    console.log('[Settings] Calling authService.logoutAllDevices()');
                                    const success = await authService.logoutAllDevices();
                                    // eslint-disable-next-line no-console
                                    console.log('[Settings] Logout result:', success);
                                    if (success) {
                                        toast.success("All devices logged out successfully");
                                        // Optionally redirect to login after logging out all devices
                                        setTimeout(() => window.location.href = '/admin/login', 1500);
                                    } else {
                                        toast.error("Failed to logout devices");
                                    }
                                } catch (e) {
                                    // eslint-disable-next-line no-console
                                    console.error('[Settings] Exception during logout:', e);
                                    toast.error("An error occurred");
                                }
                            } else {
                                // eslint-disable-next-line no-console
                                console.log('[Settings] User cancelled logout action');
                            }
                        }}
                        className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors text-sm font-medium"
                    >
                        Logout All My Devices
                    </button>
                </div>
            </div>

            {/* OTP Modal */}
            {otpModalVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verify OTP</h3>
                            <button
                                onClick={() => setOtpModalVisible(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            We sent a verification code to <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
                        </p>

                        <input
                            ref={otpInputRef}
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-2"
                        />
                        {errors.otp && <p className="text-sm text-red-500 mb-4">{errors.otp}</p>}

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button
                                onClick={() => setOtpModalVisible(false)}
                                className="py-2 px-4 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={isSubmitting}
                                className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? "Verifying..." : "Verify & Change"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;
