export const load = async ({ locals, params }) => {
  const getAnalystEstimate = async () => {
    const { apiURL, apiKey } = locals;

    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/analyst-estimate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = await response.json();

    return output;
  };

  // Make sure to return a promise
  return {
    getAnalystEstimate: await getAnalystEstimate(),
  };
};
