import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@/app/generated/prisma/client';
// @ts-ignore - Required for Next.js build compatibility
import ws from 'ws';

// This is mandatory for Neon to work over WebSockets in Node.js 
if (!global.WebSocket) {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = process.env.DATABASE_URL!;

// 1. Create the pool manually
const pool = new Pool({ connectionString });

// 2. Wrap it in the Prisma adapter
const adapter = new PrismaNeon(pool as any);

// 3. IMPORTANT: Tell Prisma to use the adapter
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = 
  globalForPrisma.prisma || 
  new PrismaClient({ 
    adapter, // If this is missing, Prisma looks for localhost
    log: ['error'] 
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;