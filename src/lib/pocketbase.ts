import PocketBase from "pocketbase";
import { userRegion } from "$lib/store";

let pbUrl;

userRegion.subscribe((value) => {
  if (value) {
    pbUrl = import.meta.env.VITE_USEAST_POCKETBASE_URL;
    console.log("US region for pocketbase");
  } else {
    pbUrl = import.meta.env.VITE_EU_POCKETBASE_URL;
    console.log("EU region for pocketbase");
  }
});

export const pb = new PocketBase(pbUrl);
