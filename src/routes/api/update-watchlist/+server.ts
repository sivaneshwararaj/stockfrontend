import type { RequestHandler } from "./$types";
import { serialize } from "object-to-formdata";

export const POST = (async ({ request, locals }) => {
  const { user, pb } = locals;
  const data = await request.json();

  const ticker = data?.ticker; // This can be a string (single ticker) or an array (list of tickers)
  const watchListId = data?.watchListId;
  let output;

  try {
    const watchList = await pb.collection("watchlist").getOne(watchListId);

    if (Array.isArray(ticker)) {
      // If `ticker` is a list, update the watchlist directly with the new list of tickers.
      output = await pb.collection("watchlist").update(watchListId, {
        ticker: ticker,
      });
    } else if (watchList?.ticker?.includes(ticker)) {
      // Remove single ticker from the watchlist if it's already present.
      const newTickerList = watchList?.ticker.filter((item) => item !== ticker);
      output = await pb
        .collection("watchlist")
        .update(watchListId, { ticker: newTickerList });
    } else {
      // Add single ticker to the watchlist if it's not present.
      const newTickerList = [...watchList?.ticker, ticker];
      output = await pb
        .collection("watchlist")
        .update(watchListId, { ticker: newTickerList });
    }
  } catch (e) {
    // If the watchlist doesn't exist, create a new one with either the single ticker or list.
    output = await pb.collection("watchlist").create(
      serialize({
        user: user?.id,
        ticker: Array.isArray(ticker)
          ? JSON.stringify(ticker)
          : JSON.stringify([ticker]),
        title: "Favorites",
      })
    );
  }

  return new Response(JSON.stringify(output));
}) satisfies RequestHandler;
