import React from 'react';

const Input = ({
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
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    id={id}
                    className={`
                        block w-full rounded-xl border-gray-200 bg-gray-50 
                        focus:border-primary focus:ring-primary focus:bg-white 
                        transition-all duration-200
                        disabled:opacity-50 disabled:bg-gray-100
                        placeholder:text-gray-400 text-gray-900
                        ${Icon ? 'pl-10' : 'pl-4'} 
                        pr-4 py-2.5 
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border'}
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
