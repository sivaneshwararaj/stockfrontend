import { getCache, setCache } from "$lib/store";

// Define the EMA parameters to check
const emaParameters = ["ema20", "ema50", "ema100", "ema200"];
// Function to check and add missing EMA parameters
const ensureAllEmaParameters = (params) => {
  const includedEmaParameters = params.filter((param) =>
    emaParameters.includes(param)
  );
  if (includedEmaParameters.length > 0) {
    emaParameters.forEach((param) => {
      if (!params.includes(param)) {
        params.push(param);
      }
    });
  }
};

export const load = async ({ parent, params }) => {
  const { apiURL, apiKey, fastifyURL, user } = await parent();

  const getStrategyId = async () => {
    return params.strategyId;
  };

  const getAllStrategies = async () => {
    const postData = { userId: user?.id };
    const response = await fetch(fastifyURL + "/all-strategies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    const output = (await response.json())?.items;

    output?.sort((a, b) => new Date(b?.updated) - new Date(a?.updated));

    //console.log(output);

    return output;
  };

  const getStrategy = async (strategyId) => {
    let output;

    // make the POST request to the endpoint
    const postData = { strategyId: strategyId };
    const response = await fetch(fastifyURL + "/get-strategy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    output = (await response.json())?.items;

    return output;
  };

  const getStockScreenerData = async () => {
    let output;
    const strategyList = await getAllStrategies();

    const strategy = await getStrategy(strategyList?.at(0)?.id);
    let getRuleOfList = strategy?.rules?.map((item) => item?.name) || [];

    // Ensure all required EMA parameters are included
    ensureAllEmaParameters(getRuleOfList);

    const ruleNames = getRuleOfList.sort().join(",");

    // Get cached data for the specific tickerID
    const cachedData = getCache(ruleNames, "getStockScreenerData");
    if (cachedData) {
      output = cachedData;
    } else {
      const postData = { ruleOfList: getRuleOfList };
      // make the POST request to the endpoint
      const response = await fetch(apiURL + "/stock-screener-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(postData),
      });

      output = await response.json();

      // Cache the data for this specific tickerID with a specific name 'getStockScreenerData'
      setCache(ruleNames, output, "getStockScreenerData");
    }

    return output;
  };

  // Make sure to return a promise
  return {
    getStockScreenerData: await getStockScreenerData(),
    getStrategy: await getStrategy(),
    getStrategyId: await getStrategyId(),
    getAllStrategies: await getAllStrategies(),
  };
};
