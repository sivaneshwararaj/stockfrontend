<script lang="ts">
  import { AreaSeries, Chart, PriceLine } from "svelte-lightweight-charts";
  import { TrackingModeExitMode, ColorType } from "lightweight-charts";
  import {
    getCache,
    setCache,
    numberOfUnreadNotification,
    globalForm,
    isCrosshairMoveActive,
    realtimePrice,
    priceIncrease,
    wsBidPrice,
    wsAskPrice,
    currentPortfolioPrice,
    stockTicker,
    displayCompanyName,
    isOpen,
    isBeforeMarketOpen,
    isWeekend,
    shouldUpdatePriceChart,
    priceChartData,
  } from "$lib/store";
  import { onDestroy, onMount } from "svelte";
  import BullBearSay from "$lib/components/BullBearSay.svelte";
  import WIIM from "$lib/components/WIIM.svelte";

  import News from "$lib/components/News.svelte";
  import NextEarnings from "$lib/components/NextEarnings.svelte";
  import EarningsSurprise from "$lib/components/EarningsSurprise.svelte";
  import DividendAnnouncement from "$lib/components/DividendAnnouncement.svelte";
  import Sidecard from "$lib/components/Sidecard.svelte";

  import { convertTimestamp, abbreviateNumber } from "$lib/utils";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { goto } from "$app/navigation";

  export let data;
  export let form;

  let prePostData = {};
  let stockDeck = {};

  $: previousClose = data?.getStockQuote?.previousClose;
  //============================================//
  const intervals = ["1D", "1W", "1M", "6M", "1Y", "MAX"];

  let chart = null;
  async function checkChart() {
    if (chart) {
      clearInterval(intervalId);
      fitContentChart();
    }
  }

  //const startTimeTracking = performance.now();

  //==========================//

  $: {
    if (output !== null) {
      let change;
      let currentDataRow;
      let baseClose;

      // Determine current data row and base close price based on displayData
      switch (displayData) {
        case "1D":
          const length = oneDayPrice?.length;
          for (let i = length - 1; i >= 0; i--) {
            if (!isNaN(oneDayPrice[i]?.close)) {
              currentDataRow = oneDayPrice[i];
              break;
            }
          }
          baseClose = previousClose;
          break;

        case "1W":
          currentDataRow = oneWeekPrice?.at(-1); // Latest entry for 1 week
          baseClose = oneWeekPrice?.[0]?.close;
          break;

        case "1M":
          currentDataRow = oneMonthPrice?.at(-1); // Latest entry for 1 month
          baseClose = oneMonthPrice?.[0]?.close;
          break;

        case "6M":
          currentDataRow = sixMonthPrice?.at(-1); // Latest entry for 6 months
          baseClose = sixMonthPrice?.[0]?.close;
          break;

        case "1Y":
          currentDataRow = oneYearPrice?.at(-1); // Latest entry for 1 year
          baseClose = oneYearPrice?.[0]?.close;
          break;

        case "MAX":
          currentDataRow = maxPrice?.at(-1); // Latest entry for MAX range
          baseClose = maxPrice?.[0]?.close;
          break;
      }

      // Calculate percentage change if baseClose and currentDataRow are valid
      const closeValue =
        displayData === "1D" &&
        !$isCrosshairMoveActive &&
        $realtimePrice !== null
          ? $realtimePrice
          : (currentDataRow?.close ?? currentDataRow?.value);

      if (closeValue && baseClose) {
        change = ((closeValue / baseClose - 1) * 100).toFixed(2);
      }

      // Format date
      const date = new Date(currentDataRow?.time * 1000);

      const options = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      };

      //const formattedDate = (displayData === '1D' || displayData === '1W' || displayData === '1M') ? date.toLocaleString('en-GB', options).replace(/\//g, '.') : date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
      const formattedDate =
        displayData === "1D" || displayData === "1W" || displayData === "1M"
          ? date.toLocaleString("en-US", options)
          : new Date(currentDataRow?.time)?.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

      const safeFormattedDate =
        formattedDate === "Invalid Date"
          ? convertTimestamp(data?.getStockQuote?.timestamp)
          : formattedDate;

      // Set display legend
      displayLegend = {
        close:
          currentDataRow?.value ??
          currentDataRow?.close ??
          data?.getStockQuote?.price,
        date: safeFormattedDate,
        change,
      };
    }
  }

  //==========================//

  $: {
    if ($stockTicker && typeof window !== "undefined") {
      // add a check to see if running on client-side
      if ($realtimePrice !== null && $realtimePrice !== 0) {
        $realtimePrice =
          $realtimePrice !== 0 ? $realtimePrice : data?.getStockQuote?.price;
        $currentPortfolioPrice = $realtimePrice;
      } else if (oneDayPrice?.length !== 0) {
        const length = oneDayPrice?.length;
        for (let i = length - 1; i >= 0; i--) {
          if (!isNaN(oneDayPrice[i]?.close)) {
            $currentPortfolioPrice = oneDayPrice[i]?.close;
            break;
          }
        }
      }
    }
  }

  let displayData;
  let colorChange;
  let topColorChange;
  let bottomColorChange;

  let lastValue;
  async function changeData(state) {
    switch (state) {
      case "1D":
        displayData = "1D";
        if (oneDayPrice?.length !== 0) {
          displayLastLogicalRangeValue = oneDayPrice?.at(0)?.close; //previousClose
          const length = oneDayPrice?.length;
          for (let i = length - 1; i >= 0; i--) {
            if (!isNaN(oneDayPrice[i]?.close)) {
              lastValue = oneDayPrice[i]?.close;
              break;
            }
          }
        } else {
          displayLastLogicalRangeValue = null;
          lastValue = null;
        }
        break;
      case "1W":
        displayData = "1W";
        await historicalPrice("one-week");
        if (oneWeekPrice?.length !== 0) {
          displayLastLogicalRangeValue = oneWeekPrice?.at(0)?.close;
          lastValue = oneWeekPrice?.slice(-1)?.at(0)?.close;
        } else {
          displayLastLogicalRangeValue = null;
          lastValue = null;
        }

        break;
      case "1M":
        displayData = "1M";
        await historicalPrice("one-month");
        if (oneMonthPrice?.length !== 0) {
          displayLastLogicalRangeValue = oneMonthPrice?.at(0)?.close;
          lastValue = oneMonthPrice.slice(-1)?.at(0)?.close;
        } else {
          displayLastLogicalRangeValue = null;
          lastValue = null;
        }
        break;

      case "6M":
        displayData = "6M";
        await historicalPrice("six-months");
        if (sixMonthPrice?.length !== 0) {
          displayLastLogicalRangeValue = sixMonthPrice?.at(0)?.close;
          lastValue = sixMonthPrice?.slice(-1)?.at(0)?.close;
        } else {
          displayLastLogicalRangeValue = null;
          lastValue = null;
        }
        break;
      case "1Y":
        displayData = "1Y";
        await historicalPrice("one-year");

        if (oneYearPrice?.length !== 0) {
          displayLastLogicalRangeValue = oneYearPrice?.at(0)?.close;
          lastValue = oneYearPrice.slice(-1)?.at(0)?.close;
        } else {
          displayLastLogicalRangeValue = null;
          lastValue = null;
        }

        break;
      case "MAX":
        displayData = "MAX";
        await historicalPrice("max");
        if (maxPrice?.length !== 0) {
          displayLastLogicalRangeValue = maxPrice?.at(0)?.close;
          lastValue = maxPrice.slice(-1)?.at(0)?.close;
        } else {
          displayLastLogicalRangeValue = null;
          lastValue = null;
        }

        break;
      default:
        return;
    }
    colorChange =
      lastValue < displayLastLogicalRangeValue ? "#FF2F1F" : "#00FC50";
    topColorChange =
      lastValue < displayLastLogicalRangeValue
        ? "rgb(255, 47, 31, 0.2)"
        : "rgb(16, 219, 6, 0.2)";
    bottomColorChange =
      lastValue < displayLastLogicalRangeValue
        ? "rgb(255, 47, 31, 0.001)"
        : "rgb(16, 219, 6, 0.001)";

    fitContentChart();

    //trackButtonClick('Time Period: '+ state)
  }

  let output = null;

  //====================================//

  let intervalId = null;
  let oneDayPrice = [];
  let oneWeekPrice = [];
  let oneMonthPrice = [];
  let sixMonthPrice = [];

  let oneYearPrice = [];
  let maxPrice = [];

  async function historicalPrice(timePeriod: string) {
    const cachedData = getCache($stockTicker, "historicalPrice" + timePeriod);
    if (cachedData) {
      switch (timePeriod) {
        case "one-week":
          oneWeekPrice = cachedData;
          break;
        case "one-month":
          oneMonthPrice = cachedData;
          break;
        case "six-months":
          sixMonthPrice = cachedData;
          break;
        case "one-year":
          oneYearPrice = cachedData;
          break;
        case "max":
          maxPrice = cachedData;
          break;
        default:
          console.log(`Unsupported time period: ${timePeriod}`);
      }
    } else {
      output = null;

      const postData = {
        ticker: $stockTicker,
        timePeriod: timePeriod,
      };

      const response = await fetch("/api/historical-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      output = (await response?.json()) ?? [];

      const mapData = (data) =>
        data?.map(({ time, open, high, low, close }) => ({
          time: ["1D", "1W", "1M"]?.includes(displayData)
            ? Date?.parse(time + "Z") / 1000
            : time,
          open,
          high,
          low,
          close,
        }));

      const mappedData = mapData(output);
      try {
        switch (timePeriod) {
          case "one-week":
            oneWeekPrice = mappedData;
            break;
          case "one-month":
            oneMonthPrice = mappedData;
            break;
          case "six-months":
            sixMonthPrice = mappedData;
            break;
          case "one-year":
            oneYearPrice = mappedData;
            break;
          case "max":
            maxPrice = mappedData;
            break;
          default:
            console.log(`Unsupported time period: ${timePeriod}`);
        }
        setCache($stockTicker, mappedData, "historicalPrice" + timePeriod);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async function initializePrice() {
    output = null;
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(checkChart, 0);
    try {
      output = [...data?.getOneDayPrice] ?? [];
      oneDayPrice = output?.map((item) => ({
        time: Date?.parse(item?.time + "Z") / 1000,
        open: item?.open !== null ? item?.open : NaN,
        high: item?.high !== null ? item?.high : NaN,
        low: item?.low !== null ? item?.low : NaN,
        close: item?.close !== null ? item?.close : NaN,
      }));
      displayData =
        oneDayPrice?.length === 0 && sixMonthPrice?.length !== 0 ? "6M" : "1D";
      //lastValue = oneDayPrice[oneDayPrice?.length - 1]?.value;
      if (displayData === "1D") {
        const length = oneDayPrice?.length;
        for (let i = length - 1; i >= 0; i--) {
          if (!isNaN(oneDayPrice[i]?.close)) {
            lastValue = oneDayPrice[i]?.close;
            break;
          }
        }
      } else if (displayData === "6M") {
        lastValue = sixMonthPrice?.slice(-1)?.at(0)?.close;
      }

      displayLastLogicalRangeValue =
        oneDayPrice?.length === 0 && sixMonthPrice?.length !== 0
          ? sixMonthPrice?.at(0)?.close
          : oneDayPrice?.at(0)?.close; //previousClose;

      //colorChange = lastValue < displayLastLogicalRangeValue ? "#CC3636" : "#367E18";

      colorChange =
        lastValue < displayLastLogicalRangeValue ? "#FF2F1F" : "#00FC50";
      topColorChange =
        lastValue < displayLastLogicalRangeValue
          ? "rgb(255, 47, 31, 0.2)"
          : "rgb(16, 219, 6, 0.2)";
      bottomColorChange =
        lastValue < displayLastLogicalRangeValue
          ? "rgb(255, 47, 31, 0.001)"
          : "rgb(16, 219, 6, 0.001)";
    } catch (e) {
      console.log(e);
    }
  }

  async function getPrePostQuote() {
    if (!$isOpen) {
      const postData = { ticker: $stockTicker, path: "pre-post-quote" };
      const response = await fetch("/api/ticker-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      prePostData = await response.json();
    }
  }

  let currentDataRow = { value: "-", date: "-" };

  let lineLegend = null;
  let displayLegend = { close: "-", date: "-" };

  function handleSeriesReference(ref) {
    try {
      lineLegend = ref;
    } catch (error) {
      console.log(error);
    }
  }

  let displayLastLogicalRangeValue;

  const fitContentChart = async () => {
    if (displayData === "1Y" && oneYearPrice?.length === 0) {
    } else if (chart !== null && typeof window !== "undefined") {
      chart?.timeScale().fitContent();

      chart?.applyOptions({
        trackingMode: {
          exitMode: TrackingModeExitMode.OnTouchEnd,
        },
      });
    }
  };

  let width = 580;
  //Initial height of graph
  let height = 350;

  let observer;
  let ref;

  ref = (element) => {
    if (observer) {
      observer?.disconnect();
    }
    if (!element) {
      return;
    }

    observer = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
    });
    observer.observe(element);
  };

  //===============================================//
  function defaultTickMarkFormatter(timePoint, tickMarkType, locale) {
    const formatOptions = {
      timeZone: "UTC",
    };

    switch (tickMarkType) {
      case 0: // TickMarkType.Year:
        formatOptions.year = "numeric";
        break;
      case 1: // TickMarkType.Month:
        formatOptions.month = "short";
        break;
      case 2: // TickMarkType.DayOfMonth:
        formatOptions.day = "numeric";
        break;
      case 3: // TickMarkType.Time:
        formatOptions.hour12 = true; // Use 12-hour clock
        formatOptions.hour = "numeric"; // Use numeric hour without leading zero
        break;
      case 4: // TickMarkType.TimeWithSeconds:
        formatOptions.hour12 = true; // Use 12-hour clock
        formatOptions.hour = "numeric"; // Use numeric hour without leading zero
        formatOptions.minute = "2-digit"; // Always show minutes with leading zero
        formatOptions.second = "2-digit"; // Always show seconds with leading zero
        break;
      default:
      // Ensure this default case handles unexpected tickMarkType values
    }
    if ([3, 4]?.includes(tickMarkType)) {
      const date = new Date(timePoint?.timestamp * 1000);
      return new Intl.DateTimeFormat(locale, formatOptions)?.format(date);
    } else {
      const date = new Date(timePoint?.timestamp);
      return new Intl.DateTimeFormat(locale, formatOptions)?.format(date);
    }
  }

  $: options = {
    width: width,
    height: height,
    layout: {
      background: {
        type: ColorType.Solid,
        color: "#09090B",
      },
      textColor: "#d1d4dc",
    },
    grid: {
      vertLines: {
        color: "#09090B",
        visible: false,
      },
      horzLines: {
        color: "#09090B",
        visible: false,
      },
    },
    crosshair: {
      horzLine: {
        visible: true,
        labelBackgroundColor: "#fff",
      },
      vertLine: {
        labelVisible: true,
        labelBackgroundColor: "#fff",
        style: 0,
      },
    },
    priceScale: {
      autoScale: true,
      scaleMargins: {
        top: 0.3,
        bottom: 0.25,
      },
    },
    rightPriceScale: {
      scaleMargins: {
        top: 0.3,
        bottom: 0.25,
        borderVisible: false,
      },
      visible: true,
      borderVisible: false,
      mode: 1, // Keeps price scale fixed
    },
    leftPriceScale: {
      visible: false,
      borderColor: "rgba(197, 203, 206, 0.8)",
    },
    handleScale: {
      mouseWheel: false,
      pinch: false, // Disables scaling via pinch gestures
      axisPressedMouseMove: false, // Disables scaling by dragging the axis with the mouse
    },
    handleScroll: {
      mouseWheel: false,
      horzTouchDrag: false,
      vertTouchDrag: false,
      pressedMouseMove: false,
    },
    timeScale: {
      borderColor: "#fff",
      textColor: "#fff",
      borderVisible: false,
      visible: true,
      fixLeftEdge: true,
      fixRightEdge: true,
      timeVisible: ["1D", "1W", "1M"].includes(displayData),
      secondsVisible: false,
      tickMarkFormatter: (time, tickMarkType, locale) => {
        return defaultTickMarkFormatter(
          { timestamp: time },
          tickMarkType,
          locale,
        );
      },
    },
  };

  onDestroy(async () => {
    $priceIncrease = null;
    $globalForm = [];
    shouldUpdatePriceChart.set(false);
  });

  $: dataMapping = {
    "1D": oneDayPrice,
    "1W": oneWeekPrice,
    "1M": oneMonthPrice,
    "6M": sixMonthPrice,
    "1Y": oneYearPrice,
    MAX: maxPrice,
  };

  $: {
    if (form) {
      $globalForm = form;
    }
  }

  async function exportData(timePeriod: string) {
    if (data?.user?.tier === "Pro") {
      let exportList = [];

      const response = await fetch("/api/export-price-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticker: $stockTicker, timePeriod: timePeriod }),
      });

      exportList = await response.json();

      exportList = exportList?.map(
        ({ time, open, high, low, close, date, volume }) => ({
          date: timePeriod === "max" ? time : date, // Use 'time' if timePeriod is "max", otherwise use 'date'
          open,
          high,
          low,
          close,
          volume,
        }),
      );

      const csvRows = [];

      // Add headers row
      csvRows.push("time,open,high,low,close, volume");

      // Add data rows
      for (const row of exportList) {
        const csvRow = `${row.date},${row.open},${row.high},${row.low},${row.close},${row.volume}`;
        csvRows.push(csvRow);
      }

      // Create CSV blob and trigger download
      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", `${$stockTicker}_${timePeriod}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      goto("/pricing");
    }
  }

  function updateClosePrice(data, extendPriceChart) {
    const newDateParsedUTC = Date?.parse(extendPriceChart?.time + "Z") / 1000; // Parse the incoming time
    const closePrice = extendPriceChart?.price; // Store the close price for easier reference
    let foundMatch = false;
    let lastNonNullCloseIndex = null;

    // Iterate through data to find the right time slot
    for (let i = 0; i < data.length; i++) {
      // Check if the timestamp matches
      if (data[i].time === newDateParsedUTC) {
        data[i].close = closePrice; // Update the existing close price
        foundMatch = true;
        break; // Exit loop once matched
      }
      // Keep track of the last non-null close price
      if (data[i].close !== null) {
        lastNonNullCloseIndex = i;
      }
    }

    // If no matching timestamp was found, add new data
    if (!foundMatch) {
      // Only update the last non-null close if it exists
      if (lastNonNullCloseIndex !== null) {
        data[lastNonNullCloseIndex].close = closePrice; // Update with the latest close price
      } else {
        // If there's no previous close data, add a new entry
        data.push({ time: newDateParsedUTC, close: closePrice }); // Add new data
      }
    }

    return data; // Return updated data
  }

  onMount(() => {
    shouldUpdatePriceChart.subscribe(async (value) => {
      if (
        value &&
        chart !== null &&
        $realtimePrice !== null &&
        oneDayPrice?.length > 0 &&
        $priceChartData?.time !== null &&
        $priceChartData?.price !== null
      ) {
        // Create a new array and update oneDayPrice to trigger reactivity
        const updatedPrice = updateClosePrice(oneDayPrice, $priceChartData);
        oneDayPrice = [...updatedPrice]; // Reassign the updated array to trigger reactivity
        try {
          chart?.update(oneDayPrice); // Update the chart with the new prices
        } catch (e) {
          // Handle error if chart update fails
          //console.error("Chart update error:", e);
        }
        shouldUpdatePriceChart.set(false); // Reset the update flag
      }
    });
  });

  $: {
    if ($stockTicker && typeof window !== "undefined") {
      // add a check to see if running on client-side
      shouldUpdatePriceChart.set(false);
      oneDayPrice = [];
      oneWeekPrice = [];
      oneMonthPrice = [];
      oneYearPrice = [];
      maxPrice = [];
      prePostData = {};
      output = null;

      stockDeck = data?.getStockDeck; // Essential otherwise chart will not be updated since we wait until #layout.server.ts server response is finished

      const asyncFunctions = [getPrePostQuote()];

      Promise.all(asyncFunctions)
        .then((results) => {
          initializePrice();
        })
        .catch((error) => {
          console.error("An error occurred:", error);
        });
    }
  }
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) Stock Price, Quote & News · stocknear
  </title>

  <meta
    name="description"
    content={`Get a real-time ${$displayCompanyName} (${$stockTicker}) stock chart, price quote with breaking news, financials, statistics, charts and more.`}
  />
  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Stock Price, Quote & News · stocknear`}
  />
  <meta
    property="og:description"
    content={`Get a real-time ${$displayCompanyName} (${$stockTicker}) stock chart, price quote with breaking news, financials, statistics, charts and more.`}
  />
  <!--<meta property="og:image" content="https://stocknear-pocketbase.s3.amazonaws.com/logo/meta_logo.jpg"/>-->
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Stock Price, Quote & News · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Get a real-time ${$displayCompanyName} (${$stockTicker}) stock chart, price quote with breaking news, financials, statistics, charts and more.`}
  />
  <!--<meta name="twitter:image" content="https://stocknear-pocketbase.s3.amazonaws.com/logo/meta_logo.jpg"/>-->
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section class="bg-[#09090B] min-h-screen pb-40 overflow-hidden w-full">
  <div class="w-full m-auto overflow-hidden">
    <div
      class="md:flex md:justify-between md:divide-x md:divide-slate-800 w-full"
    >
      <!-- Main content -->
      <div class="pb-12 md:pb-20 w-full sm:pr-6 xl:pr-0">
        <div class="xl:pr-10">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-label-has-associated-control -->

          <div class="flex flex-row items-start w-full sm:pl-6 mt-4">
            <div class="flex flex-col items-start justify-start w-full">
              <div
                class="text-2xl md:text-3xl font-bold text-white flex flex-row items-center w-full"
              >
                {displayLegend?.close}

                {#if $priceIncrease === true}
                  <div
                    style="background-color: green;"
                    class="inline-block pulse rounded-full w-3 h-3 ml-2"
                  ></div>
                {:else if $priceIncrease === false}
                  <div
                    style="background-color: red;"
                    class="inline-block pulse rounded-full w-3 h-3 ml-2"
                  ></div>
                {/if}
              </div>

              <div class="flex flex-row items-center w-full">
                <span
                  class="items-center justify-start {displayLegend?.change > 0
                    ? "before:content-['+'] text-[#00FC50]"
                    : 'text-[#FF2F1F]'} font-medium text-xs sm:text-sm"
                  >{displayLegend?.change ?? "-"}%</span
                >

                <span class="ml-3 text-white text-xs sm:text-sm"
                  >{displayLegend?.date}</span
                >
              </div>
            </div>

            <div class="ml-auto">
              {#if Object?.keys(prePostData)?.length !== 0 && prePostData?.price !== 0}
                <div class="flex flex-col justify-end items-end">
                  <div class="flex flex-row items-center justify-end">
                    <span class="text-white text-lg sm:text-2xl font-bold">
                      {prePostData?.price}
                    </span>
                    {#if prePostData?.changesPercentage >= 0}
                      <span
                        class="ml-1 items-center justify-start text-[#00FC50] font-medium text-xs sm:text-sm"
                        >({prePostData?.changesPercentage}%)</span
                      >
                    {:else if prePostData?.changesPercentage < 0}
                      <span
                        class="ml-1 items-center justify-start text-[#FF2F1F] font-medium text-xs sm:text-sm"
                        >({prePostData?.changesPercentage}%)</span
                      >
                    {/if}
                  </div>
                  {#if $isBeforeMarketOpen && !$isOpen && !$isWeekend}
                    <div
                      class="flex flex-row items-center justify-end text-white text-xs sm:text-sm font-normal text-end w-24"
                    >
                      <span>Pre-market:</span>
                      <svg
                        class="ml-1 w-4 h-4 inline-block"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 256 256"
                        ><path
                          fill="#EA9703"
                          d="M120 40V16a8 8 0 0 1 16 0v24a8 8 0 0 1-16 0m72 88a64 64 0 1 1-64-64a64.07 64.07 0 0 1 64 64m-16 0a48 48 0 1 0-48 48a48.05 48.05 0 0 0 48-48M58.34 69.66a8 8 0 0 0 11.32-11.32l-16-16a8 8 0 0 0-11.32 11.32Zm0 116.68l-16 16a8 8 0 0 0 11.32 11.32l16-16a8 8 0 0 0-11.32-11.32M192 72a8 8 0 0 0 5.66-2.34l16-16a8 8 0 0 0-11.32-11.32l-16 16A8 8 0 0 0 192 72m5.66 114.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32ZM48 128a8 8 0 0 0-8-8H16a8 8 0 0 0 0 16h24a8 8 0 0 0 8-8m80 80a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8m112-88h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16"
                        /></svg
                      >
                    </div>
                  {:else}
                    <div
                      class="flex flex-row items-center justify-end text-white text-xs sm:text-sm font-normal text-end w-28"
                    >
                      <span>After-hours:</span>
                      <svg
                        class="ml-1 w-4 h-4 inline-block"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 256 256"
                        ><path
                          fill="#70A1EF"
                          d="M232.13 143.64a6 6 0 0 0-6-1.49a90.07 90.07 0 0 1-112.27-112.3a6 6 0 0 0-7.49-7.48a102.88 102.88 0 0 0-51.89 36.31a102 102 0 0 0 142.84 142.84a102.88 102.88 0 0 0 36.31-51.89a6 6 0 0 0-1.5-5.99m-42 48.29a90 90 0 0 1-126-126a90.9 90.9 0 0 1 35.52-28.27a102.06 102.06 0 0 0 118.69 118.69a90.9 90.9 0 0 1-28.24 35.58Z"
                        /></svg
                      >
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
          <!-----End-Header-CandleChart-Indicators------>
          <!--Start Time Interval-->
          <div
            class="hidden sm:flex flex-row items-center pl-1 sm:pl-6 w-full mt-4"
          >
            {#if !$stockTicker?.includes(".")}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                  <Button
                    builders={[builder]}
                    class="ml-auto border-gray-600 border bg-[#09090B] sm:hover:bg-[#27272A] ease-out flex flex-row justify-between items-center px-3 py-2 text-white rounded-lg truncate"
                  >
                    <span class="truncate text-white">Export</span>
                    <svg
                      class="-mr-1 ml-1 h-5 w-5 xs:ml-2 inline-block"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      style="max-width:40px"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  class="w-fit h-fit max-h-72 overflow-y-auto scroller"
                >
                  <DropdownMenu.Label class="text-gray-400">
                    Historical Stock Price
                  </DropdownMenu.Label>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Group>
                    <!--
                      <DropdownMenu.Item on:click={exportData} class="cursor-pointer hover:bg-[#27272A]">
                       <svg class="w-3.5 h-3.5 mr-1 {data?.user?.tier === 'Pro' ? 'hidden' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#A3A3A3" d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"/></svg>
                        1 min 
                      </DropdownMenu.Item>
                      <DropdownMenu.Item on:click={exportData} class="cursor-pointer hover:bg-[#27272A]">
                        <svg class="w-3.5 h-3.5 mr-1 {data?.user?.tier === 'Pro' ? 'hidden' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#A3A3A3" d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"/></svg>
                        5 min
                      </DropdownMenu.Item>
                      <DropdownMenu.Item on:click={exportData} class="cursor-pointer hover:bg-[#27272A]">
                        <svg class="w-3.5 h-3.5 mr-1 {data?.user?.tier === 'Pro' ? 'hidden' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#A3A3A3" d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"/></svg>
                        15 min
                      </DropdownMenu.Item>
                    -->
                    <DropdownMenu.Item
                      on:click={() => exportData("30min")}
                      class="cursor-pointer hover:bg-[#27272A]"
                    >
                      <svg
                        class="w-3.5 h-3.5 mr-1 {data?.user?.tier === 'Pro'
                          ? 'hidden'
                          : ''}"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        ><path
                          fill="#A3A3A3"
                          d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                        /></svg
                      >

                      30 min
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      on:click={() => exportData("1hour")}
                      class="cursor-pointer hover:bg-[#27272A]"
                    >
                      <svg
                        class="w-3.5 h-3.5 mr-1 {data?.user?.tier === 'Pro'
                          ? 'hidden'
                          : ''}"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        ><path
                          fill="#A3A3A3"
                          d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                        /></svg
                      >
                      1 hour
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      on:click={() => exportData("max")}
                      class="cursor-pointer hover:bg-[#27272A]"
                    >
                      1 day
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            {/if}
          </div>
          <!--End Time Interval-->

          <!--End Ticker Section-->
          <!-- Start Graph -->

          <div class="sm:pl-7 mt-4 mb-5 lg:flex lg:flex-row lg:gap-x-4 w-full">
            {#if dataMapping[displayData]?.length === 0}
              <div
                class="order-1 lg:order-5 m-auto grow overflow-hidden border-gray-600 py-0.5 xs:py-1 sm:px-0.5 sm:pb-3 sm:pt-2.5 lg:mb-0 lg:border-0 lg:border-l lg:border-sharp lg:px-0 lg:py-0 lg:pl-5 md:mb-4 md:border-b"
              >
                <div class="flex items-center justify-between py-1 sm:pt-0.5">
                  <div class="hide-scroll overflow-x-auto">
                    <ul
                      class="flex space-x-[3px] whitespace-nowrap pl-0.5 xs:space-x-1"
                    >
                      {#each intervals as interval}
                        <li>
                          <button
                            on:click={() => changeData(interval)}
                            class="px-1 py-1 text-sm sm:text-[1rem] xs:px-[3px] bp:px-1.5 sm:px-2 xxxl:px-3"
                          >
                            <span
                              class="block {displayData === interval
                                ? 'text-white'
                                : 'text-gray-400'}">{interval}</span
                            >
                            <div
                              class="{displayData === interval
                                ? `bg-[${colorChange}] `
                                : 'bg-[#09090B]'} mt-1 h-[3px] w-[1.5rem] m-auto rounded-full"
                            />
                          </button>
                        </li>
                      {/each}
                    </ul>
                  </div>
                  <div
                    class="flex shrink flex-row space-x-1 pr-1 text-sm sm:text-[1rem]"
                  >
                    <span
                      class={displayLegend?.change >= 0
                        ? "before:content-['+'] text-[#00FC50]"
                        : "text-[#FF2F1F]"}
                    >
                      {displayLegend?.change ?? "-"}%
                    </span>
                    <span class="hidden text-gray-200 sm:block"
                      >({displayData})</span
                    >
                  </div>
                </div>
                <div class="h-[250px] sm:h-[350px]">
                  <div
                    class="flex h-full w-full flex-col items-center justify-center rounded-sm border border-gray-800 p-6 text-center md:p-12"
                  >
                    <div
                      class="mb-4 text-white text-[1rem] sm:text-xl font-semibold"
                    >
                      No {displayData} chart data available
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <div
                class="order-1 lg:order-5 grow overflow-hidden border-gray-600 py-0.5 xs:py-1 sm:px-0.5 sm:pb-3 sm:pt-2.5 lg:mb-0 lg:border-0 lg:border-l lg:border-sharp lg:px-0 lg:py-0 lg:pl-5 md:mb-4 md:border-b"
              >
                <div class="flex items-center justify-between py-1 sm:pt-0.5">
                  <div class="hide-scroll overflow-x-auto">
                    <ul
                      class="flex space-x-[3px] whitespace-nowrap pl-0.5 xs:space-x-1"
                    >
                      {#each intervals as interval}
                        <li>
                          <button
                            on:click={() => changeData(interval)}
                            class="px-1 py-1 text-sm sm:text-[1rem] xs:px-[3px] bp:px-1.5 sm:px-2 xxxl:px-3"
                          >
                            <span
                              class="block {displayData === interval
                                ? 'text-white'
                                : 'text-gray-400'}">{interval}</span
                            >
                            <div
                              class="{displayData === interval
                                ? `bg-[${colorChange}] `
                                : 'bg-[#09090B]'} mt-1 h-[3px] w-[1.5rem] m-auto rounded-full"
                            />
                          </button>
                        </li>
                      {/each}
                    </ul>
                  </div>
                  <div
                    class="flex shrink flex-row space-x-1 pr-1 text-sm sm:text-[1rem]"
                  >
                    <span
                      class={displayLegend?.change >= 0
                        ? "before:content-['+'] text-[#00FC50]"
                        : "text-[#FF2F1F]"}
                    >
                      {displayLegend?.change}%
                    </span>
                    <span class="hidden text-gray-200 sm:block"
                      >({displayData})</span
                    >
                  </div>
                </div>

                {#if output !== null && dataMapping[displayData]?.length !== 0}
                  <Chart
                    {...options}
                    autoSize={true}
                    ref={(api) => (chart = api)}
                  >
                    {#if displayData === "1D"}
                      <AreaSeries
                        reactive={true}
                        data={oneDayPrice?.map(({ time, close }) => ({
                          time,
                          value: close,
                        }))}
                        lineWidth={1.5}
                        priceScaleId="right"
                        lineColor={colorChange}
                        topColor={topColorChange}
                        bottomColor={bottomColorChange}
                        ref={handleSeriesReference}
                        priceLineVisible={false}
                      >
                        <PriceLine
                          price={oneDayPrice?.at(0)?.close}
                          lineWidth={1}
                          color="#fff"
                        />
                      </AreaSeries>
                    {:else if displayData === "1W"}
                      <AreaSeries
                        data={oneWeekPrice?.map(({ time, close }) => ({
                          time,
                          value: close,
                        }))}
                        lineWidth={1.5}
                        priceScaleId="right"
                        lineColor={colorChange}
                        topColor={topColorChange}
                        bottomColor={bottomColorChange}
                        ref={handleSeriesReference}
                        priceLineVisible={false}
                      >
                        <PriceLine
                          price={oneWeekPrice?.at(0)?.close}
                          lineWidth={1}
                          color="#fff"
                        />
                      </AreaSeries>
                    {:else if displayData === "1M"}
                      <AreaSeries
                        data={oneMonthPrice?.map(({ time, close }) => ({
                          time: time,
                          value: close,
                        }))}
                        lineWidth={1.5}
                        priceScaleId="right"
                        lineColor={colorChange}
                        topColor={topColorChange}
                        bottomColor={bottomColorChange}
                        ref={handleSeriesReference}
                        priceLineVisible={false}
                      >
                        <PriceLine
                          price={oneMonthPrice?.at(0)?.close}
                          lineWidth={1}
                          color="#fff"
                        />
                      </AreaSeries>
                    {:else if displayData === "6M"}
                      <AreaSeries
                        data={sixMonthPrice?.map(({ time, close }) => ({
                          time,
                          value: close,
                        }))}
                        lineWidth={1.5}
                        priceScaleId="right"
                        lineColor={colorChange}
                        topColor={topColorChange}
                        bottomColor={bottomColorChange}
                        ref={handleSeriesReference}
                        priceLineVisible={false}
                      >
                        <PriceLine
                          price={sixMonthPrice?.at(0)?.close}
                          lineWidth={1}
                          color="#fff"
                        />
                      </AreaSeries>
                    {:else if displayData === "1Y"}
                      <AreaSeries
                        data={oneYearPrice?.map(({ time, close }) => ({
                          time,
                          value: close,
                        }))}
                        lineWidth={1.5}
                        priceScaleId="right"
                        lineColor={colorChange}
                        topColor={topColorChange}
                        bottomColor={bottomColorChange}
                        ref={handleSeriesReference}
                        priceLineVisible={false}
                      >
                        <PriceLine
                          price={oneYearPrice?.at(0)?.close}
                          lineWidth={1}
                          color="#fff"
                        />
                      </AreaSeries>
                    {:else if displayData === "MAX"}
                      <AreaSeries
                        data={maxPrice?.map(({ time, close }) => ({
                          time,
                          value: close,
                        }))}
                        lineWidth={1.5}
                        priceScaleId="right"
                        lineColor={colorChange}
                        topColor={topColorChange}
                        bottomColor={bottomColorChange}
                        ref={handleSeriesReference}
                        priceLineVisible={false}
                      >
                        <PriceLine
                          price={maxPrice?.at(0)?.close}
                          lineWidth={1}
                          color="#fff"
                        />
                      </AreaSeries>
                    {/if}
                  </Chart>
                {:else}
                  <div
                    class="flex justify-center w-full sm:w-[650px] h-[350px] items-center"
                  >
                    <div class="relative">
                      <label
                        class="bg-[#09090B] rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      >
                        <span
                          class="loading loading-spinner loading-md text-gray-400"
                        ></span>
                      </label>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}

            <div
              class="mt-10 lg:mt-0 order-5 lg:order-1 flex flex-row space-x-2 tiny:space-x-3 xs:space-x-4"
            >
              <table
                class="w-[50%] text-sm text-white tiny:text-small lg:w-full lg:min-w-[210px]"
              >
                <tbody
                  ><tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >Bid</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{$wsBidPrice !== 0 && $wsBidPrice !== null
                        ? $wsBidPrice
                        : (data?.getStockQuote?.bid ?? "-")}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >Market Cap</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{abbreviateNumber(data?.getStockQuote?.marketCap)}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >Revenue (ttm)</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{stockDeck?.revenueTTM !== null
                        ? abbreviateNumber(stockDeck?.revenueTTM)
                        : "n/a"}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >Net Income (ttm)</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{stockDeck?.netIncomeTTM !== null
                        ? abbreviateNumber(stockDeck?.netIncomeTTM)
                        : "n/a"}</td
                    ></tr
                  >

                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >EPS (ttm)</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{data?.getStockQuote?.eps}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >PE Ratio (ttm)</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{data?.getStockQuote?.pe}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >Forward PE</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{stockDeck?.forwardPE ?? "n/a"}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >Shares Out
                    </td>
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{data?.getStockQuote?.sharesOutstanding !== null
                        ? abbreviateNumber(
                            data?.getStockQuote?.sharesOutstanding,
                          )
                        : "n/a"}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >Short % of Shares Out</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{stockDeck?.shortOutStandingPercent !== null
                        ? stockDeck?.shortOutStandingPercent + "%"
                        : "n/a"}</td
                    ></tr
                  >
                </tbody>
              </table>
              <table
                class="w-[48%] text-sm text-white tiny:text-small lg:w-auto lg:min-w-[210px]"
                data-test="overview-quote"
              >
                <tbody
                  ><tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >Ask</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{$wsAskPrice !== 0 && $wsAskPrice !== null
                        ? $wsAskPrice
                        : (data?.getStockQuote?.ask ?? "-")}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >Volume</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{abbreviateNumber(data?.getStockQuote?.volume)}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >Open</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{data?.getStockQuote?.open?.toFixed(2)}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >Previous Close</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{data?.getStockQuote?.previousClose?.toFixed(2)}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >Day's Range</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{data?.getStockQuote?.dayLow?.toFixed(2)} - {data?.getStockQuote?.dayHigh?.toFixed(
                        2,
                      )}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >52-Week Range</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{data?.getStockQuote?.yearLow?.toFixed(2)} - {data?.getStockQuote?.yearHigh?.toFixed(
                        2,
                      )}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >Beta</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{stockDeck?.beta?.toFixed(2)}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >Shares Float
                    </td>
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{stockDeck?.floatShares !== null
                        ? abbreviateNumber(stockDeck?.floatShares)
                        : "n/a"}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2"
                      >Short % of Float</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-smaller font-semibold tiny:text-base xs:px-1 sm:py-2 sm:text-right sm:text-small"
                      >{stockDeck?.shortFloatPercent !== null
                        ? stockDeck?.shortFloatPercent + "%"
                        : "n/a"}</td
                    ></tr
                  >
                </tbody>
              </table>
            </div>
          </div>

          <!--End Graph-->

          <div
            class="mt-6 flex flex-col lg:flex-row gap-x-14 items-start w-full"
          >
            <div
              class="lg:space-y-6 lg:order-2 lg:pt-1 sm:pl-7 lg:pl-0 w-full lg:w-[45%] sm:ml-auto"
            >
              <Sidecard {data} />
              <div class="lg:sticky lg:top-20"></div>
            </div>

            <div class="w-full">
              <div
                class="w-full mt-10 sm:mt-0 m-auto sm:pl-6 sm:pb-6 {Object?.keys(
                  data?.getEarningsSurprise || {},
                )?.length !== 0
                  ? ''
                  : 'hidden'}"
              >
                <EarningsSurprise {data} />
              </div>

              <div
                class="w-full mt-10 sm:mt-0 m-auto sm:pl-6 sm:pb-6 {Object?.keys(
                  data?.getNextEarnings || {},
                )?.length !== 0
                  ? ''
                  : 'hidden'}"
              >
                <NextEarnings {data} />
              </div>

              <div
                class="w-full mt-10 sm:mt-0 m-auto sm:pl-6 sm:pb-6 {Object?.keys(
                  data?.getDividendAnnouncement || {},
                )?.length !== 0
                  ? ''
                  : 'hidden'}"
              >
                <DividendAnnouncement {data} />
              </div>

              <div
                class="w-full mt-10 sm:mt-0 m-auto sm:pl-6 sm:pb-6 {Object?.keys(
                  data?.getBullBearSay || {},
                )?.length !== 0
                  ? ''
                  : 'hidden'}"
              >
                <BullBearSay {data} />
              </div>

              <div
                class="w-full mt-10 sm:mt-0 m-auto sm:pl-6 sm:pb-6 {data
                  ?.getWhyPriceMoved?.length !== 0
                  ? ''
                  : 'hidden'}"
              >
                <WIIM {data} />
              </div>

              <div class="w-full mt-10 sm:mt-0 m-auto sm:pl-6 sm:pb-6 sm:pt-6">
                <News {data} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!--End-Indicator-Modal-->

<style lang="scss">
  canvas {
    width: 100%;
    height: 100%;
    max-width: 800px;
    max-height: 450px;
  }

  .pulse {
    position: relative;
    animation: pulse-animation 1s forwards cubic-bezier(0.5, 0, 0.5, 1);
  }

  @keyframes pulse-animation {
    0% {
      transform: scale(0.9);
      opacity: 1;
    }
    100% {
      transform: scale(0.9);
      opacity: 0;
    }
  }

  :root {
    --date-picker-background: #09090b;
    --date-picker-foreground: #f7f7f7;
  }
</style>
