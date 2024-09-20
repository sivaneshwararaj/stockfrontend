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
  const filterList: (string | number)[] = event.data?.filterList;
  console.log(filterList);

  // Separate importance filters and country filters
  const importanceFilters = filterList.filter(
    (item) => typeof item === "number" && [1, 2, 3].includes(item as number)
  ) as number[];
  const countryFilters = filterList.filter(
    (item) => typeof item === "string"
  ) as string[];

  // Map filterList country names to abbreviations
  const filterCodes = countryFilters.map((name) => countryMap[name]) || [];

  // Filter rawData based on the mapped country codes and importance
  const output = rawData?.map((subArray) =>
    subArray?.filter((item) => {
      const countryMatch =
        filterCodes.length === 0 || filterCodes.includes(item?.country);
      const importanceMatch =
        importanceFilters.length === 0 ||
        importanceFilters.includes(item?.importance);
      return countryMatch && importanceMatch;
    })
  );

  let finalData = { output };
  postMessage({ message: "success", finalData });
};

export {};
