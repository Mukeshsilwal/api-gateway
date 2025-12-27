import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookingContext } from '../utils/paymentStorage';
import BookingStatus from '../components/BookingStatus';
// @ts-ignore
import { PAYMENT_STATES } from '../hooks/useEsewaPayment';
import Logger from '../utils/logger';

interface BookingContext {
    bookingId?: string;
    transactionId?: string;
    htmlForm?: string;
    [key: string]: any;
}

/**
 * PaymentRedirect Page
 * Extracts form from HTML and submits to eSewa
 */
export default function PaymentRedirect() {
    const navigate = useNavigate();

    useEffect(() => {
        const redirectToEsewa = () => {
            // Retrieve booking context
            const context = getBookingContext() as BookingContext | null;

            console.log('🔍 Retrieved from sessionStorage:', {
                hasContext: !!context,
                bookingId: context?.bookingId,
                transactionId: context?.transactionId,
                hasHtmlForm: !!context?.htmlForm,
                htmlFormLength: context?.htmlForm?.length
            });

            const logDebug = (msg: string) => {
                console.log(msg);
                const el = document.getElementById('debug-log');
                if (el) {
                    const p = document.createElement('div');
                    p.innerText = `${new Date().toLocaleTimeString()} - ${msg}`;
                    el.appendChild(p);
                    el.scrollTop = el.scrollHeight;
                }
            };

            if (!context) {
                Logger.error('No booking context found');
                logDebug('❌ No booking context found in sessionStorage');
                // navigate('/'); // Don't redirect immediately so user can see error
                return;
            }

            const { htmlForm, transactionId } = context;

            if (!htmlForm) {
                logDebug('❌ Missing htmlForm in context');
                Logger.error('Missing HTML form in context');
                return;
            }

            logDebug('✅ htmlForm found, extracting...');
            Logger.info('Injecting eSewa payment form', { transactionId });

            // Decode HTML entities (in case backend sent escaped HTML like &lt;html&gt;)
            const decodeHtml = (html: string) => {
                const txt = document.createElement("textarea");
                txt.innerHTML = html;
                return txt.value;
            };

            let processableHtml = htmlForm;
            if (htmlForm.trim().startsWith('&lt;') || htmlForm.includes('&lt;html')) {
                logDebug('⚠️ Detected encoded HTML, decoding...');
                processableHtml = decodeHtml(htmlForm);
            }

            // Parse the HTML to extract the form
            const parser = new DOMParser();
            const doc = parser.parseFromString(processableHtml, 'text/html');
            const form = doc.querySelector('form');

            if (!form) {
                logDebug('❌ No form element found in parsed HTML');
                console.log('htmlForm content:', htmlForm);
                Logger.error('No form element in HTML');
                return;
            }

            logDebug(`✅ Form found. Action: ${form.action}`);

            // Force POST if using eSewa V2 API (rc-epay or epay/main/v2)
            if (form.action.includes('/v2/form') || form.action.includes('rc-epay')) {
                logDebug('⚠️ forcing method="POST" for V2 API');
                form.method = 'POST';
            }

            // Clone the form and append to body
            const clonedForm = form.cloneNode(true) as HTMLFormElement;
            clonedForm.style.display = 'none';
            document.body.appendChild(clonedForm);

            logDebug('✅ Form appended to body. Submitting in 100ms...');

            // Submit the form immediately
            setTimeout(() => {
                logDebug('🚀 Submitting form...');
                try {
                    clonedForm.submit();
                    logDebug('✅ Submit called.');
                } catch (error) {
                    logDebug(`❌ Submit Error: ${error}`);
                    console.error('❌ Form submission error:', error);
                    // Show manual button
                    const btn = document.getElementById('manual-pay-btn');
                    if (btn) {
                        btn.style.display = 'block';
                        btn.classList.remove('hidden');
                    }
                }
            }, 100);

            Logger.info('Form extracted and submitting to eSewa...');
        };

        redirectToEsewa();
    }, [navigate]);

    const handleManualSubmit = () => {
        const forms = document.forms;
        if (forms.length > 0) {
            forms[forms.length - 1].submit();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <BookingStatus
                state={PAYMENT_STATES.REDIRECTING}
                message="Redirecting you to eSewa payment gateway..."
                retryCount={0}
                pollingAttempt={0}
                error={null}
            />

            {/* Fallback button in case auto-redirect fails */}
            <button
                id="manual-pay-btn"
                onClick={handleManualSubmit}
                className="mt-8 px-6 py-2 bg-[#60bb46] text-white rounded-lg shadow-md hover:bg-[#4da534] transition-colors hidden"
                style={{ display: 'none' }}
            >
                Click here if you are not redirected automatically
            </button>

            {/* Debug Info for User/Dev */}
            <div className="mt-8 p-4 bg-gray-100 rounded text-xs font-mono text-left w-full max-w-lg overflow-auto max-h-40 border border-gray-300">
                <p className="font-bold border-b border-gray-300 mb-2 pb-1">Debug Status:</p>
                <div id="debug-log">Initializing...</div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
                Please do not close this window or click the back button.
            </p>
        </div>
    );
}
