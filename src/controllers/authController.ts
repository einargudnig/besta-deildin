import type { Context } from 'hono';
import { authService } from '../services/authService';

export const authController = {
  async login(c: Context) {
    try {
      const { email, password } = await c.req.json();
      
      if (!email || !password) {
        return c.json({ error: 'Email and password are required' }, 400);
      }
      
      const result = await authService.login(email, password);
      return c.json(result);
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof Error && error.message === 'Invalid credentials') {
        return c.json({ error: 'Invalid email or password' }, 401);
      }
      
      return c.json({ error: 'Authentication failed' }, 500);
    }
  },
  
  async register(c: Context) {
  try {
    const { username, email, password } = await c.req.json();
    
    if (!username || !email || !password) {
      return c.json({ error: 'Username, email, and password are required' }, 400);
    }
    
    console.log('Registration attempt:', { username, email });
    
    try {
      const result = await authService.register(username, email, password);
      return c.json(result, 201);
    } catch (serviceError) {
      console.error('Service error:', serviceError);
      if (serviceError instanceof Error) {
        return c.json({ error: serviceError.message }, 
          serviceError.message === 'User already exists' ? 409 : 500);
      }
      return c.json({ error: 'Registration failed' }, 500);
    }
  } catch (error) {
    console.error('Registration controller error:', error);
    
    if (error instanceof Error) {
      return c.json({ error: `Registration failed: ${error.message}` }, 500);
    }
    
    return c.json({ error: 'Registration failed' }, 500);
  }
}

};
