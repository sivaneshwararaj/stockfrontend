export const load = async ({ locals, setHeaders }) => {
  const getMostRetailVolume = async () => {
    const { apiKey, apiURL, user } = locals;

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/most-retail-volume", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    let output = await response.json();

    output = user?.tier !== "Pro" ? output?.slice(0, 6) : output;
    setHeaders({ "cache-control": "public, max-age=3000" });

    return output;
  };

  // Make sure to return a promise
  return {
    getMostRetailVolume: await getMostRetailVolume(),
  };
};
