export const load = async () => {
  const getFrontendStars = async () => {
    // make the POST request to the endpoint
    const response = await fetch(
      "https://api.github.com/repos/stocknear/frontend",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const output = (await response.json())["stargazers_count"];

    return output;
  };

  const getBackendStars = async () => {
    // make the POST request to the endpoint
    const response = await fetch(
      "https://api.github.com/repos/stocknear/backend",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const output = (await response.json())["stargazers_count"];

    return output;
  };

  // Make sure to return a promise
  return {
    getFrontendStars: await getFrontendStars(),
    getBackendStars: await getBackendStars(),
  };
};
