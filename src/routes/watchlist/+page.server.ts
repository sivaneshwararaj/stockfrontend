export const load = async ({ locals }) => {
  /*
  const getMiniPlotsIndex = async () => {
    let output;

    // Get cached data for the specific tickerID
    const cachedData = getCache('', 'getMiniPlotsIndex');
    if (cachedData) {
      output = cachedData;
    } else {
      const {apiKey, apiURL} = await parent();

      // make the POST request to the endpoint
      const response = await fetch(apiURL + '/mini-plots-index', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json", "X-API-KEY": apiKey
        },
      });

      output = await response.json();

      setCache('', output, 'getMiniPlotsIndex');
    }

    return output;
  };
  */

  const getAllWatchlist = async () => {
    const { pb, user } = locals;

    try {
      const output = await pb.collection("watchlist").getFullList({
        filter: `user="${user?.id}"`,
      });

      return output;
    } catch (e) {
      return [];
    }
  };

  // Make sure to return a promise
  return {
    //getMiniPlotsIndex: await getMiniPlotsIndex(),
    getAllWatchlist: await getAllWatchlist(),
  };
};
