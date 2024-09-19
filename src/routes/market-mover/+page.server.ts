export const load = async ({ locals, setHeaders }) => {
  const { apiURL, apiKey } = locals;

  const getDailyGainerLoserActive = async () => {
    const response = await fetch(apiURL + "/market-movers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    const output = await response.json();

    return output;
  };

  const getMiniPlotsIndex = async () => {
    const response = await fetch(apiURL + "/mini-plots-index", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    const output = await response.json();

    return output;
  };

  setHeaders({ "cache-control": "public, max-age=3000" });
  // Make sure to return a promise
  return {
    getDailyGainerLoserActive: await getDailyGainerLoserActive(),
    getMiniPlotsIndex: await getMiniPlotsIndex(),
  };
};
