import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API_CONFIG from "../config/api";
import apiService from "../services/api.service";
import authService from "../services/authService";
import analytics from "../services/analytics";
import { parseError, getRecoverySuggestion, ErrorType } from "../utils/errorUtils";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { Mail, Lock, LogIn } from "lucide-react";

interface LoginFormProps {
    onSuccess?: () => void;
    redirectOnSuccess?: boolean;
    transparent?: boolean;
    className?: string;
}

export default function LoginForm({ onSuccess, redirectOnSuccess = true, transparent = false, className = "" }: LoginFormProps) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();
    // Use type assertion for location.state since it can be unknown
    const from = (location.state as any)?.from?.pathname;

    async function handleLogin() {
        if (isLoading) return;

        const trimmedEmail = (email || "").trim();
        if (!trimmedEmail) return toast.error("Please enter your email");

        if (!password || password.length < 4) return toast.error("Please enter your password");

        setIsLoading(true);
        // Track Login Attempt
        analytics.trackEvent('login_attempt', { method: 'email' });

        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.LOGIN, {
                username: trimmedEmail,
                password,
            }, { retries: 0 });

            const { data } = response as any; // Cast response to any for now until apiService is typed

            const loginSuccess = authService.login(data);

            if (!loginSuccess) {
                toast.error("Failed to store authentication data");
                setIsLoading(false);
                analytics.trackEvent('login_failure', { reason: 'storage_failed' });
                return;
            }

            // Retrieve stored data for consistent UI behavior
            const userData = authService.getUserData() as any; // Cast to any or User if possible. authService.getUserData returns object in JS.
            const roles = authService.getRoles(); // Use new array getter

            // Identify User and Track Success
            if (userData && userData.id) {
                analytics.identifyUser(userData.id, {
                    email: userData.email,
                    role: Array.isArray(roles) ? roles.join(',') : roles
                });
                analytics.trackEvent('login_success', { userId: userData.id });

                toast.success(`Welcome back, ${userData.firstName}!`);
            } else {
                toast.success("Login successful!");
            }

            // Using onlineUserCount from response if available
            if (data.onlineUserCount > 1) {
                // Optional: show online count
                // toast.info(`Online users: ${data.onlineUserCount}`);
            }

            if (onSuccess) onSuccess();

            if (redirectOnSuccess) {
                // Determine redirect based on which login page was used
                let targetPath;

                if (from) {
                    // If there's a "from" path, go there
                    targetPath = from;
                } else if (location.pathname === '/login') {
                    // User login page - check for pending booking or go to home
                    const pendingBooking = sessionStorage.getItem('pendingBooking');
                    if (pendingBooking) {
                        try {
                            const booking = JSON.parse(pendingBooking);
                            targetPath = `/events/${booking.eventId}`;
                        } catch (e) {
                            console.error('Error parsing pending booking:', e);
                            sessionStorage.removeItem('pendingBooking');
                            targetPath = '/home';
                        }
                    } else {
                        targetPath = '/home';
                    }
                } else {
                    // Admin login or other - use role-based redirect
                    targetPath = authService.getDefaultRedirect();
                }

                navigate(targetPath, { replace: true });
            }
        } catch (error: any) {
            console.error("Login error:", error);
            const errorInfo = parseError(error);
            let errorMessage = (errorInfo as any).message || "Invalid email or password";
            const suggestion = getRecoverySuggestion(error);

            // Track Failure
            analytics.trackEvent('login_failure', { error: errorMessage });

            if (suggestion && (errorInfo as any).type !== ErrorType.VALIDATION) {
                toast.error(errorMessage);
                toast.info(suggestion, { autoClose: 5000 });
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    }

    const containerClasses = transparent
        ? `w-full max-w-md space-y-8 bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl ${className}`
        : `w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 ${className}`;

    const textClasses = transparent ? "text-white" : "text-gray-900";
    const subTextClasses = transparent ? "text-indigo-200" : "text-gray-500";

    // Custom styles for transparent mode inputs
    const transparentInputStyles = transparent ? "bg-white/5 border-white/20 text-white placeholder-indigo-200/50 focus:ring-teal-400 focus:border-transparent" : "";


    return (
        <div className={containerClasses}>
            <div className="text-center">
                <h1 className={`text-3xl font-display font-bold ${textClasses}`}>Welcome Back</h1>
                <p className={`mt-2 text-sm ${subTextClasses}`}>
                    Sign in to manage your bookings
                </p>
            </div>

            <div className="space-y-6">
                <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    icon={Mail}
                    className={transparentInputStyles}
                    containerClassName={transparent ? "text-white" : ""}
                // We need to handle label styling manually or pass a prop if Input supported it
                // For now, Input label uses text-gray-700. We can override with css or just accept it.
                // Let's rely on the fact that Input uses standard classes.
                // Actually, Input component has hardcoded label classes. 
                // I'll add a quick override via style prop if needed, but let's try to keep it simple.
                />

                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    icon={Lock}
                    className={transparentInputStyles}
                    onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleLogin()}
                />

                <Button
                    onClick={handleLogin}
                    isLoading={isLoading}
                    className={`w-full py-3 text-lg shadow-lg ${transparent ? 'bg-gradient-to-r from-teal-500 to-violet-600 border-0' : ''}`}
                >
                    {!isLoading && <LogIn size={20} className="mr-2" />}
                    Sign In
                </Button>
            </div>

            <div className="mt-6 flex items-center justify-between text-sm">
                <Link to="/change-password" className={`${transparent ? 'text-indigo-300 hover:text-white' : 'text-primary hover:text-primary-700'} font-medium transition-colors`}>
                    Forgot password?
                </Link>
                <p className={subTextClasses}>
                    No account?{' '}
                    <Link to="/register" className={`${transparent ? 'text-teal-400 hover:text-teal-300' : 'text-primary hover:text-primary-700'} font-bold transition-colors`}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}

