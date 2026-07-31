import { inngest } from "./client";
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws || WebSocket

export const syncUserCreation = inngest.createFunction(
  { 
    id: "sync-user-create",
    triggers: [
      { event: "clerk/user.created" }
    ]
  },
  async ({ event, step }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const primaryEmail =
      email_addresses?.find(
        (e) => e.id === event.data.primary_email_address_id
      )?.email_address ||
      email_addresses?.[0]?.email_address ||
      "";

    const name = [first_name, last_name].filter(Boolean).join(" ").trim() || "User";
    const image = image_url || "";

    // 🔴 FORCE INLINE RESOLUTION INSIDE THE STEP RUN BLOCK
    const result = await step.run("upsert-user-in-neon", async () => {
      // Fetching inside the running execution block guarantees freshest environment values
      const connectionString = process.env.DATABASE_URL;

      if (!connectionString) {
        throw new Error("Vercel runtime environment error: process.env.DATABASE_URL is missing or undefined inside step.run!");
      }

      // Instantiate Neon driver dynamically here
      const neonPool = new Pool({ connectionString })
      const adapter = new PrismaNeon(neonPool)
      const dynamicPrisma = new PrismaClient({ adapter })

      try {
        const user = await dynamicPrisma.user.upsert({
          where: { id: id },
          update: { email: primaryEmail, name: name, image: image },
          create: { id: id, email: primaryEmail, name: name, image: image },
        });
        return user;
      } finally {
        // Always close pools in serverless steps to prevent dangling connections
        await dynamicPrisma.$disconnect();
        await neonPool.end();
      }
    });

    return { success: true, userId: result.id };
  }
);
