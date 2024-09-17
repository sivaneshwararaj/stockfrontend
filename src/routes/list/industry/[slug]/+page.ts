import { getCache, setCache } from "$lib/store";

export const load = async ({ parent, params }) => {
  const getIndustryStocks = async () => {
    let output;
    const { apiKey, apiURL } = await parent();

    const cachedData = getCache(params.slug, "getIndustryStocks");
    if (cachedData) {
      output = cachedData;
    } else {
      const postData = { ticker: params.slug };
      const response = await fetch(apiURL + "/industry-stocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(postData),
      });

      output = await response.json();

      setCache(params.slug, output, "getIndustryStocks");
    }

    //output = user?.tier !== "Pro" ? output?.slice(0, 5) : output;

    //output = data?.user?.tier !== 'Pro' ? output?.slice(0,6) : output;

    return output;
  };

  // Make sure to return a promise
  return {
    getIndustryStocks: await getIndustryStocks(),
  };
};
