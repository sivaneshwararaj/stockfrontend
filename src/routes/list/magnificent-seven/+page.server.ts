export const load = async ({ locals }) => {
  
  const getMagnificentSeven = async () => {
    const { apiURL, apiKey } = locals;

    const response = await fetch(apiURL + "/magnificent-seven", {
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
    getMagnificentSeven: await getMagnificentSeven(),
  };
};
