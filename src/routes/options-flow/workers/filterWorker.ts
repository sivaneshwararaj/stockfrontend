function convertUnitToValue(
  input: string | number | string[],
): number | string[] | string {
  if (Array.isArray(input)) return input;
  if (typeof input === "number") return input;
  if (typeof input !== "string") {
    throw new TypeError(
      `Expected a string or number, but received ${typeof input}`,
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
    "at midpoint",
    "above ask",
    "below bid",
    "sweep",
    "trade",
    "stock",
    "etf",
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
  let now = new Date();
  const expirationDate = new Date(dateString);
  const dayOfWeek = now.getDay();

  // Special handling for "1 day" range when it's Friday, Saturday, or Sunday
  if (
    range.toLowerCase() === "1 day" &&
    (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0)
  ) {
    // Calculate next Monday
    const daysUntilMonday =
      dayOfWeek === 5
        ? 3 // From Friday
        : dayOfWeek === 6
          ? 2 // From Saturday
          : 1; // From Sunday

    const monday = new Date(now);
    monday.setDate(now.getDate() + daysUntilMonday);

    // Compare with next Monday
    return isSameDay(expirationDate, monday);
  }

  // Adjust now to Friday if it falls on a weekend (for other ranges)
  if (dayOfWeek === 6) {
    // Saturday
    now.setDate(now.getDate() - 1); // Move to Friday
  } else if (dayOfWeek === 0) {
    // Sunday
    now.setDate(now.getDate() - 2); // Move to Friday
  }

  const timeDiff = expirationDate.getTime() - now.getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

  switch (range.toLowerCase()) {
    case "same day":
      return isSameDay(now, expirationDate);
    case "1 day":
      return daysDiff >= 0 && daysDiff <= 1;
    case "1 week":
      return daysDiff >= 0 && daysDiff <= 7;
    case "2 weeks":
      return daysDiff >= 0 && daysDiff <= 14;
    case "1 month":
      return daysDiff >= 0 && daysDiff <= 30;
    case "3 months":
      return daysDiff >= 0 && daysDiff <= 90;
    case "6 months":
      return daysDiff >= 0 && daysDiff <= 180;
    case "1 year":
      return daysDiff >= 0 && daysDiff <= 365;
    case "3 years":
      return daysDiff >= 0 && daysDiff <= 1095;
    default:
      return false;
  }
}

async function filterRawData(rawData, ruleOfList, filterQuery) {
  // Split filterQuery into an array of tickers if it's a comma-separated string
  const filterTickers = filterQuery
    ? filterQuery.split(",").map((ticker) => ticker.trim().toUpperCase())
    : [];

  return rawData?.filter((item) => {
    // Check if the item's ticker matches any of the tickers in filterTickers
    if (
      filterTickers.length > 0 &&
      !filterTickers.includes(item.ticker.toUpperCase())
    ) {
      return false; // Exclude if the ticker doesn't match any in filterTickers
    }

    return ruleOfList.every((rule) => {
      const ruleName = rule.name.toLowerCase();
      const ruleValue = convertUnitToValue(rule.value);

      // Handle volumeOIRatio
      if (ruleName === "volumeoiratio") {
        const volume = parseFloat(item.volume);
        const openInterest = parseFloat(item.open_interest);

        if (isNaN(volume) || isNaN(openInterest) || openInterest === 0) {
          return false; // Invalid data, exclude this item
        }

        const ratio = (volume / openInterest) * 100;

        if (rule.condition === "over" && ratio <= ruleValue) return false;
        if (rule.condition === "under" && ratio >= ruleValue) return false;
        return true;
      }

      const itemValue = item[rule.name];

      // Handle date_expiration
      if (ruleName === "date_expiration") {
        if (isAny(ruleValue)) return true;
        if (Array.isArray(ruleValue)) {
          return ruleValue.some((range) => isDateWithinRange(itemValue, range));
        }
        return isDateWithinRange(itemValue, ruleValue as string);
      }

      // Handle categorical data
      else if (
        [
          "put_call",
          "sentiment",
          "execution_estimate",
          "option_activity_type",
          "underlying_type",
        ].includes(ruleName)
      ) {
        if (isAny(ruleValue)) return true;
        if (itemValue === null || itemValue === undefined) return false;

        const lowerItemValue = itemValue.toString().toLowerCase();

        if (Array.isArray(ruleValue)) {
          return ruleValue.some(
            (value) => lowerItemValue === value.toString().toLowerCase(),
          );
        }

        return lowerItemValue === ruleValue.toString().toLowerCase();
      }

      // Default numeric or string comparison
      if (typeof ruleValue === "string") return true;
      if (itemValue === null || itemValue === undefined) return false;
      const numericItemValue = parseFloat(itemValue);
      if (isNaN(numericItemValue)) return false;

      if (rule.condition === "over" && numericItemValue <= ruleValue)
        return false;
      if (rule.condition === "under" && numericItemValue >= ruleValue)
        return false;
      return true;
    });
  });
}

onmessage = async (event: MessageEvent) => {
  const { rawData, ruleOfList, filterQuery } = event.data || {};
  let filteredData = await filterRawData(rawData, ruleOfList, filterQuery);
  filteredData = Array?.from(
    new Map(filteredData?.map((item) => [item?.id, item]))?.values(),
  );
  postMessage({ message: "success", filteredData });
};

export {};
