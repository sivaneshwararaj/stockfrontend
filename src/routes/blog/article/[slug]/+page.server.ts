function convertToSlug(title) {
  // Remove punctuation and special characters
  const cleanedTitle = title
    .replace(/[.,?!:"]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim(); // Remove leading and trailing spaces

  // Convert to lowercase, split by spaces, and join with hyphens
  const words = cleanedTitle.toLowerCase().split(" ");
  const slug = words.join("-");
  return slug;
}

export const load = async ({ locals, params }) => {
  const { pb } = locals;

  const getArticle = async () => {
    // Make the POST request to the endpoint
    const output = await pb.collection("articles").getFullList({
      sort: "-created",
    });


    // Find the matching article based on params.slug
    const matchingArticle = output?.find(
      (article) => convertToSlug(article?.title) === params?.slug
    );

    return matchingArticle;
  };

  // Make sure to return a promise
  return {
    getArticle: await getArticle(),
  };
};
