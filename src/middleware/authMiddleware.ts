import type { Context, Next } from 'hono';

interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    // Get the authorization header
    const authHeader = c.req.header('authorization');
    if (!authHeader) {
      return c.json({ error: 'Authorization header is required' }, 401);
    }

    // Extract the token (remove 'Bearer ' prefix)
    const token = authHeader.replace('Bearer ', '');

    try {
      // Decode the JWT token
      const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;

      // Validate required fields
      if (!payload.sub) {
        return c.json({ error: 'Invalid token: no user ID found' }, 401);
      }

      // Add user info to context
      c.set('user', {
        id: Number(payload.sub),
        username: payload.username,
        email: payload.email,
        role: payload.role,
      });

      // Continue to the next middleware/route handler
      await next();
    } catch (e) {
      console.error('Error decoding JWT:', e);
      return c.json({ error: 'Invalid token format' }, 401);
    }
  } catch (error) {
    console.error('Unexpected error in auth middleware:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
};
