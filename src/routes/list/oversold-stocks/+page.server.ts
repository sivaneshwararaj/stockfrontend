export const load = async ({ locals, setHeaders }) => {

  const getOverSoldStocks = async () => {
    const { apiKey, apiURL } = locals;
    const postData = { filterList: 'oversold-stocks' };

    const response = await fetch(apiURL + "/list-category", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = await response.json();
    setHeaders({ "cache-control": "public, max-age=60*5" });

    return output;
  };

  // Make sure to return a promise
  return {
    getOverSoldStocks: await getOverSoldStocks(),
  };
};
