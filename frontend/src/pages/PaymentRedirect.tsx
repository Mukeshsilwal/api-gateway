import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookingContext } from '../utils/paymentStorage';
import BookingStatus from '../components/BookingStatus';
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

            if (!context) {
                Logger.error('No booking context found');
                navigate('/');
                return;
            }

            const { htmlForm, transactionId } = context;

            if (!htmlForm) {
                console.error('❌ Missing htmlForm in context:', context);
                Logger.error('Missing HTML form in context');
                navigate('/');
                return;
            }

            console.log('✅ htmlForm found, extracting form element...');
            Logger.info('Injecting eSewa payment form', { transactionId });

            // Decode HTML entities (in case backend sent escaped HTML like &lt;html&gt;)
            const decodeHtml = (html: string) => {
                const txt = document.createElement("textarea");
                txt.innerHTML = html;
                return txt.value;
            };

            let processableHtml = htmlForm;
            if (htmlForm.trim().startsWith('&lt;') || htmlForm.includes('&lt;html')) {
                console.log('⚠️ Detected encoded HTML, decoding...');
                processableHtml = decodeHtml(htmlForm);
            }

            // Parse the HTML to extract the form
            const parser = new DOMParser();
            const doc = parser.parseFromString(processableHtml, 'text/html');
            const form = doc.querySelector('form');

            if (!form) {
                console.error('❌ No form element found in htmlForm!');
                console.log('htmlForm content:', htmlForm);
                Logger.error('No form element in HTML');
                navigate('/');
                return;
            }

            console.log('✅ Form element extracted');
            console.log('Original Form action:', form.action);
            console.log('Original Form method:', form.method);

            // Force POST if using eSewa V2 API (rc-epay or epay/main/v2)
            if (form.action.includes('/v2/form') || form.action.includes('rc-epay')) {
                console.log('⚠️ Detected eSewa V2/Test API, forcing method="POST"');
                form.method = 'POST';
            }

            console.log('Final Form method:', form.method);
            console.log('Form inputs:', form.querySelectorAll('input').length);

            // Clone the form and append to body
            const clonedForm = form.cloneNode(true) as HTMLFormElement;
            clonedForm.style.display = 'none';
            document.body.appendChild(clonedForm);

            console.log('✅ Form appended to body');
            console.log('📋 Forms in document:', document.forms.length);

            // Submit the form immediately
            setTimeout(() => {
                console.log('🚀 Submitting form to eSewa...');
                try {
                    clonedForm.submit();
                    console.log('✅ Form submitted successfully');
                } catch (error) {
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

            <p className="mt-4 text-sm text-gray-500">
                Please do not close this window or click the back button.
            </p>
        </div>
    );
}
