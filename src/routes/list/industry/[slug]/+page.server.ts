export const load = async ({ params, locals, setHeaders }) => {
  const getIndustryStocks = async () => {
    const { apiKey, apiURL } = locals;

    const postData = { ticker: params.slug };
    const response = await fetch(apiURL + "/industry-stocks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = await response.json();
    setHeaders({ "cache-control": "public, max-age=3000" });

    //output = user?.tier !== "Pro" ? output?.slice(0, 5) : output;

    //output = data?.user?.tier !== 'Pro' ? output?.slice(0,6) : output;

    return output;
  };

  // Make sure to return a promise
  return {
    getIndustryStocks: await getIndustryStocks(),
  };
};
