import type { RequestHandler } from "./$types";
import { serialize } from "object-to-formdata";

export const POST = (async ({ request, locals }) => {
  const { user, pb } = locals;
  const data = await request.json();

  const ticker = data?.ticker;
  const watchListId = data?.watchListId;
  let output;

  try {
    const watchList = await pb.collection("watchlist").getOne(watchListId);

    if (watchList?.ticker?.includes(ticker)) {
      // Remove ticker from the watchlist.
      const newTickerList = watchList?.ticker.filter((item) => item !== ticker);
      output = await pb
        .collection("watchlist")
        .update(watchListId, { ticker: newTickerList });
    } else {
      // Add ticker to the watchlist.
      const newTickerList = [...watchList?.ticker, ticker];
      output = await pb
        .collection("watchlist")
        .update(watchListId, { ticker: newTickerList });
    }
  } catch (e) {
    //console.log(e)
    output = await pb.collection("watchlist").create(
      serialize({
        user: user?.id,
        ticker: JSON.stringify([ticker]),
        ruleOfList: JSON.stringify([]),
        title: "Favorites",
      })
    );
  }

  return new Response(JSON.stringify(output));
}) satisfies RequestHandler;
