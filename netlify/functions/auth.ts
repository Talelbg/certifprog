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

  try {
    const { email, password } = JSON.parse(event.body || '{}');

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and password are required' }),
      };
    }

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
      process.env.JWT_SECRET as string,
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
