import { query } from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/hashPassword';
import { generateToken, TokenPayload } from '../../utils/jwt';
import { SignupRequest, LoginRequest, User } from '../../types';

export const authService = {
  async signup(userData: SignupRequest): Promise<Omit<User, 'password'>> {
    const { name, email, password, role = 'contributor' } = userData;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(password);

    const result = await query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashedPassword, role]
    );

    return result.rows[0];
  },

  async login(credentials: LoginRequest): Promise<{ token: string; user: Omit<User, 'password'> }> {
    const { email, password } = credentials;

    const result = await query(
      'SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(tokenPayload);

    const { password: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  },

  async getUserById(id: number): Promise<Omit<User, 'password'> | null> {
    const result = await query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  },
};