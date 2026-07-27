import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { inngest } from '@/inngest/client';

export async function POST(req) {
  const headerPayload = headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing Clerk webhook headers', { status: 400 });
  }

  const payload = await req.text();
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new Response('Missing CLERK_WEBHOOK_SECRET', { status: 500 });
  }

  const wh = new Webhook(webhookSecret);

  let evt;

  try {
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    return new Response('Invalid webhook signature', { status: 400 });
  }

  const eventType = evt?.type;
  const eventData = evt?.data || {};

  if (!eventType) {
    return new Response('Missing event type', { status: 400 });
  }

  const eventNameMap = {
    'user.created': 'clerk/user.created',
    'user.updated': 'clerk/user.updated',
    'user.deleted': 'clerk/user.deleted',
  };

  const inngestEventName = eventNameMap[eventType];

  if (!inngestEventName) {
    return new Response(`Unsupported event type: ${eventType}`, { status: 200 });
  }

  await inngest.send({
    name: inngestEventName,
    data: {
      id: eventData.id,
      first_name: eventData.first_name,
      last_name: eventData.last_name,
      email_addresses: eventData.email_addresses,
      image_url: eventData.image_url,
      profile_image_url: eventData.profile_image_url,
    },
  });

  return new Response(JSON.stringify({ received: true, eventType }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
