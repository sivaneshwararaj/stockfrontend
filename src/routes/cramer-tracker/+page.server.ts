export const load = async ({ locals }) => {
  const getCramerTracker = async () => {
    const { apiKey, apiURL, user } = locals;

    const response = await fetch(apiURL + "/cramer-tracker", {
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
    getCramerTracker: await getCramerTracker(),
  };
};
