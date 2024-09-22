export const load = async ({ locals }) => {
  const getFDACalendar = async () => {
    const { apiURL, apiKey } = locals;

    const response = await fetch(apiURL + "/fda-calendar", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    const output = await response.json();

    return output;
  };

  // Make sure to return a promise
  return {
    getFDACalendar: await getFDACalendar(),
  };
};
