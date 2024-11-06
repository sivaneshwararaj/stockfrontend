export const load = async ({ locals }) => {
  const { apiURL, apiKey } = locals;

  const getMarketMover = async () => {
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
  /*
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
  */
  return {
    getMarketMover: await getMarketMover(),
  };
};
