import React from 'react';

const Card = ({ children, className = '', hover = false, ...props }) => {
    return (
        <div
            className={`
                bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/40 text-slate-900 dark:text-slate-100
                ${hover ? 'hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-500/30 dark:hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300' : ''} 
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`p-6 border-b border-slate-100 dark:border-slate-800 ${className}`}>
        {children}
    </div>
);

export const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-lg font-bold text-slate-900 dark:text-slate-100 ${className}`}>
        {children}
    </h3>
);

export const CardContent = ({ children, className = '' }) => (
    <div className={`p-6 text-slate-700 dark:text-slate-300 ${className}`}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`p-6 bg-slate-50/50 dark:bg-slate-800/40 rounded-b-2xl border-t border-slate-100 dark:border-slate-800 ${className}`}>
        {children}
    </div>
);

export default Card;
