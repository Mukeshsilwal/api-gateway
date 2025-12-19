import ApiService from './api.service';
import API_CONFIG from '../config/api';

/**
 * Payment Service for Unified Payment Gateway Integration
 * Supports eSewa, Khalti, and IMEPay through a unified API
 */
class PaymentService {
    /**
     * Initiate payment with any provider (eSewa, Khalti, IMEPay)
     * Uses the unified POST /payment/initiate/{provider} endpoint
     * 
     * @param {string} provider - 'esewa', 'khalti', or 'imepay'
     * @param {Object} paymentData - Payment data
     * @returns {Promise<Object>} - Provider-specific redirect URL or params
     */
    async initiatePayment(provider, paymentData) {
        const {
            customerId,
            amount,
            tid,
            metadata = {},
            successUrl,
            failureUrl,
            customerEmail,
            customerName,
            bookingType,
            bookingDetails
        } = paymentData;

        // Construct payload following the unified API structure
        const payload = {
            customerId: customerId || "GUEST",
            amount: amount,
            metadata: {
                tid: tid,
                orderCode: metadata.orderCode || `${bookingType || 'BOOKING'}-${tid}`,
                productType: metadata.productType || bookingType || 'BOOKING',
                ...metadata // Include any additional metadata
            },
            successUrl: successUrl || this.getDefaultSuccessUrl(bookingType),
            failureUrl: failureUrl || `${window.location.origin}/booking-failed`,
            customerEmail: customerEmail,
            customerName: customerName
        };

        try {
            const response = await ApiService.post(
                `${API_CONFIG.ENDPOINTS.PAYMENT_INITIATE}/${provider}`,
                payload
            );

            // Store booking context for callback handling
            const bookingContext = {
                tid: tid,
                provider: provider,
                amount: amount,
                customerEmail: customerEmail,
                customerName: customerName,
                bookingType: bookingType,
                bookingDetails: bookingDetails,
                timestamp: Date.now()
            };
            sessionStorage.setItem('pendingPayment', JSON.stringify(bookingContext));

            // Handle provider-specific response
            if (provider === 'khalti') {
                // Khalti returns redirectUrl
                const redirectUrl = response.data?.redirectUrl || response.redirectUrl;
                if (redirectUrl) {
                    return {
                        success: true,
                        redirectUrl: redirectUrl
                    };
                } else {
                    throw new Error('No redirect URL received from Khalti');
                }
            } else {
                // eSewa and IMEPay return gateway URL and params for form submission
                // Backend returns nested structure: { data: { data: { gatewayUrl, params } } }
                const paymentData = response.data?.data || response.data || response;
                const gatewayUrl = paymentData.gatewayUrl;
                const params = paymentData.params || {};

                if (!gatewayUrl) {
                    throw new Error('No gateway URL received from payment provider');
                }

                return {
                    success: true,
                    gatewayUrl: gatewayUrl,
                    params: params
                };
            }
        } catch (error) {
            console.error(`Payment initiation error (${provider}):`, error);
            throw new Error(error.message || `Failed to initiate ${provider} payment`);
        }
    }

    /**
     * Process payment - main entry point for all payment flows
     * @param {string} provider - 'esewa', 'khalti', or 'imepay'
     * @param {Object} paymentContext - Complete payment context
     */
    async processPayment(provider, paymentContext) {
        try {
            const result = await this.initiatePayment(provider, paymentContext);

            if (provider === 'khalti') {
                // Redirect to Khalti
                if (result.redirectUrl) {
                    window.location.href = result.redirectUrl;
                }
            } else {
                // Submit form for eSewa/IMEPay
                if (result.gatewayUrl && result.params) {
                    this.submitPaymentForm(result.gatewayUrl, result.params);
                }
            }
        } catch (error) {
            console.error("Payment processing failed:", error);
            throw error;
        }
    }

