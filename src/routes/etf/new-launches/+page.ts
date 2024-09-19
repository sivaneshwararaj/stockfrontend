import { getCache, setCache } from "$lib/store";

export const load = async ({ parent }) => {
  const getETFNewLaunches = async () => {
    let output;

    // Get cached data for the specific tickerID
    const cachedData = getCache("", "getETFNewLaunches");
    if (cachedData) {
      output = cachedData;
    } else {
      const { apiKey, apiURL } = await parent();

      // make the POST request to the endpoint
      const response = await fetch(apiURL + "/etf-new-launches", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
      });

      output = await response.json();

      // Cache the data for this specific tickerID with a specific name 'getETFNewLaunches'
      setCache("", output, "getETFNewLaunches");
    }

    return output;
  };

  // Make sure to return a promise
  return {
    getETFNewLaunches: await getETFNewLaunches(),
  };
};
