const cleanString = (input) => {
  const substringsToRemove = [
    "Depositary",
    "Inc.",
    "Incorporated",
    "Holdings",
    "Corporations",
    "LLC",
    "Holdings plc American Depositary Shares",
    "Holding Corporation",
    "Oyj",
    "Company",
    "The",
    "plc",
  ];
  const pattern = new RegExp(`\\b(${substringsToRemove.join("|")})\\b|,`, "gi");
  return input?.replace(pattern, "").trim();
};

const fetchData = async (apiURL, apiKey, endpoint, ticker) => {
  const response = await fetch(`${apiURL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({ ticker }),
  });
  return response.json();
};

const fetchWatchlist = async (pb, userId) => {
  let output;
  try {
    output = await pb.collection("watchlist").getFullList({
      filter: `user="${userId}"`,
    });
  } catch (e) {
    //console.log(e)
    output = [];
  }
  return output;
};

export const load = async ({ params, locals }) => {
  const { apiURL, apiKey, pb, user } = locals;
  const { tickerID } = params;

  const endpoints = [
    "/stockdeck",
    "/analyst-summary-rating",
    "/stock-quote",
    "/pre-post-quote",
    "/wiim",
    "/one-day-price",
    "/next-earnings",
    "/earnings-surprise",
    "/stock-news",
  ];

  const promises = [
    ...endpoints.map((endpoint) =>
      fetchData(apiURL, apiKey, endpoint, tickerID),
    ),
    fetchWatchlist(pb, user?.id),
  ];

  const [
    getStockDeck,
    getAnalystRating,
    getStockQuote,
    getPrePostQuote,
    getWhyPriceMoved,
    getOneDayPrice,
    getNextEarnings,
    getEarningsSurprise,
    getNews,
    getUserWatchlist,
  ] = await Promise.all(promises);



  return {
    getStockDeck,
    getAnalystRating,
    getStockQuote,
    getPrePostQuote,
    getWhyPriceMoved,
    getOneDayPrice,
    getNextEarnings,
    getEarningsSurprise,
    getNews,
    getUserWatchlist,
    companyName: cleanString(getStockDeck?.companyName),
    getParams: params.tickerID,
  };
};