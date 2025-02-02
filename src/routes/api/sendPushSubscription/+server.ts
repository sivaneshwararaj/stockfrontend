import type { RequestHandler } from '@sveltejs/kit';
import webPush from 'web-push';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = import.meta.env.VITE_VAPID_PRIVATE_KEY;

webPush.setVapidDetails(
  'mailto:contact@stocknear.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export const POST: RequestHandler = async ({ request, locals }) => {
  const { pb, apiKey } = locals;

    const { title, body, key } = await request?.json();

    if (apiKey === key) {
    
        try {

            console.log(title, body)

            // Get all push subscriptions
            const subscriptions = await pb.collection('pushSubscription').getFullList({
            sort: '-created'
            });

            // Send notifications to all subscriptions
            const sendNotifications = subscriptions?.map(async (subRecord) => {
            try {
                const subscriptionData = subRecord.subscription?.subscription;
                await webPush.sendNotification(
                subscriptionData, // Ensure correct format
                body
                );
            } catch (error: any) {
                console.error('Error sending notification:', error);

                // Delete invalid subscriptions (410 means "Gone")
                if (error.statusCode === 410) {
                await pb.collection('pushSubscription').delete(subRecord.id);
                }
            }
            });

            await Promise.all(sendNotifications);

            return new Response(JSON.stringify({ success: true, message: `Notifications sent to ${subscriptions.length} devices` }));
        } catch (error: any) {
            console.error('Error sending notifications:', error);
            return new Response(JSON.stringify({ success: false, error: error.message }, { status: 500 }));
        }

    } else {
        console.log('api key wrong')
    }

};
