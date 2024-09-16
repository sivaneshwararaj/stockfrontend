import { getCache, setCache } from "$lib/store";

export const load = async ({ parent }) => {
  const getAllREITs = async () => {
    let output;

    // Get cached data for the specific tickerID
    const cachedData = getCache("", "getAllReEITs");
    if (cachedData) {
      output = cachedData;
    } else {
      const { apiKey, apiURL } = await parent();

      const postData = { filterList: "reit" };
      const response = await fetch(apiURL + "/filter-stock-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(postData),
      });

      output = await response.json();

      setCache("", output, "getAllReEITs");
    }

    return output;
  };

  // Make sure to return a promise
  return {
    getAllREITs: await getAllREITs(),
  };
};