    /**
     * Submit payment form (for eSewa and IMEPay)
     * Creates a hidden form and submits it to redirect to payment gateway
     */
    submitPaymentForm(action, params) {
        console.log('🔄 Submitting payment form to:', action);
        console.log('📋 Form parameters:', params);

        if (!action) {
            console.error('❌ Gateway URL is missing!');
            throw new Error('Gateway URL is required for payment submission');
        }

        if (!params || Object.keys(params).length === 0) {
            console.warn('⚠️ No parameters provided for payment form');
        }

        const form = document.createElement("form");
        form.method = "POST";
        form.action = action;
        form.style.display = "none"; // Hide the form

        Object.entries(params).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = String(value); // Ensure value is string
            form.appendChild(input);
            console.log(`  ✓ Added field: ${key} = ${value}`);
        });

        document.body.appendChild(form);
        console.log('✅ Form created and appended to body, submitting now...');

        // Submit the form
        form.submit();

        console.log('🚀 Form submitted! Redirecting to payment gateway...');
    }

    /**
     * Verify payment after callback
     * Uses POST /payment/verify/{provider}
     * 
     * @param {string} provider - 'esewa', 'khalti', or 'imepay'
     * @param {Object} verificationData - Verification data
     * @returns {Promise<Object>} - Verification result
     */
    async verifyPayment(provider, verificationData) {
        const {
            transactionId,
            providerTransactionId,
            status
        } = verificationData;

        const payload = {
            transactionId: transactionId,
            providerTransactionId: providerTransactionId,
            status: status || 'SUCCESS'
        };

        try {
            const response = await ApiService.post(
                `${API_CONFIG.ENDPOINTS.PAYMENT_VERIFY}/${provider}`,
                payload
            );

            return {
                success: true,
                verified: response.data?.verified || response.verified || true,
                data: response.data || response
            };
        } catch (error) {
            console.error(`Payment verification error (${provider}):`, error);
            return {
                success: false,
                verified: false,
                error: error.message || 'Verification failed'
            };
        }
    }

    /**
     * Verify Khalti payment from callback
     * @param {Object} callbackParams - URL parameters from Khalti callback
     * @returns {Promise<Object>} - Returns verification result
     */
    async verifyKhaltiPayment(callbackParams) {
        const pendingPayment = this.getPendingPayment();

        if (!pendingPayment) {
            throw new Error('No pending payment found. Session may have expired.');
        }

        const {
            pidx,
            transaction_id,
            status
        } = callbackParams;

        return await this.verifyPayment('khalti', {
            transactionId: pendingPayment.tid,
            providerTransactionId: pidx || transaction_id,
            status: status
        });
    }

    /**
     * Get default success URL based on booking type
     */
    getDefaultSuccessUrl(bookingType) {
        switch (bookingType) {
            case 'HOTEL':
                return `${window.location.origin}/hotel-booking-confirmation`;
            case 'PLANE':
            case 'FLIGHT':
                return `${window.location.origin}/plane-ticket-confirm`;
            case 'BUS':
            default:
                return `${window.location.origin}/ticket-confirm`;
        }
    }

    /**
     * Get pending payment from sessionStorage
     * @returns {Object|null} - Pending payment data or null
     */
    getPendingPayment() {
        try {
            const data = sessionStorage.getItem('pendingPayment');
            if (!data) return null;

            const payment = JSON.parse(data);

            // Check if payment data is not expired (30 minutes)
            const expirationTime = 30 * 60 * 1000;
            if (Date.now() - payment.timestamp > expirationTime) {
                this.clearPendingPayment();
                return null;
            }

            return payment;
        } catch (error) {
            console.error('Error retrieving pending payment:', error);
            return null;
        }
    }

    /**
     * Clear pending payment data from sessionStorage
     */
    clearPendingPayment() {
        sessionStorage.removeItem('pendingPayment');
    }

    /**
     * Store additional booking data
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     */
    storeBookingData(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error storing booking data:', error);
        }
    }

    /**
     * Retrieve stored booking data
     * @param {string} key - Storage key
     * @returns {any} - Retrieved value or null
     */
    getBookingData(key) {
        try {
            const data = sessionStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error retrieving booking data:', error);
            return null;
        }
    }
}

export default new PaymentService();
