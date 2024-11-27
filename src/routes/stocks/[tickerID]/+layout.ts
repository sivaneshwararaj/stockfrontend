import {
  stockTicker,
  displayCompanyName,
  assetType,
} from "$lib/store";



export const load = async ({  data }) => {
  stockTicker.set(data?.getParams?.toUpperCase());
  assetType.set("stock");
  displayCompanyName.set(data?.companyName);
};