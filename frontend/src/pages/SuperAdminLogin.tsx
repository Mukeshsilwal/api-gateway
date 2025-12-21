import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API_CONFIG from "../config/api";
import apiService from "../services/api.service";
import authService, { ROLES } from "../services/authService";

export default function SuperAdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/super-admin/panel";

    useEffect(() => {
        // Check if already logged in
        if (authService.isAuthenticated() && authService.hasRole([ROLES.SUPER_ADMIN])) {
            const defaultRedirect = authService.getDefaultRedirect();
            // Need to check for super-admin panel as generic too, just in case
            const isGenericRedirect = from === '/' || from === '/home' || from === '/admin/panel';
            const redirectPath = isGenericRedirect ? defaultRedirect : from;
            navigate(redirectPath, { replace: true });
            return;
        }

        setEmail("");
        setPassword("");
    }, [navigate, from]);

    async function handleLogin() {
        const trimmedEmail = (email || "").trim();
        if (!trimmedEmail) return toast.error("Please enter your email");

        if (!password || password.length < 4) return toast.error("Please enter your password");

        setIsLoading(true);
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.LOGIN, {
                username: trimmedEmail,
                password,
            });

            const loginSuccess = authService.login(response);

            if (!loginSuccess) {
                toast.error("Failed to store authentication data");
                setIsLoading(false);
                return;
            }

            // Enforce SUPER_ADMIN role only
            const normalizedRole = authService.getRole();
            if (normalizedRole !== ROLES.SUPER_ADMIN) {
                toast.error("Access denied. Super Admin credentials required.");
                authService.logout(); // Clear the stored data
                setIsLoading(false);
                return;
            }

            setEmail("");
            setPassword("");

            toast.success("Welcome Super Administrator!");

            // Determine redirect path
            const defaultRedirect = authService.getDefaultRedirect();
            const isGenericRedirect = from === '/' || from === '/home' || from === '/admin/panel';
            const redirectPath = isGenericRedirect ? defaultRedirect : from;

            navigate(redirectPath, { replace: true });
        } catch (error: any) {
            console.error("Login error:", error);
            const msg = error.message || "Invalid email or password";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 to-indigo-900/90"></div>
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold mb-6">Super Admin Portal</h2>
                    <p className="text-lg text-purple-100 max-w-md">
                        Highest level access with full system control. Manage all users, admins, and system configurations.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:w-1/2">
                <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Super Admin
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Restricted access - Super Admin credentials required
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="superadmin@example.com"
                                autoComplete="email"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pr-10"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Sign In as Super Admin'
                            )}
                        </button>
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={() => navigate("/home")}
                            className="w-full btn-secondary py-3 flex justify-center items-center text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors duration-200"
                        >
                            Back to Home
                        </button>
                    </div>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        <p>Authorized personnel only</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
