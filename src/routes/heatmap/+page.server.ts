export const load = async ({ locals }) => {
  const getData = async () => {
    const { apiURL, apiKey } = locals;

    const response = await fetch(apiURL + "/heatmap", {
      method: "GET",
      headers: {
        "Content-Type": "text/html",
        "X-API-KEY": apiKey,
      },
    });

    const output = await response.text();
    return output;
  };

  // Make sure to return a promise
  return {
    getData: await getData(),
  };
};
