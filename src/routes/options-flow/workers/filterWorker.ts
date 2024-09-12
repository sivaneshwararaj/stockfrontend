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
    "puts",
    "calls",
    "bullish",
    "neutral",
    "bearish",
    "at bid",
    "at ask",
    "sweep",
    "trade",
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

function isAny(value: string | string[]): boolean {
  if (typeof value === "string") return value.toLowerCase() === "any";
  if (Array.isArray(value))
    return value.length === 1 && value[0].toLowerCase() === "any";
  return false;
}

async function filterRawData(rawData, ruleOfList) {
  return rawData?.filter((item) => {
    return ruleOfList.every((rule) => {
      const itemValue = item[rule.name];
      const ruleValue = convertUnitToValue(rule.value);
      const ruleName = rule.name.toLowerCase();

      // Handle categorical data like analyst ratings, sector, country
      if (
        [
          "put_call",
          "sentiment",
          "execution_estimate",
          "option_activity_type",
        ].includes(ruleName)
      ) {
        if (isAny(ruleValue)) return true; // Return true for "any" or ["any"]
        if (Array.isArray(ruleValue)) return ruleValue.includes(itemValue);
        return itemValue === ruleValue;
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
  const { rawData, ruleOfList } = event.data || {};
  const filteredData = await filterRawData(rawData, ruleOfList);
  postMessage({ message: "success", filteredData });
  console.log(filteredData);
};

export {};
