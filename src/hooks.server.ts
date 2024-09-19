import { sequence } from "@sveltejs/kit/hooks";
import PocketBase from "pocketbase";
import { serializeNonPOJOs } from "$lib/utils";
//import geoip from "geoip-lite";

export const handle = sequence(async ({ event, resolve }) => {
  /*
  const ip =
    event.request.headers.get("x-forwarded-for")?.split(",")[0] ||
    event.getClientAddress();

  let isUS = false;
  if (ip) {
    const geoData = geoip?.lookup(ip);
    if (geoData && geoData.country === "US") {
      isUS = true;
    }
  }
  */

  // Use a ternary operator instead of the logical OR for better compatibility
  const pbURL = import.meta.env.VITE_USEAST_POCKETBASE_URL; //isUS ? import.meta.env.VITE_USEAST_POCKETBASE_URL : import.meta.env.VITE_EU_POCKETBASE_URL;
  const apiURL = import.meta.env.VITE_USEAST_API_URL; //isUS ? import.meta.env.VITE_USEAST_API_URL : import.meta.env.VITE_EU_API_URL;
  const fastifyURL = import.meta.env.VITE_USEAST_FASTIFY_URL; //isUS ? import.meta.env.VITE_USEAST_FASTIFY_URL : import.meta.env.VITE_EU_FASTIFY_URL;
  const wsURL = import.meta.env.VITE_USEAST_WS_URL; //isUS ? import.meta.env.VITE_USEAST_WS_URL : import.meta.env.VITE_EU_WS_URL;

  event.locals = {
    pb: new PocketBase(pbURL),
    apiURL,
    fastifyURL,
    wsURL,
    apiKey: import.meta.env.VITE_STOCKNEAR_API_KEY,
  };

  const authCookie = event?.request?.headers?.get("cookie") || "";
  event.locals.pb.authStore.loadFromCookie(authCookie);

  if (event?.locals?.pb?.authStore?.isValid) {
    try {
      await event.locals.pb.collection("users").authRefresh();
      event.locals.user = serializeNonPOJOs(event.locals.pb.authStore.model);
    } catch (_) {
      event.locals.pb.authStore.clear();
      event.locals.user = undefined;
    }
  }

  const response = await resolve(event);

  // Use a more compatible way to set the cookie
  const cookieString = event.locals.pb.authStore.exportToCookie({
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 365,
  });

  response.headers.append("set-cookie", cookieString);

  return response;
});
