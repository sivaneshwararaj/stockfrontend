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

    output = output?.reduce((acc, item) => {
      const newTransactionType =
        typeof transactionTypeMap[item?.transactionType] === "function"
          ? transactionTypeMap[item?.transactionType](item)
          : transactionTypeMap[item?.transactionType];

      // Only include items with 'Bought' or 'Sold'
      if (newTransactionType === "Bought" || newTransactionType === "Sold") {
        acc.push({ ...item, transactionType: newTransactionType });
      }

      return acc;
    }, []);

    return output;
  };

  /*
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
  */

  // Make sure to return a promise
  return {
    getInsiderTrading: await getInsiderTrading(),
    //getInsiderTradingStatistics: await getInsiderTradingStatistics(),
  };
};
