export const load = async ({ locals }) => {
  const getAllETFProviders = async () => {
    const { apiKey, apiURL } = locals;
    const response = await fetch(apiURL + "/all-etf-providers", {
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
    getAllETFProviders: await getAllETFProviders(),
  };
};
