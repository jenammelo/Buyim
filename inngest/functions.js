import { inngest } from './client';
import { prisma } from '@/lib/prisma';

// Inngest function to save user data to the database
export const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-create', event: 'clerk/user.created' },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url, profile_image_url } = event.data;

    await prisma.user.create({
      data: {
        id,
        email: email_addresses?.[0]?.email_address || '',
        name: `${first_name || ''} ${last_name || ''}`.trim(),
        image: image_url || profile_image_url || '',
      },
    });
  }
);

// Inngest function to update user data in the database
export const syncUserUpdate = inngest.createFunction(
  { id: 'sync-user-update', event: 'clerk/user.updated' },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url, profile_image_url } = event.data;

    await prisma.user.update({
      where: { id },
      data: {
        email: email_addresses?.[0]?.email_address || '',
        name: `${first_name || ''} ${last_name || ''}`.trim(),
        image: image_url || profile_image_url || '',
      },
    });
  }
);

// Inngest function to delete user from database
export const syncUserDeletion = inngest.createFunction(
  { id: 'sync-user-delete', event: 'clerk/user.deleted' },
  async ({ event }) => {
    const { id } = event.data;

    await prisma.user.delete({
      where: { id },
    });
  }
);