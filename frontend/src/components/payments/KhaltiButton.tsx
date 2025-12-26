import React from 'react';
import useKhaltiPayment from '../../hooks/useKhaltiPayment';

const KhaltiButton = ({ paymentData, className, children }) => {
    const { startPayment, loading, error } = useKhaltiPayment();

    const handleClick = () => {
        startPayment(paymentData);
    };

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={handleClick}
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-6 py-3 bg-[#5C2D91] text-white font-bold rounded-lg shadow-md hover:bg-[#4a2375] transition-all disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
            >
                {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <img src="https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-original-577x577/s3/082018/untitled-1_107.png?itok=435978-c" alt="Khalti" className="h-6 object-contain brightness-0 invert" />
                )}
                {children || "Pay with Khalti"}
            </button>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default KhaltiButton;
