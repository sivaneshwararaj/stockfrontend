export const load = async ({ params, locals }) => {
  const getProviderName = async () => {
    return params.slug;
  };

  const getETFProviderData = async () => {
    const { apiKey, apiURL } = locals;
    const postData = { etfProvider: params.slug };

    const response = await fetch(apiURL + "/etf-provider", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = await response.json();

    return output;
  };

  // Make sure to return a promise
  return {
    getETFProviderData: await getETFProviderData(),
    getProviderName: await getProviderName(),
  };
};
