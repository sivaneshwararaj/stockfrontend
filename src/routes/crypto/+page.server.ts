export const load = async ({ locals }) => {
  const getCryptoList = async () => {
    const { apiKey, apiURL } = locals;
    const response = await fetch(apiURL + "/all-crypto-tickers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    const output = (await response.json())?.sort(
      (a, b) => b?.marketCap - a?.marketCap
    );

    return output;
  };

  // Make sure to return a promise
  return {
    getCryptoList: await getCryptoList(),
  };
};
