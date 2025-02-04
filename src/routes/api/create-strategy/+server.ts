import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
    const { pb } = locals;
  const data = await request.json();


    let output;
    try {
        output = await pb.collection("stockscreener").create(data)
    }
    catch(e) {
        output = {};
    }

  return new Response(JSON.stringify(output));
};
