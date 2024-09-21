export const load = async ({ locals, cookies }) => {
  const { apiURL, apiKey } = locals;

  const getOptionsFlowFeed = async () => {
    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/options-flow-feed", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });
    const output = await response.json();

    return output;
  };

  const getPredefinedCookieRuleOfList = async () => {
    // make the POST request to the endpoint
    const ruleOfList = cookies.get("options-flow-filter-cookie") ?? [];
    const output =
      ruleOfList?.length !== 0
        ? JSON.parse(ruleOfList)
        : [
            { name: "cost_basis", value: "any" },
            { name: "date_expiration", value: "any" },
          ];

    return output;
  };

  // Make sure to return a promise
  return {
    getOptionsFlowFeed: await getOptionsFlowFeed(),
    getPredefinedCookieRuleOfList: await getPredefinedCookieRuleOfList(),
  };
};
