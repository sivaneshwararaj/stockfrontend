const cleanString = (input) => {
  const substringsToRemove = [
    "Depositary",
    "Inc.",
    "Incorporated",
    "Holdings",
    "Corporation",
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
    "/bull-bear-say",
    "/wiim",
    "/one-day-price",
    "/next-earnings",
    "/earnings-surprise",
    "/dividend-announcement",
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
    getBullBearSay,
    getWhyPriceMoved,
    getOneDayPrice,
    getNextEarnings,
    getEarningsSurprise,
    getDividendAnnouncement,
    getNews,
    getUserWatchlist,
  ] = await Promise.all(promises);

  return {
    getStockDeck,
    getAnalystRating,
    getStockQuote,
    getBullBearSay,
    getWhyPriceMoved,
    getOneDayPrice,
    getNextEarnings,
    getEarningsSurprise,
    getDividendAnnouncement,
    getNews,
    getUserWatchlist,
    companyName: cleanString(getStockDeck?.companyName),
  };
};
