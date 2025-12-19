/**
 * SessionStorage utility for managing payment context
 * Ensures payment state persists across page refreshes
 */

const STORAGE_KEYS = {
    BOOKING_ID: 'esewa_booking_id',
    TRANSACTION_ID: 'esewa_transaction_id',
    AMOUNT: 'esewa_amount',
    HTML_FORM: 'esewa_html_form',
    BOOKING_DATA: 'esewa_booking_data',
    TIMESTAMP: 'esewa_timestamp'
};

const EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes

/**
 * Store booking context in sessionStorage
 * @param {object} context - { bookingId, transactionId, amount, htmlForm, bookingData }
 */
export function setBookingContext(context) {
    try {
        console.log('💾 setBookingContext called with:', {
            bookingId: context.bookingId,
            transactionId: context.transactionId,
            amount: context.amount,
            hasHtmlForm: !!context.htmlForm,
            htmlFormLength: context.htmlForm?.length
        });

        sessionStorage.setItem(STORAGE_KEYS.BOOKING_ID, context.bookingId);
        sessionStorage.setItem(STORAGE_KEYS.TRANSACTION_ID, context.transactionId || '');
        sessionStorage.setItem(STORAGE_KEYS.AMOUNT, context.amount.toString());
        sessionStorage.setItem(STORAGE_KEYS.HTML_FORM, context.htmlForm || '');
        sessionStorage.setItem(STORAGE_KEYS.BOOKING_DATA, JSON.stringify(context.bookingData || {}));
        sessionStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());

        console.log('✅ Stored in sessionStorage successfully');
    } catch (error) {
        console.error('❌ Failed to store booking context:', error);
    }
}

/**
 * Retrieve booking context from sessionStorage
 * @returns {object|null} - Booking context or null if expired/missing
 */
export function getBookingContext() {
    try {
        const bookingId = sessionStorage.getItem(STORAGE_KEYS.BOOKING_ID);
        const timestamp = sessionStorage.getItem(STORAGE_KEYS.TIMESTAMP);

        // Check if context exists
        if (!bookingId || !timestamp) {
            console.log('⚠️ No booking context found in sessionStorage');
            return null;
        }

        // Check if context has expired
        const age = Date.now() - parseInt(timestamp, 10);
        if (age > EXPIRY_TIME) {
            console.log('⚠️ Booking context expired');
            clearBookingContext();
            return null;
        }

        const htmlForm = sessionStorage.getItem(STORAGE_KEYS.HTML_FORM);
        const transactionId = sessionStorage.getItem(STORAGE_KEYS.TRANSACTION_ID);
        const amount = sessionStorage.getItem(STORAGE_KEYS.AMOUNT);

        console.log('📥 Retrieved from sessionStorage:', {
            bookingId,
            transactionId,
            amount,
            hasHtmlForm: !!htmlForm,
            htmlFormLength: htmlForm?.length
        });

        // Return full context
        return {
            bookingId,
            transactionId,
            amount: parseFloat(amount),
            htmlForm,
            bookingData: JSON.parse(sessionStorage.getItem(STORAGE_KEYS.BOOKING_DATA) || '{}'),
            timestamp: parseInt(timestamp, 10)
        };
    } catch (error) {
        console.error('❌ Failed to retrieve booking context:', error);
        return null;
    }
}

/**
 * Clear booking context from sessionStorage
 */
export function clearBookingContext() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            sessionStorage.removeItem(key);
        });
        console.log('🗑️ Cleared booking context from sessionStorage');
    } catch (error) {
        console.error('Failed to clear booking context:', error);
    }
}

/**
 * Check if there's an active payment in progress
 * @returns {boolean}
 */
export function hasActivePayment() {
    const context = getBookingContext();
    return context !== null;
}
