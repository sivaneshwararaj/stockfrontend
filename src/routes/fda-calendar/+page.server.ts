import { redirect, error } from "@sveltejs/kit";


export const load = async ({ locals }) => {

  const { pb, user } = locals;


  redirect(303, "/");

  const getFDACalendar = async () => {
    const { apiURL, apiKey, user } = locals;

    const response = await fetch(apiURL + "/fda-calendar", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    let output = await response.json();
    output = user?.tier !== 'Pro' ? output?.slice(0,3) : output;
    return output;
  };

  // Make sure to return a promise
  return {
    getFDACalendar: await getFDACalendar(),
  };
};
