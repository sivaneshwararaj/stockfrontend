export const load = async ({ locals }) => {
  const getOptionsWatchlist = async () => {
    const { apiKey, apiURL, pb, user } = locals;

    try {
      // Fetch the watchlist for the user from the database
      const watchList = (
        await pb.collection("optionsWatchlist").getFullList({
          filter: `user="${user?.id}"`,
        })
      )?.at(0);

      if (watchList !== undefined && watchList?.optionsId?.length !== 0) {
        const postData = { optionsIdList: watchList?.optionsId };
        const response = await fetch(apiURL + "/get-options-watchlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": apiKey,
          },
          body: JSON.stringify(postData),
        });
        const output = await response.json();
        return output;
      } else {
        return [];
      }
    } catch (e) {
      console.error("Error fetching options watchlist or Benzinga data:", e);
      return [];
    }
  };

  return {
    getOptionsWatchlist: await getOptionsWatchlist(),
  };
};
