export const load = async ({ locals, setHeaders }) => {
  const getSentimentTracker = async () => {
    const { apiKey, apiURL, user } = locals;

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/sentiment-tracker", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    let output = await response.json();

    output.twitter =
      user?.tier !== "Pro" ? output?.twitter?.slice(0, 6) : output?.twitter;
    output.stocktwits =
      user?.tier !== "Pro"
        ? output?.stocktwits?.slice(0, 6)
        : output?.stocktwits;

    setHeaders({ "cache-control": "public, max-age=3000" });

    return output;
  };

  // Make sure to return a promise
  return {
    getSentimentTracker: await getSentimentTracker(),
  };
};
