export const load = async ({ locals, params }) => {
    const { apiKey, apiURL } = locals;

  const getData = async () => {
    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/price-action-earnings", {
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
    getData: await getData(),
  };
};
