import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is missing in your environment variables.')
}

const neonPool = new Pool({ connectionString })
const adapter = new PrismaNeon(neonPool)

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma