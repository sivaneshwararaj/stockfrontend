import { getCache, setCache } from "$lib/store";

export const load = async ({ parent }) => {
  const getStockSplitsCalendar = async () => {
    let output;

    // Get cached data for the specific tickerID
    const cachedData = getCache("", "getStockSplitsCalendar");
    if (cachedData) {
      output = cachedData;
    } else {
      const { apiKey, apiURL } = await parent();
      // make the POST request to the endpoint
      const response = await fetch(apiURL + "/stock-splits-calendar", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
      });

      output = await response.json();

      // Cache the data for this specific tickerID with a specific name 'getStockSplitsCalendar'
      setCache("", output, "getStockSplitsCalendar");
    }

    return output;
  };

  // Make sure to return a promise
  return {
    getStockSplitsCalendar: await getStockSplitsCalendar(),
  };
};
