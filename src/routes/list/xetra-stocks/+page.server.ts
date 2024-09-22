export const load = async ({ locals }) => {
  const getXetraStocks = async () => {
    const { apiURL, apiKey } = locals;
    const postData = { filterList: "xetra" };

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
    getXetraStocks: await getXetraStocks(),
  };
};
