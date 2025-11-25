import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { query } from './db';

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not configured');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }

  let email: string;
  let password: string;

  try {
    const body = JSON.parse(event.body || '{}');
    email = body.email;
    password = body.password;
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request body' }),
    };
  }

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Email and password are required' }),
    };
  }

  try {
    const result = await query('SELECT * FROM admins WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      body: JSON.stringify({ token, user: userWithoutPassword }),
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
