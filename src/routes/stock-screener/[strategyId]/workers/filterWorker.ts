import { sectorList, listOfRelevantCountries } from "$lib/utils";

// Convert the input to a value or return it as-is if it's already an array
function convertUnitToValue(
  input: string | number | string[]
): number | string[] | string {
  if (Array.isArray(input)) return input;
  if (typeof input === "number") return input;
  if (typeof input !== "string") {
    throw new TypeError(
      `Expected a string or number, but received ${typeof input}`
    );
  }
  const lowerInput = input.toLowerCase();
  // Pre-compute the set for quick lookups
  const nonNumericValues = new Set([
    "any",
    ...sectorList,
    ...listOfRelevantCountries,
    "hold",
    "sell",
    "buy",
    "stock price", // Add "stock price" to non-numeric values
  ]);
  if (nonNumericValues.has(lowerInput)) return input;

  if (input.endsWith("%")) {
    const numericValue = parseFloat(input.slice(0, -1));
    if (isNaN(numericValue)) {
      throw new Error(`Unable to convert ${input} to a number`);
    }
    return numericValue;
  }

  const units = { B: 1_000_000_000, M: 1_000_000, K: 1_000 };
  const match = input.match(/^(\d+(\.\d+)?)([BMK])?$/);

  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[3] as keyof typeof units;
    return unit ? value * units[unit] : value;
  }

  const numericValue = parseFloat(input);
  if (isNaN(numericValue)) {
    throw new Error(`Unable to convert ${input} to a number`);
  }

  return numericValue;
}

// Filter the stock screener data based on the provided rules
async function filterStockScreenerData(stockScreenerData, ruleOfList) {
  return stockScreenerData?.filter((item) => {
    return ruleOfList.every((rule) => {
      const itemValue = item[rule.name];
      const ruleValue = convertUnitToValue(rule.value);
      const ruleName = rule.name.toLowerCase();

      // Handle trend and fundamental analysis
      if (["trendanalysis", "fundamentalanalysis"].includes(ruleName)) {
        const accuracy = item[ruleName]?.accuracy;
        if (rule.condition === "over" && accuracy <= ruleValue) return false;
        if (rule.condition === "under" && accuracy > ruleValue) return false;
        return true;
      }

      // Handle categorical data like analyst ratings, sector, country
      if (["analystrating", "sector", "country"].includes(ruleName)) {
        if (ruleValue === "any") return true;
        return Array.isArray(ruleValue)
          ? ruleValue.includes(itemValue)
          : itemValue === ruleValue;
      }

      // Handle moving averages
      if (
        [
          "ema20",
          "ema50",
          "ema100",
          "ema200",
          "sma20",
          "sma50",
          "sma100",
          "sma200",
        ].includes(ruleName)
      ) {
        if (ruleValue === "any") return true;

        for (const condition of ruleValue) {
          if (condition === "Stock Price > EMA20") {
            const stockPrice = item["price"];
            const maValue = item["ema20"];
            if (!stockPrice || !maValue) return false;
            if (!(stockPrice > maValue)) return false;
          }
          if (condition === "EMA20 > EMA50") {
            const ema20 = item["ema20"];
            const ema50 = item["ema50"];
            if (!ema20 || !ema50) return false;
            if (ema20 < ema50) return false;
          }
          // Add additional conditions here
        }

        return true; // If all conditions are met
      }

      // Default numeric or string comparison
      if (typeof ruleValue === "string") return true; // Skip non-numeric comparisons
      if (itemValue === null) return false; // Null values do not meet any condition
      if (rule.condition === "over" && itemValue <= ruleValue) return false;
      if (rule.condition === "under" && itemValue > ruleValue) return false;

      return true;
    });
  });
}
onmessage = async (event: MessageEvent) => {
  const { stockScreenerData, ruleOfList } = event.data || {};

  const filteredData = await filterStockScreenerData(
    stockScreenerData,
    ruleOfList
  );

  postMessage({ message: "success", filteredData });
};

export {};
