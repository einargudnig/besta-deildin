import type { Context, Next } from 'hono';
import { jwtVerify } from 'jose';
import { env } from '../config/env';

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

export const authenticate = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const { payload } = await jwtVerify(token, secretKey);

    c.set('user', payload);

    await next();
  } catch (error) {
    console.error('Authentication error:', error);
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
};

// Optional middleware to check for specific roles
export const requireRole = (role: string) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user || user.role !== role) {
      return c.json({ error: 'Unauthorized - Insufficient permissions' }, 403);
    }

    await next();
  };
};

// // Future enhancement to auth.ts
// export const authenticate = async (c: Context, next: Next) => {
//   try {
//     const authHeader = c.req.header('Authorization');

//     if (!authHeader) {
//       return c.json({ error: 'Unauthorized - No token provided' }, 401);
//     }

//     // Determine token type
//     if (authHeader.startsWith('Bearer ')) {
//       // Your JWT token
//       const token = authHeader.split(' ')[1];
//       const { payload } = await jwtVerify(token, secretKey);
//       c.set('user', payload);
//     }
//     else if (authHeader.startsWith('Clerk ')) {
//       // Clerk token
//       const token = authHeader.split(' ')[1];
//       const userData = await authService.verifyExternalToken(token, 'clerk');
//       c.set('user', userData);
//     }
//     else if (authHeader.startsWith('WorkOS ')) {
//       // WorkOS token
//       const token = authHeader.split(' ')[1];
//       const userData = await authService.verifyExternalToken(token, 'workos');
//       c.set('user', userData);
//     }
//     else {
//       return c.json({ error: 'Unauthorized - Invalid token format' }, 401);
//     }

//     await next();
//   } catch (error) {
//     console.error('Authentication error:', error);
//     return c.json({ error: 'Unauthorized - Invalid token' }, 401);
//   }
// };
