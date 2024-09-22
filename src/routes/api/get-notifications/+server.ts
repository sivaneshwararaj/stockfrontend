import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  const data = await request.json();
  const { fastifyURL } = locals;

  const response = await fetch(fastifyURL + "/get-notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const output = await response.json();

  return new Response(JSON.stringify(output));
};
