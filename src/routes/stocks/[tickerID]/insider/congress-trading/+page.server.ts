export const load = async ({ locals, params }) => {
  const getSenateTrading = async () => {
    const { apiURL, apiKey, user} = locals;

    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/congress-trading-ticker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    let output = await response.json();
    output = user?.tier !== "Pro" ? output?.slice(0, 3) : output;

    return output;
  };

  // Make sure to return a promise
  return {
    getSenateTrading: await getSenateTrading(),
  };
};
