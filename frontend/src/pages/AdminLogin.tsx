import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API_CONFIG from "../config/api";
import apiService from "../services/api.service";
import authService, { ROLES } from "../services/authService";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/admin/panel";

    useEffect(() => {
        // Check if already logged in
        if (authService.isAuthenticated() && authService.hasRole([ROLES.ADMIN, ROLES.SUPER_ADMIN])) {
            const defaultRedirect = authService.getDefaultRedirect();
            const isGenericRedirect = from === '/' || from === '/home';
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

            // Enforce ADMIN or SUPER_ADMIN role only
            const hasAdminAccess = authService.hasRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]);

            if (!hasAdminAccess) {
                toast.error("Unauthorized: You should have admin or super admin credentials");
                authService.logout(); // Clear the stored data
                setIsLoading(false);
                return;
            }

            setEmail("");
            setPassword("");

            toast.success(`Welcome back, Admin!`);

            // Determine redirect path
            // If 'from' is generic (home), force default admin redirect (e.g. /admin/panel)
            // Otherwise respect the redirect intention (e.g. they were trying to access a specific admin page)
            const defaultRedirect = authService.getDefaultRedirect();
            const isGenericRedirect = from === '/' || from === '/home';
            const redirectPath = isGenericRedirect ? defaultRedirect : from;

            console.log('Admin Login Redirect:', { from, defaultRedirect, final: redirectPath });
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
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-indigo-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/80"></div>
                <div className="relative z-10 flex flex-col justify-center px-12 text-white animate-fade-in">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Unified Management Portal</h2>
                    <p className="text-lg text-indigo-100 max-w-md leading-relaxed">
                        Sign in to manage bookings for Buses, Hotels, Movies, and Flights. Control your entire ticketing ecosystem from one place.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:w-1/2">
                <div className="w-full max-w-md space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-soft border border-slate-100 animate-slide-up">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Portal Login</h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Enter credentials to access the multi-service dashboard
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
                                className="input-field focus-glow"
                                placeholder="admin@example.com"
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
                                    className="input-field focus-glow pr-10"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
                            className={`w-full btn-primary py-3 flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Sign In as Admin'
                            )}
                        </button>
                    </div>


                    <div className="mt-4">
                        <button
                            onClick={() => navigate("/home")}
                            className="w-full btn-secondary py-3 flex justify-center items-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors duration-200"
                        >
                            Back to Home
                        </button>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm">
                        <Link to="/change-password" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Forgot password?
                        </Link>
                        <p className="text-slate-600">
                            Need admin access?{' '}
                            <Link to="/admin/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
                                Request Access
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
