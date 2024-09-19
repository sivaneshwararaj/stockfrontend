export const load = async ({ locals }) => {
  const getStockList = async () => {
    const { apiKey, apiURL } = locals;

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/all-stock-tickers", {
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
    getStockList: await getStockList(),
  };
};
