
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'white';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    disabled,
    type = 'button',
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25 focus:ring-primary",
        secondary: "bg-secondary dark:bg-slate-800 text-secondary-foreground dark:text-slate-100 hover:bg-secondary/80 dark:hover:bg-slate-700 border border-border/80 shadow-sm focus:ring-border",
        outline: "border-2 border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20 focus:ring-primary",
        ghost: "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:ring-slate-300 dark:focus:ring-slate-700",
        danger: "bg-destructive text-white hover:bg-destructive/90 shadow-lg shadow-destructive/30 focus:ring-destructive",
        white: "bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-md focus:ring-slate-300 dark:focus:ring-slate-700"
    };

    const sizes = {
        sm: "text-xs px-3 py-1.5 rounded-lg",
        md: "text-sm px-5 py-2.5 rounded-xl",
        lg: "text-base px-6 py-3.5 rounded-2xl",
        icon: "p-2 rounded-xl"
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                </>
            ) : children}
        </button>
    );
};

export default Button;
