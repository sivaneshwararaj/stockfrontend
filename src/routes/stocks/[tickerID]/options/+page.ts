import { getCache, setCache } from "$lib/store";

export const load = async ({ parent, params }) => {
  const { apiKey, apiURL } = await parent();

  const getOptionsPlotData = async () => {
    const cachedData = getCache(params.tickerID, "getOptionsPlotData");
    if (cachedData) {
      return cachedData;
    } else {
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

      setCache(params.tickerID, output, "getOptionsPlotData");
      return output;
    }
  };

  const getOptionsHistoricalData = async () => {
    let output;
    const cachedData = getCache(params.tickerID, "getOptionsHistoricalData");
    if (cachedData) {
      output = cachedData;
    } else {
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

      output = await response.json();

      console.log(output);

      setCache(params.tickerID, output, "getOptionsHistoricalData");
    }

    return output;
  };

  const getOptionsChainData = async () => {
    let output;
    const cachedData = getCache(params.tickerID, "getOptionsChainData");
    if (cachedData) {
      output = cachedData;
    } else {
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

      output = await response.json();

      setCache(params.tickerID, output, "getOptionsChainData");
    }

    return output;
  };

  const getOptionsGexData = async () => {
    let output;
    const cachedData = getCache(params.tickerID, "getOptionsGexData");
    if (cachedData) {
      output = cachedData;
    } else {
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

      output = await response.json();

      setCache(params.tickerID, output, "getOptionsGexData");
    }

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
