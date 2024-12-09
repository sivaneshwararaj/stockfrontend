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

  "Price > Graham Number": (item) => item.price > item.grahamNumber,
  "Price < Graham Number": (item) => item.price < item.grahamNumber,
};

// Convert the input to a value or return it as-is if it's already an array
function convertUnitToValue(input: string | number | string[]) {
  try {
    if (Array.isArray(input)) {
      return input.map(convertUnitToValue); // Recursively convert array elements
    }
    if (typeof input === "number") return input;
    if (typeof input !== "string") {
      return input; // Return as-is if not a string or number
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
      "strong buy",
      "strong sell",
      "compliant",
      "non-compliant",
      "stock price",
    ]);
    
    if (nonNumericValues.has(lowerInput)) return input;

    // Handle percentage values
    if (input?.endsWith("%")) {
      const numericValue = parseFloat(input?.slice(0, -1));  // Remove '%' and convert to number
      if (isNaN(numericValue)) {
        return input; // Return original input if conversion fails
      }
      return numericValue //numericValue / 100; // Convert percentage to a decimal
    }

    // Handle units (B, M, K)
    const units = { B: 1_000_000_000, M: 1_000_000, K: 1_000 };
    const match = input.match(/^(\d+(\.\d+)?)([BMK])?$/);

    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[3] as keyof typeof units;
      return unit ? value * units[unit] : value;
    }

    // Default numeric conversion (if no unit specified)
    const numericValue = parseFloat(input);
    if (isNaN(numericValue)) {
      return input; // Return original input if conversion fails
    }

    return numericValue;
  } catch (error) {
    console.warn(`Error converting value: ${input}`, error);
    return input; // Return original input in case of any unexpected errors
  }
}
async function filterStockScreenerData(stockScreenerData, ruleOfList) {
  try {
    return stockScreenerData?.filter((item) => {
      return ruleOfList.every((rule) => {
        try {
          const itemValue = item[rule.name];
          const ruleValue = convertUnitToValue(rule.value);
          const ruleName = rule.name.toLowerCase();

          // If ruleValue is the original input (conversion failed), 
          // we'll treat it as a special case
          if (typeof ruleValue === "string") {
            // For most string inputs, we'll consider it a match
            if (rule.value === "any") return true;

            // For specific categorical checks
            if (
              [
                "analystRating",
                "halalStocks",
                "score",
                "sector",
                "industry",
                "country",
              ].includes(rule.name)
            ) {
              if (Array.isArray(ruleValue) && !ruleValue.includes(itemValue))
                return false;
              if (!Array.isArray(ruleValue) && itemValue !== ruleValue) return false;
            }

            // For other cases, we'll skip filtering
            return true;
          }

          // Handle categorical data like analyst ratings, sector, country
          if (
            [
              "analystRating",
              "halalStocks",
              "score",
              "sector",
              "industry",
              "country",
            ].includes(rule.name)
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
              "grahamnumber", // grahamNumber into lowerCase form
            ].includes(ruleName)
          ) {
            if (ruleValue === "any") return true;

            for (const condition of ruleValue) {
              if (movingAverageConditions[condition]) {
                if (!movingAverageConditions[condition](item)) return false;
              } else {
                // console.warn(`Unknown condition: ${condition}`);
              }
            }

            return true; // If all conditions are met
          }

          // Handle "between" condition
          else if (rule.condition === "between" && Array?.isArray(ruleValue)) {
            // Convert rule values, ensuring they are valid
            const [min, max] = ruleValue?.map(convertUnitToValue);

            // Handle the case where one or both values are missing (empty string or undefined)
            if ((min === "" || min === undefined || min === null) && (max === "" || max === undefined || max === null)) {
              return true; // If both values are empty or undefined, consider the condition as met (open-ended)
            }

            // If only one of min or max is missing, handle it as open-ended
            if (min === "" || min === undefined || min === null) {
              if (itemValue >= max) return false; // If min is missing, only check against max
            } else if (max === "" || max === undefined || max === null) {
              if (itemValue <= min) return false; // If max is missing, only check against min
            } else {
              // If both min and max are defined, proceed with the normal comparison
              if (itemValue <= min || itemValue >= max) return false;
            }
          }

          // Default numeric or string comparison
          else if (typeof ruleValue === "string") {
            return true; // Skip non-numeric comparisons
          } else if (itemValue === null) {
            return false; // Null values do not meet any condition
          } else if (rule.condition === "over" && itemValue <= ruleValue) {
            return false;
          } else if (rule.condition === "under" && itemValue > ruleValue) {
            return false;
          }

          return true;
        } catch (ruleError) {
          console.warn(`Error processing rule for item:`, rule, ruleError);
          return true; // Default to including the item if rule processing fails
        }
      });
    }) || stockScreenerData; // Return original data if filtering completely fails
  } catch (error) {
    console.error('Error in filterStockScreenerData:', error);
    return stockScreenerData; // Return original data if any catastrophic error occurs
  }
}

onmessage = async (event: MessageEvent) => {
  const { stockScreenerData, ruleOfList } = event.data || {};

  try {
    const filteredData = await filterStockScreenerData(
      stockScreenerData,
      ruleOfList
    );

    postMessage({ 
      message: "success", 
      filteredData,
      originalDataLength: stockScreenerData?.length || 0,
      filteredDataLength: filteredData?.length || 0
    });
  } catch (error) {
    console.error('Error in onmessage handler:', error);
    postMessage({ 
      message: "error", 
      originalData: stockScreenerData,
      error: error.toString()
    });
  }
};

export {};