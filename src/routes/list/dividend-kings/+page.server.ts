export const load = async ({ locals }) => {
  const getDividendKings = async () => {
    const { apiKey, apiURL } = locals;

    const response = await fetch(apiURL + "/dividend-kings", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    const output = await response.json();

    return output;
  };

  // Make sure to return a promise
  return {
    getDividendKings: await getDividendKings(),
  };
};
