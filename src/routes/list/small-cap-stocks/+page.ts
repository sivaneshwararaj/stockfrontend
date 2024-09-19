import { getCache, setCache } from "$lib/store";

export const load = async ({ parent }) => {
  const getSmallCapStocks = async () => {
    let output;

    // Get cached data for the specific tickerID
    const cachedData = getCache("", "getSmallCapStocks");
    if (cachedData) {
      output = cachedData;
    } else {
      const { apiKey, apiURL } = await parent();
      const postData = { filterList: "smallCap" };

      const response = await fetch(apiURL + "/filter-stock-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(postData),
      });

      output = await response.json();

      // Cache the data for this specific tickerID with a specific name 'getSmallCapStocks'
      setCache("", output, "getSmallCapStocks");
    }

    return output;
  };

  // Make sure to return a promise
  return {
    getSmallCapStocks: await getSmallCapStocks(),
  };
};
