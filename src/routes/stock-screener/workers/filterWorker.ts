import { sectorList, industryList, listOfRelevantCountries } from "$lib/utils";

const movingAverageConditions = {
  // EMA conditions
  "Stock Price > EMA20": (item) => item.price > item.ema20,
  "Stock Price > EMA50": (item) => item.price > item.ema50,
  "Stock Price > EMA100": (item) => item.price > item.ema100,
  "Stock Price > EMA200": (item) => item.price > item.ema200,
  "EMA20 > EMA50": (item) => item.ema20 > item.ema50,
  "EMA20 > EMA100": (item) => item.ema20 > item.ema100,
  "EMA20 > EMA200": (item) => item.ema20 > item.ema200,
  "EMA50 > EMA20": (item) => item.ema50 > item.ema20,
  "EMA50 > EMA100": (item) => item.ema50 > item.ema100,
  "EMA50 > EMA200": (item) => item.ema50 > item.ema200,
  "EMA100 > EMA20": (item) => item.ema100 > item.ema20,
  "EMA100 > EMA50": (item) => item.ema100 > item.ema50,
  "EMA100 > EMA200": (item) => item.ema100 > item.ema200,
  "EMA200 > EMA20": (item) => item.ema200 > item.ema20,
  "EMA200 > EMA50": (item) => item.ema200 > item.ema50,
  "EMA200 > EMA100": (item) => item.ema200 > item.ema100,

  // SMA conditions
  "Stock Price > SMA20": (item) => item.price > item.sma20,
  "Stock Price > SMA50": (item) => item.price > item.sma50,
  "Stock Price > SMA100": (item) => item.price > item.sma100,
  "Stock Price > SMA200": (item) => item.price > item.sma200,
  "SMA20 > SMA50": (item) => item.sma20 > item.sma50,
  "SMA20 > SMA100": (item) => item.sma20 > item.sma100,
  "SMA20 > SMA200": (item) => item.sma20 > item.sma200,
  "SMA50 > SMA20": (item) => item.sma50 > item.sma20,
  "SMA50 > SMA100": (item) => item.sma50 > item.sma100,
  "SMA50 > SMA200": (item) => item.sma50 > item.sma200,
  "SMA100 > SMA20": (item) => item.sma100 > item.sma20,
  "SMA100 > SMA50": (item) => item.sma100 > item.sma50,
  "SMA100 > SMA200": (item) => item.sma100 > item.sma200,
  "SMA200 > SMA20": (item) => item.sma200 > item.sma20,
  "SMA200 > SMA50": (item) => item.sma200 > item.sma50,
  "SMA200 > SMA100": (item) => item.sma200 > item.sma100,
  // Add additional SMA conditions here
};

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
    ...industryList,
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
      if (["trendAnalysis", "fundamentalAnalysis"].includes(rule.name)) {
        const accuracy = item[rule.name]?.accuracy;
        if (rule.condition === "over" && accuracy <= ruleValue) return false;
        if (rule.condition === "under" && accuracy > ruleValue) return false;
      }

      // Handle categorical data like analyst ratings, sector, country
      else if (
        ["analystRating", "sector", "industry", "country"].includes(rule.name)
      ) {
        if (rule.value === "any") return true;

        if (Array.isArray(ruleValue) && !ruleValue.includes(itemValue))
          return false;
        if (!Array.isArray(ruleValue) && itemValue !== ruleValue) return false;
      }

      // Handle moving averages
      else if (
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
          if (movingAverageConditions[condition]) {
            if (!movingAverageConditions[condition](item)) return false;
          } else {
            console.warn(`Unknown condition: ${condition}`);
          }
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
