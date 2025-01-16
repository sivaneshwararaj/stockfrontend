
export const load = async ({ locals, params }) => {
    const { pb } = locals;
  const getArticle = async () => {

   
      const output = await pb
        ?.collection("articles")
        ?.getOne(params?.slug, { expand: "user" });


    return output;
  };



  // Make sure to return a promise
  return {
    getArticle: await getArticle(),
  };
};