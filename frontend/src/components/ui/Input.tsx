import React, { ForwardRefExoticComponent, RefAttributes } from 'react';
import { LucideProps } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ComponentType<LucideProps> | ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    icon: Icon,
    className = '',
    containerClassName = '',
    id,
    ...props
}) => {
    return (
        <div className={`w-full ${containerClassName}`}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    id={id}
                    className={`
                        block w-full rounded-xl 
                        
                        /* Base Colors (Light Mode) */
                        bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm
                        
                        /* Dark Mode Overrides */
                        dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500
                        
                        /* Interaction States */
                        focus:border-purple-600 focus:ring-2 focus:ring-purple-500/25 focus:outline-none
                        
                        transition-all duration-200
                        disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed
                        
                        ${Icon ? 'pl-10' : 'pl-4'} 
                        pr-4 py-2.5 
                        ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/40'
                            : 'border'
                        }
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-500 ml-1 animate-slide-down">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
