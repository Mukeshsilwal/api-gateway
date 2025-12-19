import React from 'react';
import useImePayPayment from '../../hooks/useImePayPayment';

const ImePayButton = ({ paymentData, className, children }) => {
    const { startPayment, loading, error } = useImePayPayment();

    const handleClick = () => {
        startPayment(paymentData);
    };

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={handleClick}
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-6 py-3 bg-[#ed1c24] text-white font-bold rounded-lg shadow-md hover:bg-[#c4161d] transition-all disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
            >
                {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <span>IME Pay</span>
                )}
                {children || "Pay with IME Pay"}
            </button>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default ImePayButton;
