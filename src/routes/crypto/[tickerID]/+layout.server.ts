export const config = {
  runtime: "nodejs20.x",
};

let companyName;

const fetchData = async (apiURL, apiKey, endpoint, ticker) => {
  const postData = {
    ticker: ticker,
  };

  const response = await fetch(apiURL + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify(postData),
  });

  const output = await response.json();

  if (endpoint === "/crypto-profile") {
    companyName = output?.name;
  }

  return output;
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

/*
async function fetchPortfolio(fastifyURL, userId)
{
  const postData = {'userId': userId};

    const response = await fetch(fastifyURL+'/get-portfolio-data', {
      method: 'POST',
      headers: {
      "Content-Type": "application/json"
      },
      body: JSON.stringify(postData)
    });

    const output = (await response.json())?.items;
    
    return output
}
*/

export const load = async ({ params, locals, setHeaders }) => {
  const { apiURL, apiKey, pb, user } = locals;

  const promises = [
    fetchData(apiURL, apiKey, "/crypto-profile", params.tickerID),
    fetchData(apiURL, apiKey, "/stock-quote", params.tickerID),
    fetchData(apiURL, apiKey, "/one-day-price", params.tickerID),
    fetchWatchlist(pb, user?.id),
    //fetchPortfolio(fastifyURL, locals?.user?.id)
  ];

  const [getCryptoProfile, getStockQuote, getOneDayPrice, getUserWatchlist] =
    await Promise.all(promises);

  setHeaders({
    "cache-control": "public, max-age=300",
  });

  return {
    getCryptoProfile,
    getStockQuote,
    getOneDayPrice,
    getUserWatchlist,
    companyName,
    getParams: params.tickerID,
  };
};
