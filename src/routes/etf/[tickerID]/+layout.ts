import {
  etfTicker,
  displayCompanyName,
  assetType,
} from "$lib/store";


export const load = async ({ data }) => {
  etfTicker.set(data?.getParams?.toUpperCase());
  assetType.set("etf");
  displayCompanyName.set(data?.companyName);
};
