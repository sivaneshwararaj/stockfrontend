import type { RequestHandler } from "./$types";
import { serialize } from "object-to-formdata";

export const POST: RequestHandler = async ({ request, locals }) => {
  const data = await request.json();
  const { pb } = locals;

  let output;
  try {
    const watchList = await pb.collection("optionsWatchlist").getOne(data?.id);

    if (watchList?.optionsId?.includes(data?.itemId)) {
      // Remove ticker from the watchlist.
      const newTickerList = watchList?.optionsId.filter(
        (item) => item !== data?.itemId
      );
      output = await pb
        .collection("optionsWatchlist")
        .update(data?.id, { optionsId: newTickerList });
    } else {
      // Add ticker to the watchlist.
      const newTickerList = [...watchList?.optionsId, data?.itemId];
      output = await pb
        .collection("optionsWatchlist")
        .update(data?.id, { optionsId: newTickerList });
    }
  } catch (e) {
    output = await pb.collection("optionsWatchlist").create(
      serialize({
        user: locals?.user?.id,
        optionsId: JSON.stringify([data?.itemId]),
      })
    );
  }

  return new Response(JSON.stringify(output?.id));
};
