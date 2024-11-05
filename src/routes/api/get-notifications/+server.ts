import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  const { pb, user } = locals;

  let output;

  try {
    output = await pb.collection("notifications")?.getFullList({
      filter: `opUser="${user?.id}" `,
      expand: "user,post,comment",
      sort: "-created",
    });
  } catch (e) {
    console.log(e);
    output = [];
  }

  return new Response(JSON.stringify(output));
};
