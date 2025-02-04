export const load = async ({ params }) => {
  const getParams = async () => {
    return params.slug
  }
  // Make sure to return a promise
  return {
    getParams: await getParams(),
  }
}
