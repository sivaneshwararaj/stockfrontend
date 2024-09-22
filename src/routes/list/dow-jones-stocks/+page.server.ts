export const load = async ({ locals }) => {
  const getDowJonesConstituentStocks = async () => {
    const { apiKey, apiURL } = locals;

    const postData = { filterList: "dowjonesConstituent" };

    const response = await fetch(apiURL + "/exchange-constituents", {
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
    getDowJonesConstituentStocks: await getDowJonesConstituentStocks(),
  };
};
