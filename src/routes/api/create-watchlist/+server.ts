import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
    const { pb } = locals;
  const data = await request.json();
  let output;

   try {
        output = await pb.collection("watchlist").create(data)
    }
    catch(e) {
        //console.log(e)
        output = {};
    }
    console.log(output)
  return new Response(JSON.stringify(output));
};
