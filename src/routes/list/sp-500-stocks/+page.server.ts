export const load = async ({ locals }) => {
  const getSPConstituentsStocks = async () => {
    const { apiKey, apiURL } = locals;

    const postData = { filterList: "sp500Constituent" };

    const response = await fetch(apiURL + "/exchange-constituents", {
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
    getSPConstituentsStocks: await getSPConstituentsStocks(),
  };
};
