import React from 'react';

const LoadingSpinner = ({ size = 'md', text, className = '' }) => {
    const sizes = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
        xl: 'w-16 h-16 border-4'
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            <div className={`
                ${sizes[size]} 
                rounded-full 
                border-gray-200 
                border-t-primary 
                animate-spin
            `}></div>
            {text && (
                <p className="text-gray-500 text-sm font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
