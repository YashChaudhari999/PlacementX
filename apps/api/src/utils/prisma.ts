import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
if (databaseUrl?.hostname.endsWith('.supabase.com')) {
  if (!databaseUrl.searchParams.has('sslmode')) databaseUrl.searchParams.set('sslmode', 'require');
  if (!databaseUrl.searchParams.has('connect_timeout')) databaseUrl.searchParams.set('connect_timeout', '30');
  if (!databaseUrl.searchParams.has('pool_timeout')) databaseUrl.searchParams.set('pool_timeout', '30');
  if (!databaseUrl.searchParams.has('connection_limit')) databaseUrl.searchParams.set('connection_limit', '5');
  process.env.DATABASE_URL = databaseUrl.toString();
}

const { PrismaClient } = require('@prisma/client') as typeof import('@prisma/client');
const prisma = new PrismaClient();

export default prisma;
