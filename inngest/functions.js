import { inngest } from './client';
import { prisma } from '@/lib/prisma';

// 1. Sync User Creation
export const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-create' },
  { event: 'clerk/user.created' }, // Trigger moved to 2nd argument
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url, profile_image_url } = event.data;
    const email = email_addresses?.[0]?.email_address || '';
    const name = `${first_name || ''} ${last_name || ''}`.trim();
    const image = image_url || profile_image_url || '';

    // upsert creates the user or updates if they already exist
    await prisma.user.upsert({
      where: { id },
      update: { email, name, image },
      create: { id, email, name, image },
    });
  }
);

// 2. Sync User Update
export const syncUserUpdate = inngest.createFunction(
  { id: 'sync-user-update' },
  { event: 'clerk/user.updated' },
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

// 3. Sync User Deletion
export const syncUserDeletion = inngest.createFunction(
  { id: 'sync-user-delete' },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {
    const { id } = event.data;

    await prisma.user.delete({
      where: { id },
    });
  }
);