import { getCache, setCache } from "$lib/store";

export const load = async ({ parent }) => {
  const getAllETFProviders = async () => {
    let output;

    // Get cached data for the specific tickerID
    const cachedData = getCache("", "getAllETFProviders");
    if (cachedData) {
      output = cachedData;
    } else {
      const { apiKey, apiURL } = await parent();
      const response = await fetch(apiURL + "/all-etf-providers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
      });

      output = await response.json();

      // Cache the data for this specific tickerID with a specific name 'getAllETFProviders'
      setCache("", output, "getAllETFProviders");
    }

    return output;
  };

  // Make sure to return a promise
  return {
    getAllETFProviders: await getAllETFProviders(),
  };
};
