export const load = async ({ locals, setHeaders }) => {
  const getAllHedgeFunds = async () => {
    const { apiURL, apiKey } = locals;
    const response = await fetch(apiURL + "/all-hedge-funds", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    const output = await response.json();
    //setHeaders({ "cache-control": "public, max-age=3000" });

    return output;
  };

  // Make sure to return a promise
  return {
    getAllHedgeFunds: await getAllHedgeFunds(),
  };
};
