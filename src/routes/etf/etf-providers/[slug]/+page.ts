import { getCache, setCache } from "$lib/store";

export const load = async ({ params, parent }) => {
  const getProviderName = async () => {
    return params.slug;
  };

  const getETFProviderData = async () => {
    let output;

    // Get cached data for the specific tickerID
    const cachedData = getCache(params.slug, "getETFProviderData");
    if (cachedData) {
      output = cachedData;
    } else {
      const { apiKey, apiURL } = await parent();
      const postData = { etfProvider: params.slug };

      const response = await fetch(apiURL + "/etf-provider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(postData),
      });

      output = await response.json();

      // Cache the data for this specific tickerID with a specific name 'getETFProviderData'
      setCache(params.slug, output, "getETFProviderData");
    }

    return output;
  };

  // Make sure to return a promise
  return {
    getETFProviderData: await getETFProviderData(),
    getProviderName: await getProviderName(),
  };
};
