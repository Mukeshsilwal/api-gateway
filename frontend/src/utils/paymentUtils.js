/**
 * Utility functions for payment processing
 */

/**
 * Extracts the eSewa payment payload from the API response.
 * @param {Object} apiResponse - The full API response object
 * @returns {Object} { gatewayUrl, method, params }
 */
export const getEsewaPayload = (apiResponse) => {
    const data = apiResponse?.data?.data || apiResponse?.data;
    return {
        gatewayUrl: data?.gatewayUrl,
        method: data?.method || 'POST',
        params: data?.params
    };
};

/**
 * Generates and submits an HTML form for eSewa payment.
 * @param {Object} payload - { gatewayUrl, method, params }
 */
export const generateEsewaForm = ({ gatewayUrl, method = 'POST', params }) => {
    if (!gatewayUrl || !params) {
        console.error("Invalid eSewa payload:", { gatewayUrl, params });
        throw new Error("Invalid eSewa payment details");
    }

    const form = document.createElement("form");
    form.method = method;
    form.action = gatewayUrl;
    form.target = "_self";
    form.style.display = "none";

    Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
    });

    document.body.appendChild(form);

    try {
        form.submit();
    } catch (error) {
        console.error("eSewa redirection failed:", error);
        document.body.removeChild(form);
        throw new Error("Failed to redirect to eSewa.");
    }

    // Cleanup timeout
    setTimeout(() => {
        if (document.body.contains(form)) {
            document.body.removeChild(form);
        }
    }, 2000);
};

/**
 * Redirects the user to a payment gateway using a dynamically created form.
 * (Alias for generateEsewaForm for backward compatibility/generic use)
 */
export const redirectToPaymentGateway = generateEsewaForm;

/**
 * Auto-submit a form for eSewa payment (Legacy wrapper)
 * @param {Object} paymentData - Key-value pairs for the form fields
 * @param {string} actionUrl - The URL to submit the form to
 */
export const submitEsewaForm = (paymentData, actionUrl = "https://rc-epay.esewa.com.np/api/epay/main/v2/form") => {
    generateEsewaForm({
        gatewayUrl: actionUrl,
        params: paymentData
    });
};

/**
 * Parse query parameters from a URL string
 * @param {string} search - The query string (window.location.search)
 * @returns {Object} Key-value pairs of parameters
 */
export const parseQueryParams = (search) => {
    return new URLSearchParams(search);
};
