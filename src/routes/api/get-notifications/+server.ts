import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }) => {
  const { pb, user } = locals;
 const data = await request.json();
  let output;

  try {

    if (data?.readed === false) {
        output = await pb?.collection("notifications")?.getFullList({
      filter: `opUser="${user?.id}" && readed=False`,
      expand: "user",
      sort: "-created",
    });
    } else {
        output = await pb?.collection("notifications")?.getFullList({
      filter: `opUser="${user?.id}"`,
      expand: "user",
      sort: "-created",
    });
    }
  
  } catch (e) {
    console.log(e);
    output = [];
  }

  return new Response(JSON?.stringify(output));
};
