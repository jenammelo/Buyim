import { inngest } from "./client";
import { prisma } from "@/lib/prisma";

export const syncUserCreation = inngest.createFunction(
  { 
    id: "sync-user-create",
    triggers: [
      { event: "clerk/user.created" }
    ]
  },
  async ({ event, step }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    // 1. CRITICAL FIX: Ensure ID falls back to a dummy string if testing via Clerk UI
    const userId = id || `mock_user_${Date.now()}`;

    // 2. Safe primary email extract fallback
    const primaryEmail =
      email_addresses?.find(
        (e) => e.id === event.data.primary_email_address_id
      )?.email_address ||
      email_addresses?.[0]?.email_address ||
      `test-${userId}@example.com`; // 👈 Fallback email for tests

    // 3. Build non-null name required by your User model
    const name =
      [first_name, last_name].filter(Boolean).join(" ").trim() ||
      primaryEmail.split("@")[0] ||
      "User";

    // 4. Fallback for image
    const image = image_url || "";

    // 5. Run the safe database transaction
    const result = await step.run("upsert-user-in-neon", async () => {
      const user = await prisma.user.upsert({
        where: { id: userId }, // 👈 Use the guaranteed userId variable
        update: {
          email: primaryEmail,
          name: name,
          image: image,
        },
        create: {
          id: userId, // 👈 Use the guaranteed userId variable
          email: primaryEmail,
          name: name,
          image: image,
        },
      });

      const count = await prisma.user.count();
      console.log("\n=========================================");
      console.log(`!!! USERS IN THIS CONNECTED DB ROW COUNT: ${count} !!!`);
      console.log("=========================================\n");

      return user;
    });

    return { success: true, userId: result.id };
  }
);
