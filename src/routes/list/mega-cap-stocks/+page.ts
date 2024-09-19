import { getCache, setCache } from "$lib/store";

export const load = async ({ parent }) => {
  const getMegaCapStocks = async () => {
    let output;

    // Get cached data for the specific tickerID
    const cachedData = getCache("", "getMegaCapStocks");
    if (cachedData) {
      output = cachedData;
    } else {
      const { apiKey, apiURL } = await parent();
      const postData = { filterList: "megaCap" };

      const response = await fetch(apiURL + "/filter-stock-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(postData),
      });

      output = await response.json();

      // Cache the data for this specific tickerID with a specific name 'getMegaCapStocks'
      setCache("", output, "getMegaCapStocks");
    }

    return output;
  };

  // Make sure to return a promise
  return {
    getMegaCapStocks: await getMegaCapStocks(),
  };
};
