import type { RequestHandler } from "./$types";
import { error} from '@sveltejs/kit';

import webpush from "web-push";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = import.meta.env.VITE_VAPID_PRIVATE_KEY;

function initWebPush() {
    webpush.setVapidDetails('mailto:contact@stocknear.com',VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY )
}

async function sendNotification(subscription, payload) {
	try {
		const res = await webpush.sendNotification(subscription, payload);
		return {
			ok: res.statusCode === 201,
			status: res.statusCode,
			body: res.body
		};
	} catch (err) {
		const msg = `Could not send notification: ${err}`;
		console.error(msg);
		return {
			ok: false,
			status: undefined,
			body: msg
		};
	}
}


export const POST = (async ({ locals, request }) => {
	const { user, pb } = locals;

	if (!user?.id) {
		console.log('No username passed to addSubscription');
		throw error(401, 'Unauthorized');
	}

	const data = await request.json();

	if (!data?.subscription) {
		console.log('No subscription passed to addSubscription', data);
		throw error(400, 'Bad Request');
	}

    initWebPush()
	// find all subscription of users if they exist and delete them first before creating the new one.

	const output = await pb.collection("pushSubscription").getFullList({
	filter: `user="${user?.id}"`,
	});

	if (output?.length > 0) {
		for (const item of output) {
			await pb.collection("pushSubscription").delete(item?.id);
		}
	}

	
	await pb.collection("pushSubscription").create({user: user?.id, subscription: data})
		

	//addUserDevice(username, data.subscription);
	//addUserToChannel(username, 'album-updates');

  return new Response(JSON.stringify({'success': true}));

}) satisfies RequestHandler;