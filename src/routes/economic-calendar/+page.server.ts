export const load = async ({ locals, setHeaders }) => {
  const getEconomicCalendar = async () => {
    const { apiURL, apiKey } = locals;
    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/economic-calendar", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    const output = await response.json();
    setHeaders({ "cache-control": "public, max-age=60*15" });

    return output;
  };

  // Make sure to return a promise
  return {
    getEconomicCalendar: await getEconomicCalendar(),
  };
};
