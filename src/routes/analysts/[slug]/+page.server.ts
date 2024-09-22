export const load = async ({ locals, setHeaders, params }) => {
  const getAnalystStats = async () => {
    const { apiURL, apiKey, user } = locals;

    const postData = { analystId: params.slug };
    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/analyst-stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    let output = await response.json();

    setHeaders({ "cache-control": "public, max-age=3000" });

    return output;
  };

  // Make sure to return a promise
  return {
    getAnalystStats: await getAnalystStats(),
  };
};
