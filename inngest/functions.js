import { inngest } from "./client";
import { prisma } from "@/lib/prisma";

export const syncUserCreation = inngest.createFunction(
  { 
    id: "sync-user-create",
    event: "clerk/user.created" 
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    // 1. Extract primary email safely
    const primaryEmail =
      email_addresses?.find(
        (e) => e.id === event.data.primary_email_address_id
      )?.email_address ||
      email_addresses?.[0]?.email_address ||
      "";

    // 2. Build non-null name required by your User model
    const name =
      [first_name, last_name].filter(Boolean).join(" ").trim() ||
      primaryEmail.split("@")[0] ||
      "User";

    // 3. Fallback for image (defaults to empty string if image_url is null/undefined)
    const image = image_url || "";

    // 4. Save to Neon database via Prisma
    await prisma.user.upsert({
      where: { id: id },
      update: {
        email: primaryEmail,
        name: name,
        image: image,
      },
      create: {
        id: id,
        email: primaryEmail,
        name: name,
        image: image,
      },
    });
  }
);