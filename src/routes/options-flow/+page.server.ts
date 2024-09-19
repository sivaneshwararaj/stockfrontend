export const load = async ({ locals }) => {
  const { apiURL, apiKey } = locals;

  const getOptionsFlowFeed = async () => {
    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/options-flow-feed", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });
    const output = await response.json();

    return output;
  };

  // Make sure to return a promise
  return {
    getOptionsFlowFeed: await getOptionsFlowFeed(),
  };
};
