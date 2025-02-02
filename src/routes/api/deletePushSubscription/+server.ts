import type { RequestHandler } from "./$types";
import { error} from '@sveltejs/kit';



export const POST = (async ({ locals, request }) => {
	const { user, pb } = locals;

	if (!user?.id) {
		console.log('No username passed to addSubscription');
		throw error(401, 'Unauthorized');
	}

	const data = await request.json();

	if (!data?.subscription) {
		console.log('No subscription passed to unsubscribe', data);
		throw error(400, 'Bad Request');
	}

   
	const output = await pb.collection("pushSubscription").getFullList({
	filter: `user="${user?.id}"`,
	});

	if (output?.length > 0) {
		for (const item of output) {
			await pb.collection("pushSubscription")?.delete(item?.id);
		}
	}


  return new Response(JSON.stringify({'success': true}));

}) satisfies RequestHandler;