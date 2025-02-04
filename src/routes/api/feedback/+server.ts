import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  const data = await request.json();
  const { pb } = locals;
  let output = 'failure';
  try {
        await pb.collection("feedback").create(data)
        output = 'success';
    }
    catch(e) {
        console.log(e)
        output = 'failure';
    }

  return new Response(JSON.stringify(output));
};
