import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import * as jwt from 'jsonwebtoken';
import { query } from './db';

const entityTableMap: Record<string, string> = {
  developers: 'developers',
  invoices: 'invoices',
  events: 'events',
  admins: 'admins',
  agreements: 'agreements',
  campaigns: 'campaigns',
  registry: 'registry',
};

// Validate column names to prevent SQL injection (only allow alphanumeric and underscore)
const isValidColumnName = (name: string): boolean => {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
};

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  // Verify Bearer token
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const token = authHeader.substring(7);
  
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not configured');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }

  try {
    // Decode the token to retrieve user role
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }

  // Handle GET requests
  if (event.httpMethod === 'GET') {
    try {
      const type = event.queryStringParameters?.type;
      
      if (!type) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing type parameter' }),
        };
      }

      let tableName: string | undefined;

      switch (type) {
        case 'developers':
          tableName = entityTableMap.developers;
          break;
        case 'invoices':
          tableName = entityTableMap.invoices;
          break;
        case 'events':
          tableName = entityTableMap.events;
          break;
        case 'admins':
          tableName = entityTableMap.admins;
          break;
        case 'agreements':
          tableName = entityTableMap.agreements;
          break;
        case 'campaigns':
          tableName = entityTableMap.campaigns;
          break;
        case 'registry':
          tableName = entityTableMap.registry;
          break;
        default:
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid type parameter' }),
          };
      }

      const result = await query(`SELECT * FROM ${tableName}`);
      return {
        statusCode: 200,
        body: JSON.stringify(result.rows),
      };
    } catch (error) {
      console.error('GET error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      };
    }
  }

  // Handle POST requests
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { type, data } = body;

      if (!type || !data) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing type or data in request body' }),
        };
      }

      const tableName = entityTableMap[type];
      if (!tableName) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid type parameter' }),
        };
      }

      const keys = Object.keys(data);
      
      // Validate all column names to prevent SQL injection
      for (const key of keys) {
        if (!isValidColumnName(key)) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid column name in data' }),
          };
        }
      }
      
      const values = Object.values(data);
      const columns = keys.join(', ');
      const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');

      const insertQuery = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
      const result = await query(insertQuery, values);

      return {
        statusCode: 200,
        body: JSON.stringify(result.rows[0]),
      };
    } catch (error) {
      console.error('POST error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};
