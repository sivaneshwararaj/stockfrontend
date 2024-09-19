import { getCache, setCache } from "$lib/store";

export const load = async ({ parent }) => {
  const getSectorIndustryOverview = async () => {
    let output;

    // Get cached data for the specific tickerID
    const cachedData = getCache("", "getSectorIndustryOverview");
    if (cachedData) {
      output = cachedData;
    } else {
      const { apiKey, apiURL } = await parent();

      const response = await fetch(apiURL + "/sector-industry-overview", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
      });

      output = await response.json();

      setCache("", output, "getSectorIndustryOverview");
    }

    return output;
  };

  // Make sure to return a promise
  return {
    getSectorIndustryOverview: await getSectorIndustryOverview(),
  };
};
