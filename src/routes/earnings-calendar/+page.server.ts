export const load = async ({ locals, setHeaders }) => {
  const getEarningsCalendar = async () => {
    const { apiKey, apiURL } = locals;
    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/earnings-calendar", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    const output = await response.json();
    setHeaders({ "cache-control": "public, max-age=3000" });

    return output;
  };

  // Make sure to return a promise
  return {
    getEarningsCalendar: await getEarningsCalendar(),
  };
};
