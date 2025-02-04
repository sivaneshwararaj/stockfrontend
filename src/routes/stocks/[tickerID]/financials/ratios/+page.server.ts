export const load = async ({ locals, params }) => {
  const getRatiosStatement = async () => {
    const { apiKey, apiURL } = locals;

    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/stock-ratios", {
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
    getRatiosStatement: await getRatiosStatement(),
  };
};
