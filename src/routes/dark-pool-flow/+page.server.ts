export const load = async ({ locals }) => {
  const { apiURL, apiKey } = locals;

  const getFlowData = async () => {
    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/dark-pool-flow-feed", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });
    const output = await response.json();

    return output;
  };


  return {
    getFlowData: await getFlowData(),
  };
};
