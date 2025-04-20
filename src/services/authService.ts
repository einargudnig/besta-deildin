import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';
import { env } from '../config/env';
import { userRepository } from '../repositories/userRepository';

// Convert string to Uint8Array for jose
const secretKey = new TextEncoder().encode(env.JWT_SECRET);

export const authService = {
  async login(email: string, password: string) {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = await this.generateToken(user);

    // Return user data (without password) and token
    const { password_hash, ...userData } = user;
    return {
      user: userData,
      token,
    };
  },

  async register(username: string, email: string, password: string) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await userRepository.create({
      username,
      email,
      password_hash: passwordHash,
      role: 'user', // Default role
    });

    // Generate JWT token
    const token = await this.generateToken(user);

    // Return user data (without password) and token
    const { password_hash: _, ...userData } = user;
    return {
      user: userData,
      token,
    };
  },

  async generateToken(user: { id: number; username: string; email: string; role: string }) {
    // Create a JWT token that expires in 24 hours
    const token = await new SignJWT({
      sub: user.id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secretKey);

    return token;
  },

  // Method to verify external tokens (for future integration)
  async verifyExternalToken(token: string, provider: 'clerk' | 'workos') {
    // This is a placeholder for future implementation
    // Each provider will have its own verification logic

    switch (provider) {
      case 'clerk':
        // Verify with Clerk's API
        // const userData = await verifyClerkToken(token);
        break;
      case 'workos':
        // Verify with WorkOS's API
        // const userData = await verifyWorkOSToken(token);
        break;
    }

    // For now, just throw an error
    throw new Error('External provider verification not implemented');
  },
};
