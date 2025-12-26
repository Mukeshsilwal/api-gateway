import React, { useState } from 'react';
import { handleEsewaPayment } from '../../utils/esewaSecurePayment';
import Button from '../ui/Button';

/**
 * Reusable eSewa Payment Button
 * 
 * Features:
 * - Loading state handling with ARIA support
 * - Error display (including 409 Conflict) with role="alert"
 * - Anti-double submit (via disabled state)
 * - Accessible labels
 */
const EsewaPaymentButton = ({ paymentContext, className, children }) => {
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'error'
    const [msg, setMsg] = useState('');

    const handleClick = async () => {
        // Prevent double clicks if already loading
        if (status === 'loading') return;

        setStatus('loading');
        setMsg('');

        await handleEsewaPayment(
            paymentContext,
            (isLoading) => {
                if (isLoading) setStatus('loading');
                // We don't set 'idle' here automatically because handleEsewaPayment handles error setting
            },
            (errorMsg) => {
                setMsg(errorMsg);
                setStatus('error');
            }
        );

        // Note: If successful, page redirects, so we don't need to set 'idle'
    };

    return (
        <div className="w-full" role="region" aria-label="eSewa Payment">
            {msg && (
                <div
                    role="alert"
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2"
                >
                    <span className="mt-0.5">⚠️</span>
                    <span>{msg}</span>
                </div>
            )}

            <Button
                onClick={handleClick}
                disabled={status === 'loading'}
                isLoading={status === 'loading'}
                className={`w-full bg-[#60bb46] hover:bg-[#4ca036] text-white shadow-md transition-all ${className}`}
                aria-label={status === 'loading' ? "Processing payment..." : "Pay with eSewa"}
                aria-busy={status === 'loading' ? "true" : "false"}
            >
                {children || (status === 'loading' ? 'Processing...' : 'Pay with eSewa')}
            </Button>

            <p className="text-xs text-center text-gray-500 mt-2">
                Secure payment via eSewa Gateway
            </p>
        </div>
    );
};

export default EsewaPaymentButton;
