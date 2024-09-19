export const load = async ({ locals, params }) => {
  const getOptionsPlotData = async () => {
    const postData = {
      ticker: params.tickerID,
    };

    const response = await fetch(locals?.apiURL + "/options-plot-ticker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": locals?.apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = await response.json();

    return output;
  };

  const getOptionsHistoricalData = async () => {
    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(
      locals?.apiURL + "/options-historical-data-ticker",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": locals?.apiKey,
        },
        body: JSON.stringify(postData),
      }
    );

    const output = await response.json();

    return output;
  };

  const getOptionsChainData = async () => {
    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(
      locals?.apiURL + "/options-chain-data-ticker",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": locals?.apiKey,
        },
        body: JSON.stringify(postData),
      }
    );

    const output = await response.json();

    return output;
  };

  const getOptionsGexData = async () => {
    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(locals?.apiURL + "/options-gex-ticker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": locals?.apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = await response.json();

    return output;
  };

  // Make sure to return a promise
  return {
    getOptionsPlotData: await getOptionsPlotData(),
    getOptionsHistoricalData: await getOptionsHistoricalData(),
    getOptionsChainData: await getOptionsChainData(),
    getOptionsGexData: await getOptionsGexData(),
  };
};
