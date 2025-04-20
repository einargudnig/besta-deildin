import { afterAll, afterEach, beforeAll } from 'bun:test';

interface MockResponseInit {
  body: unknown;
  status: number;
  headers?: Record<string, string>;
}

// Mock fetch responses
const mockResponses = new Map<string, MockResponseInit>();

export function setMockResponse(url: string, init: MockResponseInit) {
  mockResponses.set(url, init);
}

export function clearMockResponses() {
  mockResponses.clear();
}

// Override global fetch
const originalFetch = global.fetch;
const mockFetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input.toString();
  const mockResponse = mockResponses.get(url);
  if (mockResponse) {
    return new Response(JSON.stringify(mockResponse.body), {
      status: mockResponse.status,
      headers: {
        'Content-Type': 'application/json',
        ...(mockResponse.headers || {}),
      },
    });
  }
  return originalFetch(input, init);
};

// Add missing preconnect property
Object.defineProperty(mockFetch, 'preconnect', {
  value: originalFetch.preconnect,
  writable: false,
});

// Type assertion to ensure mockFetch matches the fetch type
global.fetch = mockFetch as typeof fetch;

// Setup and teardown
beforeAll(() => {
  // Setup runs before all tests
});

afterEach(() => {
  // Clear mock responses after each test
  clearMockResponses();
});

afterAll(() => {
  // Restore original fetch
  global.fetch = originalFetch;
});
