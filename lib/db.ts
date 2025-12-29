import { Pool, neonConfig } from '@neondatabase/serverless';
// @ts-ignore
import ws from 'ws';

// Mandatory for Node.js environments
if (!global.WebSocket) {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing!");
}

// Single pool instance to be reused across the app
export const pool = new Pool({ connectionString });