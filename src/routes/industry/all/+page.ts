import { getCache, setCache } from "$lib/store";

export const load = async ({ parent }) => {
  const getIndustryOverview = async () => {
    let output;

    // Get cached data for the specific tickerID
    const cachedData = getCache("", "getIndustryOverview");
    if (cachedData) {
      output = cachedData;
    } else {
      const { apiKey, apiURL } = await parent();

      const response = await fetch(apiURL + "/industry-overview", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
      });

      output = await response.json();

      setCache("", output, "getIndustryOverview");
    }

    return output;
  };

  // Make sure to return a promise
  return {
    getIndustryOverview: await getIndustryOverview(),
  };
};
