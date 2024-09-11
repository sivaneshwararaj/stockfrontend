import { getCache, setCache } from "$lib/store";

export const load = async ({ parent }) => {
  const getCramerTracker = async () => {
    let output;
    const { apiKey, apiURL, user } = await parent();

    const cachedData = getCache("", "getCramerTracker");
    if (cachedData) {
      output = cachedData;
    } else {
      const response = await fetch(apiURL + "/cramer-tracker", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
      });

      output = await response.json();

      setCache("", output, "getCramerTracker");
    }

    output = user?.tier !== "Pro" ? output?.slice(0, 5) : output;

    //output = data?.user?.tier !== 'Pro' ? output?.slice(0,6) : output;

    return output;
  };

  // Make sure to return a promise
  return {
    getCramerTracker: await getCramerTracker(),
  };
};
