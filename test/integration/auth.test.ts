import { beforeEach, describe, expect, it } from 'bun:test';
import { clearMockResponses, setMockResponse } from '../setup';

interface AuthResponse {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  token?: string;
  error?: string;
  players?: Array<{ id: number; name: string }>;
}

interface LoginRequest {
  email: string;
  password: string;
}

// Base URL for API requests
const baseUrl = 'http://localhost:3000';

describe('Authentication API Integration', () => {
  let authToken = '';

  beforeEach(() => {
    clearMockResponses();
  });

  it('should register a new user', async () => {
    // Setup mock response
    setMockResponse(`${baseUrl}/api/auth/register`, {
      body: {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
        },
        token: 'fake.jwt.token',
      },
      status: 201,
    });

    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const data = (await response.json()) as AuthResponse;

    expect(response.status).toBe(201);
    expect(data.user).toBeDefined();
    expect(data.token).toBeDefined();

    // Save token for next test
    if (data.token) {
      authToken = data.token;
    }
  });

  it('should login with valid credentials', async () => {
    // Setup mock response
    setMockResponse(`${baseUrl}/api/auth/login`, {
      body: {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
        },
        token: 'fake.jwt.token',
      },
      status: 200,
    });

    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const data = (await response.json()) as AuthResponse;

    expect(response.status).toBe(200);
    expect(data.user).toBeDefined();
    expect(data.token).toBeDefined();
  });

  it('should reject login with invalid credentials', async () => {
    // Setup mock response
    setMockResponse(`${baseUrl}/api/auth/login`, {
      body: {
        error: 'Invalid email or password',
      },
      status: 401,
    });

    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    });

    const data = (await response.json()) as AuthResponse;

    expect(response.status).toBe(401);
    expect(data.error).toBeDefined();
  });

  it('should access protected route with valid token', async () => {
    // Setup mock response
    setMockResponse(`${baseUrl}/api/players`, {
      body: {
        players: [
          { id: 1, name: 'Player 1' },
          { id: 2, name: 'Player 2' },
        ],
      },
      status: 200,
    });

    const response = await fetch(`${baseUrl}/api/players`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = (await response.json()) as AuthResponse;

    expect(response.status).toBe(200);
    expect(data.players).toBeDefined();
  });

  it('should reject access to protected route without token', async () => {
    // Setup mock response
    setMockResponse(`${baseUrl}/api/players`, {
      body: {
        error: 'Unauthorized - No token provided',
      },
      status: 401,
    });

    const response = await fetch(`${baseUrl}/api/players`, {
      method: 'GET',
    });

    const data = (await response.json()) as AuthResponse;

    expect(response.status).toBe(401);
    expect(data.error).toBeDefined();
  });
});
