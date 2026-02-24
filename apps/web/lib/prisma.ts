// lib/prisma.ts — Prisma v7 requires an adapter for connection configuration
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Force load .env.local for production DIY setups where Next.js doesn't auto-load it
if (process.env.NODE_ENV === 'production') {
    for (const p of ['.env.local', '../../.env.local']) {
        const envPath = path.resolve(process.cwd(), p);
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath, override: true });
            break;
        }
    }
}

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({ adapter });
}

// Singleton: prevents connection pool exhaustion during Next.js hot-reloads
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
