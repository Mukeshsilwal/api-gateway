import React from 'react';

const Card = ({ children, className = '', hover = false, ...props }) => {
    return (
        <div
            className={`
                bg-white rounded-2xl border border-gray-100 shadow-sm 
                ${hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : ''} 
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`p-6 border-b border-gray-50 ${className}`}>
        {children}
    </div>
);

export const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-lg font-bold text-gray-900 ${className}`}>
        {children}
    </h3>
);

export const CardContent = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`p-6 bg-gray-50/50 rounded-b-2xl border-t border-gray-50 ${className}`}>
        {children}
    </div>
);

export default Card;
