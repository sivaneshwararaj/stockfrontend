export const load = async ({ locals }) => {
  const getInsiderTracker = async () => {
    const { apiKey, apiURL, user } = locals;

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/insider-tracker", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    let output = await response.json();
    output = user?.tier !== "Pro" ? output?.slice(0, 6) : output;

    return output;
  };

  // Make sure to return a promise
  return {
    getInsiderTracker: await getInsiderTracker(),
  };
};
