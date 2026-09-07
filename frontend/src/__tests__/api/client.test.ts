import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import client from '../../api/client';
import axios from 'axios';

vi.mock('axios', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        create: vi.fn(() => ({
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() },
            },
            get: vi.fn(),
        })),
    };
});

// Since we can't easily test the interceptors logic without a real axios instance or complex mocking of the instance creation itself
// We will focus on the logic we wrote.
// Be careful: Client is already created in the file.

describe('API Client', () => {
    it('is defined', () => {
        expect(client).toBeDefined();
    });
    // Further unit testing of interceptors requires exposing them or using a library like axios-mock-adapter
});
