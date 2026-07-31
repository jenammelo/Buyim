// lib/prisma.js
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// 1. Configure the Neon driver to use the correct WebSocket library for server environments
neonConfig.webSocketConstructor = ws || WebSocket

// 2. Fetch the environment string
let connectionString = "postgresql://neondb_owner:npg_sUp9Vbud2mlP@ep-red-wildflower-avz1a27c-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

// 3. CRITICAL FALLBACK: If process.env is blank due to Next.js background caching,
// manually try to read from the .env file before throwing an initialization error.
if (!connectionString) {
  try {
    const fs = require('fs')
    const path = require('path')
    const envPath = path.resolve(process.cwd(), '.env')
    
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8')
      const match = envFile.match(/^DATABASE_URL=["']?([^"'\r\n]+)["']?/m)
      if (match && match[1]) {
        connectionString = match[1]
      }
    }
  } catch (e) {
    console.error("Failed to parse fallback .env file:", e)
  }
}

// 4. Final safety validation check
if (!connectionString) {
  throw new Error('DATABASE_URL is missing in your environment variables. Check your .env file location.')
}

// 5. Initialize the Serverless Neon connection pool securely
const neonPool = new Pool({ connectionString: connectionString })
const adapter = new PrismaNeon(neonPool)

// 6. Prevent multiple instances of Prisma Client from creating connection leaks in development
const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
