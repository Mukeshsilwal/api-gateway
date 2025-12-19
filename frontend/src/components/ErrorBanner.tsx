import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ErrorBannerProps {
    message: string;
    onClose?: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md shadow-sm relative">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
                <div className="ml-3 pr-8">
                    <p className="text-sm text-red-700 font-medium whitespace-pre-wrap">{message}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorBanner;
