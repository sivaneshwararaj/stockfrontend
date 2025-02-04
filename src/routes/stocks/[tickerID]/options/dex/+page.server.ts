

export const load = async ({ locals, params }) => {
  const { apiKey, apiURL, user } = locals;

  const getData = async () => {
    const postData = {
      params: params.tickerID,
      category: "overview"
    };

    const response = await fetch(apiURL + "/options-gex-dex", {
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


   const getHistoricalPrice = async () => {
     const postData = { ticker: params.tickerID, timePeriod: "one-year" };
  const response = await fetch(apiURL + "/historical-price", {
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
    getHistoricalPrice: await getHistoricalPrice(),
  };
};


