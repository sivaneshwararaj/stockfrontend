export const load = async ({ locals }) => {
  const getIPOCalendar = async () => {
    const { apiURL, apiKey } = locals;

    // make the POST request to the endpoint
    const postData = { year: "all" };

    const response = await fetch(apiURL + "/ipo-calendar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = await response.json();

    return output;
  };

  // Make sure to return a promise
  return {
    getIPOCalendar: await getIPOCalendar(),
  };
};
