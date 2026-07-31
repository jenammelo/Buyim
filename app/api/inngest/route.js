// app/api/inngest/route.js
import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { syncUserCreation } from "@/inngest/functions"; // 👈 ONLY import what exists

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreation, // 👈 Clean out the undefined variables here
  ],
});
