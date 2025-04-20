import { beforeAll, describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { authenticate } from '../src/middleware/auth';
import authRoutes from '../src/routes/authRoutes';

interface User {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
  role: string;
  created_at?: Date;
  updated_at?: Date;
}

// Mock modules
const mockDatabase = {
  query: () => Promise.resolve({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] }),
  getClient: () =>
    Promise.resolve({ release: () => {}, query: () => Promise.resolve({ rows: [] }) }),
};

const mockUserRepository = {
  findByEmail: () => Promise.resolve(null as User | null),
  create: (user: any) =>
    Promise.resolve({ ...user, id: 1, created_at: new Date(), updated_at: new Date() } as User),
};

// Mock bcrypt
const mockBcrypt = {
  compare: () => Promise.resolve(true),
};

// Mock jose
const mockJose = {
  jwtVerify: () =>
    Promise.resolve({
      payload: { sub: '1', username: 'testuser', email: 'test@example.com', role: 'user' },
    }),
};

// Mock the modules
import.meta.require = ((id: string) => {
  if (id === '../src/config/database') return mockDatabase;
  if (id === '../src/repositories/userRepository') return { userRepository: mockUserRepository };
  if (id === 'bcrypt') return mockBcrypt;
  if (id === 'jose') return mockJose;
  return import.meta.require(id);
}) as any;

interface AuthResponse {
  user?: {
    username: string;
    email: string;
  };
  token?: string;
  error?: string;
  message?: string;
}

describe('Authentication API', () => {
  let app: Hono;

  beforeAll(() => {
    // Create a test app with auth routes
    app = new Hono();
    app.route('/api/auth', authRoutes);

    // Add a protected route for testing
    const protectedRoute = new Hono();
    protectedRoute.get('/', (c) => c.json({ message: 'Protected data' }));
    app.use('/api/protected/*', authenticate);
    app.route('/api/protected', protectedRoute);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Override mock for this test
      mockUserRepository.findByEmail = () => Promise.resolve(null);
      mockUserRepository.create = () =>
        Promise.resolve({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
          created_at: new Date(),
          updated_at: new Date(),
        } as User);

      // Create a test request
      const req = new Request('http://localhost/api/auth/register', {
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

      // Send the request to our app
      const res = await app.request(req);
      const data = (await res.json()) as AuthResponse;

      // Assertions
      expect(res.status).toBe(201);
      expect(data.user!).toBeDefined();
      expect(data.token).toBeDefined();
      expect(data.user!.username).toBe('testuser');
      expect(data.user!.email).toBe('test@example.com');
    });

    it('should return 409 if user already exists', async () => {
      // Override mock for this test
      mockUserRepository.findByEmail = () =>
        Promise.resolve({
          id: 1,
          username: 'existinguser',
          email: 'existing@example.com',
          password_hash: 'hashedpassword',
          role: 'user',
        } as User);

      // Create a test request
      const req = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123',
        }),
      });

      // Send the request to our app
      const res = await app.request(req);
      const data = (await res.json()) as AuthResponse;

      // Assertions
      expect(res.status).toBe(409);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      // Override mock for this test
      mockUserRepository.findByEmail = () =>
        Promise.resolve({
          id: 1,
          username: 'loginuser',
          email: 'login@example.com',
          password_hash: 'hashedpassword',
          role: 'user',
        } as User);
      mockBcrypt.compare = () => Promise.resolve(true);

      // Create a test request
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'login@example.com',
          password: 'password123',
        }),
      });

      // Send the request to our app
      const res = await app.request(req);
      const data = (await res.json()) as AuthResponse;

      // Assertions
      expect(res.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.token).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      // Override mock for this test
      mockUserRepository.findByEmail = () =>
        Promise.resolve({
          id: 1,
          username: 'loginuser',
          email: 'login@example.com',
          password_hash: 'hashedpassword',
          role: 'user',
        } as User);
      mockBcrypt.compare = () => Promise.resolve(false);

      // Create a test request
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'login@example.com',
          password: 'wrongpassword',
        }),
      });

      // Send the request to our app
      const res = await app.request(req);
      const data = (await res.json()) as AuthResponse;

      // Assertions
      expect(res.status).toBe(401);
      expect(data.error).toBeDefined();
    });
  });
});
