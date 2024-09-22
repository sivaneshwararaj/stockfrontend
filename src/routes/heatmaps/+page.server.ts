import { getCache, setCache } from "$lib/store";

export const load = async ({ locals }) => {
  const { apiURL, apiKey } = locals;

  const getSP500HeatMap = async () => {
    const postData = { index: "sp500" };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/heatmaps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = await response.json();

    return output;
  };

  const getDowJonesHeatMap = async () => {
    const postData = { index: "dowjones" };
    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/heatmaps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = await response.json();

    return output;
  };

  const getNasdaqHeatMap = async () => {
    const postData = { index: "nasdaq" };
    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/heatmaps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = await response.json();

    return output;
  };

  // Make sure to return a promise
  return {
    getSP500HeatMap: await getSP500HeatMap(),
    getDowJonesHeatMap: await getDowJonesHeatMap(),
    getNasdaqHeatMap: await getNasdaqHeatMap(),
  };
};
