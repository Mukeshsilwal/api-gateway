import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6 animate-slide-up">
                {/* Error Icon */}
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-5xl text-white">404</span>
                </div>

                {/* Error Message */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900">Page Not Found</h1>
                    <p className="text-gray-600 text-lg">
                        Oops! The page you're looking for doesn't exist.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        <Home size={20} />
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold border-2 border-gray-300 rounded-lg shadow-sm hover:shadow-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                    >
                        <ArrowLeft size={20} />
                        Go Back
                    </button>
                </div>

                {/* Help Text */}
                <p className="text-sm text-gray-500 pt-4">
                    If you believe this is an error, please contact support.
                </p>
            </div>
        </div>
    );
};

export default NotFound;
