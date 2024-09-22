export const load = async ({ locals }) => {
  const getDividendAristocrats = async () => {
    const { apiKey, apiURL } = locals;

    const response = await fetch(apiURL + "/dividend-aristocrats", {
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
    getDividendAristocrats: await getDividendAristocrats(),
  };
};
