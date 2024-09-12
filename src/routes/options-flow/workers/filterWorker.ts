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
    "below bid",
    "below ask",
    "sweep",
    "trade",
    ...[
      "1 day",
      "1 Week",
      "2 Weeks",
      "1 Month",
      "3 Months",
      "6 Months",
      "1 Year",
      "3 Years",
    ],
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

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isDateWithinRange(dateString: string, range: string): boolean {
  const now = new Date();
  const expirationDate = new Date(dateString);
  const timeDiff = expirationDate.getTime() - now.getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

  switch (range.toLowerCase()) {
    case "today":
      // Check if the current date and expiration date are the same
      return isSameDay(now, expirationDate);
    case "1 day":
      return daysDiff >= 0 && daysDiff <= 1;
    case "1 week":
      return daysDiff > 1 && daysDiff <= 7;
    case "2 weeks":
      return daysDiff > 7 && daysDiff <= 14;
    case "1 month":
      return daysDiff > 14 && daysDiff <= 30;
    case "3 months":
      return daysDiff > 30 && daysDiff <= 90;
    case "6 months":
      return daysDiff > 90 && daysDiff <= 180;
    case "1 year":
      return daysDiff > 180 && daysDiff <= 365;
    case "3 years":
      return daysDiff > 365 && daysDiff <= 1095;
    default:
      return false;
  }
}

async function filterRawData(rawData, ruleOfList, filterQuery) {
  return rawData?.filter((item) => {
    if (
      filterQuery?.length !== 0 &&
      item.ticker !== filterQuery.toUpperCase()
    ) {
      return false; // Exclude if the ticker doesn't match the filterQuery
    }

    return ruleOfList.every((rule) => {
      const itemValue = item[rule.name];
      const ruleValue = convertUnitToValue(rule.value);
      const ruleName = rule.name.toLowerCase();

      // Handle date_expiration
      if (ruleName === "date_expiration") {
        if (isAny(ruleValue)) return true;
        if (Array.isArray(ruleValue)) {
          return ruleValue.some((range) => isDateWithinRange(itemValue, range));
        }
        return isDateWithinRange(itemValue, ruleValue as string);
      }

      // Handle categorical data like analyst ratings, sector, country
      if (
        [
          "put_call",
          "sentiment",
          "execution_estimate",
          "option_activity_type",
        ].includes(ruleName)
      ) {
        if (isAny(ruleValue)) return true;
        if (Array.isArray(ruleValue)) return ruleValue.includes(itemValue);
        return itemValue === ruleValue;
      }

      // Default numeric or string comparison
      if (typeof ruleValue === "string") return true;
      if (itemValue === null) return false;
      if (rule.condition === "over" && itemValue <= ruleValue) return false;
      if (rule.condition === "under" && itemValue > ruleValue) return false;
      return true;
    });
  });
}

onmessage = async (event: MessageEvent) => {
  const { rawData, ruleOfList, filterQuery } = event.data || {};
  const filteredData = await filterRawData(rawData, ruleOfList, filterQuery);
  postMessage({ message: "success", filteredData });
};

export {};
