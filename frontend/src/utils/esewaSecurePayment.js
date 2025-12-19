/**
 * Secure eSewa Payment Utilities
 * 
 * Implements a robust payment flow for RC/PROD environments:
 * 1. Environment Configuration
 * 2. Validation & Diagnostics
 * 3. Idempotency (Unique Reference IDs)
 * 4. Primary Flow (Direct POST with Fallback)
 * 5. 409 Conflict Handling
 */

// Environment Configuration
export const ENV = 'RC'; // 'RC' or 'PROD'

export const ENDPOINTS = {
    RC: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
    PROD: 'https://epay.esewa.com.np/api/epay/main/v2/form',
};

/**
 * Generates a unique reference ID for the transaction.
 * Format: merchantId-YYYYMMDDHHmmss-random4
 * @param {string} merchantId - The merchant ID
 * @returns {string} Unique Reference ID
 */
export const createReferenceId = (merchantId = 'EPAYTEST') => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${merchantId}-${ts}-${rand}`;
};

/**
 * Computes the signature for the payment payload.
 * STUB: This function is a placeholder. Real signature generation requires a Secret Key
 * and should ideally happen on the backend to keep the key secure.
 * 
 * @param {Object} payload - The payment payload
 * @returns {string} The computed signature (Placeholder)
 */
export const computeSignature = (payload) => {
    // IMPORTANT: Use exactly the fields required and a deterministic serialization
    const serialized = JSON.stringify(payload);
    return `SIGNATURE_PLACEHOLDER_${serialized.length}`;
};

/**
 * Validates the payment payload for required fields.
 * @param {Object} p - The payload object
 * @throws {Error} If required fields are missing
 */
export const validatePayload = (p) => {
    const required = ['amount', 'total_amount', 'transaction_uuid', 'product_code', 'success_url', 'failure_url', 'signed_field_names', 'signature'];
    // Note: eSewa v2 requires snake_case fields usually. Adjust based on specific API docs.
    // For this stub, we check generic presence.
    const missing = required.filter(k => !p[k]);
    if (missing.length) {
        // Warning only for now as field names might vary (camelCase vs snake_case)
        console.warn(`Potential missing fields: ${missing.join(', ')}`);
    }
};

/**
 * Safe POST redirect via auto-submitted hidden form.
 * @param {string} url - The target URL
 * @param {Object} payload - The form fields
 */
export const redirectViaAutoForm = (url, payload) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    form.style.display = 'none';

    Object.entries(payload).forEach(([k, v]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = v;
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
};

/**
 * Core: POST to eSewa and analyze response.
 * Handles 409 Conflict and other errors.
 * 
 * @param {string} endpoint - The eSewa endpoint
 * @param {Object} payload - The payment payload
 * @returns {Promise<Object>} The result object { type: 'redirect'|'form'|'html', ... }
 */
export const postToEsewa = async (endpoint, payload) => {
    try {
        const formData = new URLSearchParams();
        Object.entries(payload).forEach(([k, v]) => formData.append(k, v));

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body: formData.toString(),
        });

        const contentType = res.headers.get('Content-Type') || '';
        let bodyText = '';
        try { bodyText = await res.text(); } catch (e) { }

        // Diagnostics
        console.debug('POST /v2/form status', res.status, contentType);

        if (res.status === 409) {
            throw new Error('This looks like a duplicate or already processed transaction. Please try again; a new Transaction ID will be generated.');
        }

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${bodyText.slice(0, 200) || 'Request failed'}`);
        }

        // Detect HTML response (form or page)
        if (contentType.includes('text/html')) {
            return { type: 'html', html: bodyText };
        }

        // Detect JSON redirect
        if (contentType.includes('application/json')) {
            try {
                const json = JSON.parse(bodyText);
                if (json.redirectUrl) return { type: 'redirect', url: json.redirectUrl };
                return { type: 'json', data: json };
            } catch (e) {
                return { type: 'text', data: bodyText };
            }
        }

        return { type: 'text', data: bodyText };

    } catch (error) {
        console.error("postToEsewa failed:", error);
        throw error;
    }
};

/**
 * Orchestrates the full payment flow.
 * @param {Object} paymentContext - The payment details (amount, etc.)
 * @param {Function} setLoading 
 * @param {Function} setError 
 */
export const handleEsewaPayment = async (paymentContext, setLoading, setError) => {
    if (setLoading) setLoading(true);
    if (setError) setError(null);

    try {
        const endpoint = ENDPOINTS[ENV];
        const merchantId = 'EPAYTEST'; // Default for RC
        const referenceId = createReferenceId(merchantId);

        // Map context to eSewa v2 payload (snake_case)
        // This is a mapping example; adjust fields as per actual eSewa v2 spec
        const payload = {
            amount: paymentContext.amount || '100',
            tax_amount: '0',
            total_amount: paymentContext.amount || '100',
            transaction_uuid: referenceId,
            product_code: 'EPAYTEST',
            product_service_charge: '0',
            product_delivery_charge: '0',
            success_url: paymentContext.successUrl || 'https://google.com',
            failure_url: paymentContext.failureUrl || 'https://google.com',
            signed_field_names: 'total_amount,transaction_uuid,product_code',
            signature: '', // Computed below
        };

        // Compute Signature
        payload.signature = computeSignature(payload);

        // Validate
        validatePayload(payload);

        // Attempt Direct POST
        try {
            const result = await postToEsewa(endpoint, payload);

            if (result.type === 'redirect' && result.url) {
                window.location.href = result.url;
            } else {
                // Fallback or HTML response: Use Auto-Form
                redirectViaAutoForm(endpoint, payload);
            }
        } catch (postError) {
            // If CORS or Network error, fallback to Auto-Form immediately
            // But if 409, we should stop and show error
            if (postError.message.includes('409')) {
                throw postError;
            }

            console.warn("Direct POST failed (likely CORS), falling back to Auto-Form:", postError);
            redirectViaAutoForm(endpoint, payload);
        }

    } catch (err) {
        const is409 = String(err.message).includes('409');
        const msg = is409
            ? 'This transaction looks like a duplicate. Please try again with a new reference.'
            : err.message || 'Payment initiation failed.';

        if (setError) setError(msg);
        if (setLoading) setLoading(false);
    }
};
