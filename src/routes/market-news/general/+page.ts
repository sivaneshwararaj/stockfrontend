import { getCache, setCache } from "$lib/store";

export const load = async ({ parent }) => {
  const getGeneralNews = async () => {
    let output;

    // Get cached data for the specific tickerID
    const cachedData = getCache("", "getGeneralNews");
    if (cachedData) {
      output = cachedData;
    } else {
      const { apiURL, apiKey } = await parent();
      const postData = { newsType: "general-news" };

      // make the POST request to the endpoint
      const response = await fetch(apiURL + "/market-news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(postData),
      });

      output = await response.json();

      // Cache the data for this specific tickerID with a specific name 'getGeneralNews'
      setCache("", output, "getGeneralNews");
    }

    return output;
  };

  // Make sure to return a promise
  return {
    getGeneralNews: await getGeneralNews(),
  };
};
