export const load = async ({ locals, setHeaders }) => {
  const getRedditTracker = async () => {
    let output;

    const { apiKey, apiURL } = locals;

    const response = await fetch(apiURL + "/reddit-tracker", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    output = await response.json();

    setHeaders({ "cache-control": "public, max-age=300" });

    return output;
  };

  // Make sure to return a promise
  return {
    getRedditTracker: await getRedditTracker(),
  };
};
