/**
 * Redirect user to payment gateway using POST method.
 * Creates a hidden form dynamically and submits it.
 * 
 * SECURITY: This function does NOT modify or validate parameters.
 * It trusts the backend completely and submits exactly what is provided.
 * 
 * @param {string} gatewayUrl - Payment gateway URL
 * @param {object} params - Payment parameters from backend
 */
export function redirectToGateway(gatewayUrl, params) {
    if (!gatewayUrl) {
        throw new Error('Gateway URL is required');
    }

    if (!params || typeof params !== 'object') {
        throw new Error('Payment parameters are required');
    }

    // Create form element
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = gatewayUrl;
    form.style.display = 'none';

    // Add all parameters as hidden inputs
    Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    });

    // Append to body and submit
    document.body.appendChild(form);
    form.submit();
}
