import {
    parseError,
    getErrorMessage,
    getErrorType,
    getFieldErrors,
    formatValidationErrors,
} from '../errorUtils';

describe('errorUtils', () => {
    test('parseError returns default for undefined', () => {
        const result = parseError(undefined);
        expect(result.type).toBe('unknown');
        expect(result.message).toBe('An unexpected error occurred');
    });

    test('extracts fieldErrors from backend format', () => {
        const mockError = {
            data: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input',
                data: {
                    fieldErrors: { email: 'Invalid email' },
                },
            },
        };
        const parsed = parseError(mockError);
        expect(parsed.fieldErrors).toEqual({ email: 'Invalid email' });
        expect(parsed.message).toBe('Invalid input');
    });

    test('formats validation errors array', () => {
        const errors = [
            { field: 'password', message: 'Too short' },
            { property: 'username', constraints: { isLength: 'Too short' } },
        ];
        const formatted = formatValidationErrors(errors);
        expect(formatted).toEqual({
            password: 'Too short',
            username: 'Too short',
        });
    });

    test('getErrorType categorises by status', () => {
        const err = { status: 400 };
        expect(getErrorType(err)).toBe('validation');
        expect(getErrorType({ status: 401 })).toBe('authentication');
        expect(getErrorType({ status: 500 })).toBe('server');
    });

    test('getErrorMessage prefers explicit message', () => {
        const err = { message: 'Custom error' };
        expect(getErrorMessage(err)).toBe('Custom error');
        const err2 = { data: { message: 'Backend message' } };
        expect(getErrorMessage(err2)).toBe('Backend message');
    });
});
