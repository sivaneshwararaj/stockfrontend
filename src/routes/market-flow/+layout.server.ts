export const load = async ({ locals }) => {
  const getData = async () => {
    const { apiKey, apiURL, user } = locals;

    const response = await fetch(apiURL + "/market-flow", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

  let output = await response?.json();
    output.sectorData = user?.tier !== "Pro" ? output?.sectorData?.slice(0, 3) : output?.sectorData;
    return output;
  };

  // Make sure to return a promise
  return {
    getData: await getData(),
  };
};
