import React from 'react';
import { Chrome } from 'lucide-react';

interface OAuthButtonProps {
    provider: 'google';
    onLogin: (provider: string) => void;
    disabled?: boolean;
    className?: string;
}

const OAuthButton: React.FC<OAuthButtonProps> = ({
    provider,
    onLogin,
    disabled = false,
    className = ''
}) => {
    const config = {
        icon: Chrome,
        label: 'Continue with Google',
        bgColor: 'bg-white hover:bg-gray-50',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300'
    };

    const Icon = config.icon;

    return (
        <button
            onClick={() => onLogin(provider)}
            disabled={disabled}
            className={`
                w-full flex items-center justify-center gap-3 px-4 py-3 
                rounded-lg border-2 font-medium transition-all duration-200
                ${config.bgColor} ${config.textColor} ${config.borderColor}
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-sm hover:shadow-md
                ${className}
            `}
            type="button"
        >
            <Icon size={20} />
            <span>{config.label}</span>
        </button>
    );
};

export default OAuthButton;
