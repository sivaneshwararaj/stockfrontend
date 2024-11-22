export const load = async ({ locals, params, setHeaders }) => {
  const getHistoricalMarketCap = async () => {
    const { apiKey, apiURL } = locals;
    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/historical-market-cap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = await response.json();
    setHeaders({ "cache-control": "public, max-age=60*15" });

    return output;
  };

  

  // Make sure to return a promise
  return {
    getHistoricalMarketCap: await getHistoricalMarketCap(),
  };
};
