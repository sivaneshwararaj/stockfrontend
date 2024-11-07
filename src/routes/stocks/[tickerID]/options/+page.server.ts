export const load = async ({ locals, params }) => {
  const { apiKey, apiURL } = locals;

  const getOptionsNetFlow = async () => {
    const postData = {
      ticker: params.tickerID,
    };

    const response = await fetch(apiURL + "/options-net-flow-ticker", {
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

  const getOptionsPlotData = async () => {
    const postData = {
      ticker: params.tickerID,
    };

    const response = await fetch(apiURL + "/options-plot-ticker", {
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

  const getOptionsHistoricalData = async () => {
    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/options-historical-data-ticker", {
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

  const getOptionsChainData = async () => {
    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/options-chain-data-ticker", {
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

  const getOptionsGexData = async () => {
    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/options-gex-ticker", {
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
    getOptionsNetFlow: await getOptionsNetFlow(),
    getOptionsPlotData: await getOptionsPlotData(),
    getOptionsHistoricalData: await getOptionsHistoricalData(),
    getOptionsChainData: await getOptionsChainData(),
    getOptionsGexData: await getOptionsGexData(),
  };
};
