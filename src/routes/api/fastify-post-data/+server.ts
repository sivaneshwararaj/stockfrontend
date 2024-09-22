import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  const data = await request.json();
  const { fastifyURL } = locals;

  // Destructure 'path' from data and collect the rest
  const { path, ...restData } = data;

  const response = await fetch(`${fastifyURL}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Pass the rest of the data (excluding path) in the body
    body: JSON.stringify(restData),
  });

  const output = await response.json();
  return new Response(JSON.stringify(output));
};
