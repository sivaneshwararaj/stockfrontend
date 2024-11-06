export const load = async ({ locals, params }) => {
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
  const getParams = async () => {
    return params.slug;
  };

  return {
    getMarketMover: await getMarketMover(),
    getParams: await getParams(),
  };
};
