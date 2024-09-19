const now = new Date();
const year = now?.getFullYear()?.toString();
const quarter = (Math.floor(now?.getMonth() / 3) + 1)?.toString();

export const load = async ({ locals, params }) => {
  const getTranscripts = async () => {
    let output;

    const { apiKey, apiURL } = locals;

    const postData = {
      ticker: params.tickerID,
      quarter: quarter,
      year: year,
    };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/earnings-call-transcripts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    output = await response.json();

    return output;
  };

  // Make sure to return a promise
  return {
    getTranscripts: await getTranscripts(),
    quarter,
    year,
  };
};
