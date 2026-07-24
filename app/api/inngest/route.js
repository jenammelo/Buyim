import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { syncUserCreation, syncUserUpdate, syncUserDeletion } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreation,
    syncUserUpdate,
    syncUserDeletion,
  ],
  // Explicitly tell Inngest where to read the key
  signingKey: process.env.INNGEST_SIGNING_KEY,
});