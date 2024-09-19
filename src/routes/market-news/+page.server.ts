export const load = async ({ locals }) => {
  const getMarketNews = async () => {
    const { apiURL, apiKey } = locals;
    const postData = { newsType: "stock-news" };
    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/market-news", {
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
    getMarketNews: await getMarketNews(),
  };
};
