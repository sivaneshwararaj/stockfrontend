export const load = async ({ locals }) => {
  const { apiKey, apiURL } = locals;

  const getTechnologySector = async () => {
    const postData = { filterList: "technology" };

    const response = await fetch(apiURL + "/filter-stock-list", {
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

  const getHistoricalSector = async () => {
    const postData = { filterList: "technology" };

    const response = await fetch(apiURL + "/historical-sector-price", {
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
    getTechnologySector: await getTechnologySector(),
    getHistoricalSector: await getHistoricalSector(),
  };
};
