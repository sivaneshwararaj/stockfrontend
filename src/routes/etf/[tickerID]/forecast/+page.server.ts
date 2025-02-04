export const load = async ({ locals, params }) => {
  const { apiURL, apiKey } = locals;
  const postData = {
    ticker: params.tickerID,
  };
  const getAnalystInsight = async () => {
    const response = await fetch(apiURL + "/analyst-insight", {
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

  const getPriceAnalysis = async () => {
    const response = await fetch(apiURL + "/price-analysis", {
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

  const getSentimentAnalysis = async () => {
    const response = await fetch(apiURL + "/sentiment-analysis", {
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
    getAnalystInsight: await getAnalystInsight(),
    getPriceAnalysis: await getPriceAnalysis(),
    getSentimentAnalysis: await getSentimentAnalysis(),
  };
};
