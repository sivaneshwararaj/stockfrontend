export const load = async ({ locals }) => {
  const { apiKey, apiURL, fastifyURL, user } = locals;

  const getPriceAlert = async () => {
    const postData = { userId: user?.id };
    const response = await fetch(fastifyURL + "/get-price-alert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    let output = (await response.json())?.items;
    output = output?.sort((a, b) => a?.symbol?.localeCompare(b?.symbol));

    return output;
  };

  const getMiniPlotsIndex = async () => {
    // make the POST request to the endpoint
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

  // Make sure to return a promise
  return {
    getMiniPlotsIndex: await getMiniPlotsIndex(),
    getPriceAlert: await getPriceAlert(),
  };
};
