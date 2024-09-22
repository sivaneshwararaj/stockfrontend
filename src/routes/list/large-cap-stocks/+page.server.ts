export const load = async ({ locals }) => {
  const getLargeCapStocks = async () => {
    const { apiKey, apiURL } = locals;
    const postData = { filterList: "largeCap" };

    const response = await fetch(apiURL + "/filter-stock-list", {
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
    getLargeCapStocks: await getLargeCapStocks(),
  };
};
