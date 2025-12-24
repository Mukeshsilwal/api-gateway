import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import analytics from '../services/analytics';
import { Loader2 } from 'lucide-react';

const OAuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

    useEffect(() => {
        const handleOAuthCallback = async () => {
            // Extract tokens from URL
            const accessToken = searchParams.get('accessToken');
            const refreshToken = searchParams.get('refreshToken');
            const sessionId = searchParams.get('sessionId');
            const error = searchParams.get('error');

            if (error) {
                setStatus('error');
                toast.error(`Authentication failed: ${decodeURIComponent(error)}`);
                analytics.trackEvent('oauth_failure', { error });

                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 3000);
                return;
            }

            if (!accessToken || !refreshToken || !sessionId) {
                setStatus('error');
                toast.error('Invalid authentication response');

                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 3000);
                return;
            }

            // Process OAuth callback
            const result = await authService.handleOAuthCallback({
                accessToken,
                refreshToken,
                sessionId
            });

            if (result.success) {
                setStatus('success');
                const userData = authService.getUserData();

                // Track successful OAuth login
                if (userData?.id) {
                    analytics.identifyUser(userData.id, {
                        email: userData.email,
                        provider: userData.provider
                    });
                    analytics.trackEvent('oauth_success', {
                        provider: userData.provider
                    });
                }

                toast.success(`Welcome, ${userData?.firstName || 'User'}!`);

                // Clear tokens from URL for security
                window.history.replaceState({}, document.title, window.location.pathname);

                // Redirect to appropriate page
                const redirectPath = authService.getDefaultRedirect();
                setTimeout(() => {
                    navigate(redirectPath, { replace: true });
                }, 1500);
            } else {
                setStatus('error');
                toast.error(result.error || 'Authentication failed');

                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 3000);
            }
        };

        handleOAuthCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                {status === 'processing' && (
                    <>
                        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            Completing Sign In...
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Please wait while we set up your account
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            Success!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Redirecting you now...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            Authentication Failed
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Redirecting to login page...
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OAuthCallback;
