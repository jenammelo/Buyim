import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  syncUserCreation,
  syncUserUpdate,
  syncUserDeletion,
} from "@/inngest/functions";

// Next.js App Router expects GET, POST, and PUT exported directly
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreation,
    syncUserUpdate,
    syncUserDeletion,
  ],
});