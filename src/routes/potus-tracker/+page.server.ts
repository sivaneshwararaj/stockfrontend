export const load = async ({ locals }) => {
    const { apiKey, apiURL, user } = locals;

  const getData = async () => {

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/potus-tracker", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    const output = await response.json();

    return output;
  };

    const getEggPrice = async () => {

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/egg-price", {
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
    getData: await getData(),
    getEggPrice: await getEggPrice(),
  };
};
