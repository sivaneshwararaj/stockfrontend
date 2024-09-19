const transactionTypeMap = {
  "P-Purchase": "Bought",
  "A-Award": "Grant",
  "D-Return": "Grant",
  "G-Gift": "Grant",
  "S-Sale": "Sold",
  "M-Exempt": "Exercise",
  "X-InTheMoney": "Exercise",
  "C-Conversion": "Exercise",
  "F-InKind": "Sold",
  "J-Other": (item) => {
    if (item.acquistionOrDisposition === "D") {
      return "Sold";
    } else if (item.acquistionOrDisposition === "A") {
      return "Bought";
    } else {
      return "Other";
    }
  },
  "": "n/a",
};

export const load = async ({ locals, params }) => {
  const { apiURL, apiKey } = locals;

  const getInsiderTrading = async () => {
    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/insider-trading", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    let output = await response.json();

    output = output?.map((item) => ({
      ...item,
      transactionType:
        typeof transactionTypeMap[item?.transactionType] === "function"
          ? transactionTypeMap[item?.transactionType](item)
          : transactionTypeMap[item?.transactionType] || "n/a",
    }));

    return output;
  };

  const getInsiderTradingStatistics = async () => {
    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/insider-trading-statistics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = await response?.json();

    return output;
  };

  async function historicalPrice() {
    const postData = {
      ticker: params.tickerID,
      timePeriod: "max",
    };

    const response = await fetch(apiURL + "/historical-price", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = (await response?.json()) ?? [];

    //Adding this would create a bug hence I cant use the historicalPrice endpoint such as in +page.svelte but rather need to call
    // it again without modification.
    /*
        output= (data) => map(({ time, open, high, low, close }) => ({ 
            time: Date.parse(time), 
            open, 
            high, 
            low, 
            close 
        }));
        */

    return output;
  }

  // Make sure to return a promise
  return {
    getInsiderTrading: await getInsiderTrading(),
    getInsiderTradingStatistics: await getInsiderTradingStatistics(),
    getHistoricalPrice: await historicalPrice(),
  };
};
