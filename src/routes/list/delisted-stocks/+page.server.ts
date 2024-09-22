export const load = async ({ locals }) => {
  const getDelistedStocks = async () => {
    const { apiKey, apiURL } = locals;

    const response = await fetch(apiURL + "/delisted-companies", {
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
    getDelistedStocks: await getDelistedStocks(),
  };
};
