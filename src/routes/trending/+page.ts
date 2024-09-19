import { getCache, setCache } from "$lib/store";

export const load = async ({ parent }) => {
  const getTrendingStocks = async () => {
    let output;

    // Get cached data for the specific tickerID
    const cachedData = getCache("", "getTrendingStocks");
    if (cachedData) {
      output = cachedData;
    } else {
      const { apiKey, apiURL } = await parent();
      // make the POST request to the endpoint
      const response = await fetch(apiURL + "/trending", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
      });

      output = await response.json();

      // Cache the data for this specific tickerID with a specific name 'getTrendingStocks'
      setCache("", output, "getTrendingStocks");
    }

    return output;
  };

  // Make sure to return a promise
  return {
    getTrendingStocks: await getTrendingStocks(),
  };
};
