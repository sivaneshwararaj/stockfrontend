import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  const { fastifyURL } = locals;

  const response = await fetch(fastifyURL + "/get-moderators", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const output = await response.json();

  return new Response(JSON.stringify(output));
};
