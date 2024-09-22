import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  const { apiURL, apiKey } = locals;

  const response = await fetch(apiURL + "/searchbar-data", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
  });

  const output = await response?.json();

  return new Response(JSON.stringify(output));
};
