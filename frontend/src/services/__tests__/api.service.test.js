import { describe, beforeEach, test, expect, vi } from 'vitest';
import apiService from '../api.service';
import Logger from '../../utils/logger';

// Mock fetch globally
global.fetch = vi.fn();

describe('ApiService', () => {
    beforeEach(() => {
        fetch.mockReset();
        vi.spyOn(Logger, 'apiError').mockImplementation(() => { });
        vi.spyOn(Logger, 'error').mockImplementation(() => { });
    });

    test('successful GET returns unwrapped data', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({ code: 0, message: 'ok', data: { value: 42 } }),
        };
        fetch.mockResolvedValueOnce(mockResponse);

        const data = await apiService.get('/test');
        expect(data).toEqual({ code: 0, message: 'ok', data: { value: 42 } });
    });

    test('handles validation error with fieldErrors', async () => {
        const mockResponse = {
            ok: false,
            status: 400,
            statusText: 'Bad Request',
            json: async () => ({
                code: 'VALIDATION',
                message: 'Invalid input',
                data: { fieldErrors: { email: 'Invalid email' } },
            }),
        };
        fetch.mockResolvedValueOnce(mockResponse);

        await expect(apiService.get('/test')).rejects.toMatchObject({
            fieldErrors: { email: 'Invalid email' },
            message: 'Invalid input',
            code: 'VALIDATION',
        });
    });

    test('retries on network error', async () => {
        const networkError = new Error('Network failure');
        networkError.response = undefined; // simulate no response
        fetch
            .mockRejectedValueOnce(networkError) // first attempt fails
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: { success: true } }),
            }); // second attempt succeeds

        const data = await apiService.get('/retry-test');
        expect(data).toEqual({ data: { success: true } });
        expect(fetch).toHaveBeenCalledTimes(2);
    });
});
