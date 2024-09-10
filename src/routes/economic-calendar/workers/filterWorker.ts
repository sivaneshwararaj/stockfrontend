export const listOfRelevantCountries = [
  { USA: "United States" },
  { CHN: "China" },
  { CAN: "Canada" },
  { GBR: "United Kingdom" },
  { JPN: "Japan" },
  { ISR: "Israel" },
  { BRA: "Brazil" },
  { FRA: "France" },
  { IRL: "Ireland" },
  { DEU: "Germany" },
  { MEX: "Mexico" },
  { IND: "India" },
  { AUS: "Australia" },
  { KOR: "South Korea" },
  { SWE: "Sweden" },
  { NLD: "Netherlands" },
  { CHE: "Switzerland" },
  { TWN: "Taiwan" },
  { ZAF: "South Africa" },
  { HKG: "Hong Kong" },
  { SGP: "Singapore" },
  { ARG: "Argentina" },
  { CHL: "Chile" },
  { PHL: "Philippines" },
  { TUR: "Turkey" },
  { ITA: "Italy" },
  { IDN: "Indonesia" },
  { MYS: "Malaysia" },
  { LUX: "Luxembourg" },
  { VNM: "Vietnam" },
  { NZL: "New Zealand" },
  { DNK: "Denmark" },
  { NOR: "Norway" },
  { FIN: "Finland" },
  { RUS: "Russia" },
  { ARE: "United Arab Emirates" },
];

const countryMap = Object.fromEntries(
  listOfRelevantCountries.map((entry) => {
    const [code, name] = Object.entries(entry)[0];
    return [name, code];
  })
);

onmessage = async (event: MessageEvent) => {
  const rawData = event.data?.rawData;
  const filterList = event.data?.filterList;

  // Map filterList country names to abbreviations
  const filterCodes = filterList?.map((name) => countryMap[name]) || [];

  // Filter rawData based on the mapped country codes
  const output = rawData?.map((subArray) =>
    subArray?.filter((item) => filterCodes.includes(item?.country))
  );

  let finalData = { output };
  postMessage({ message: "success", finalData });

  // Sending data back to the main thread
  //postMessage({ message: 'Data received in the worker', ticker, apiURL });
};

export {};
