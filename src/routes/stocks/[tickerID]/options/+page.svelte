<script lang="ts">
  import {
    numberOfUnreadNotification,
    displayCompanyName,
    screenWidth,
    stockTicker,
    setCache,
    getCache,
  } from "$lib/store";
  import DailyStats from "$lib/components/Options/DailyStats.svelte";
  import { Chart } from "svelte-echarts";
  import { abbreviateNumber } from "$lib/utils";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { onMount } from "svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import { init, use } from "echarts/core";
  import { BarChart, LineChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import Infobox from "$lib/components/Infobox.svelte";
  use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let data;
  let isLoaded = false;
  let activeEX = 0;
  let activeIdx = 0;
  let dailyStats = data?.getDailyStats;
  const getDailyTransactions = async (transactionId) => {
    let output;
    const cachedData = getCache(transactionId, "getDailyTransactions");
    if (cachedData) {
      output = cachedData;
    } else {
      const postData = {
        transactionId: transactionId,
      };

      // make the POST request to the endpoint
      const response = await fetch("/api/options-daily-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      output = await response.json();

      setCache(transactionId, output, "getDailyTransactions");
    }

    return output;
  };

  let rawPlotData = data?.getOptionsPlotData;
  let filteredList = [];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let optionsPlotData = data?.getOptionsPlotData?.plot;
  let displayData = "volume";
  let options;
  let optionsEX;

  let rawData = data?.getOptionsHistoricalData;
  let optionList = rawData?.slice(0, 30);
  let optionChainList = data?.getOptionsChainData?.at(0)?.chain || [];

  let totalVolume; //= data?.getOptionsPlotData?.totalVolume;

  let totalOpenInterest; //= data?.getOptionsPlotData?.totalOpenInterest;

  // Computing the put-call ratio for open interest
  let putCallOpenInterestRatio; //= data?.getOptionsPlotData?.putCallOpenInterestRatio;
  let putCallRatio;
  let displayTotalVolume; //= new Intl.NumberFormat("en", {minimumFractionDigits: 0, maximumFractionDigits: 0})?.format(totalVolume);
  let displayTotalOpenInterest; //= new Intl.NumberFormat("en", {minimumFractionDigits: 0, maximumFractionDigits: 0})?.format(totalOpenInterest);
  let displayTotalPutCall;
  let dateList; //= data?.getOptionsPlotData?.dateList;

  let callVolumeList; //= data?.getOptionsPlotData?.callVolumeList;
  let putVolumeList; //= data?.getOptionsPlotData?.putVolumeList;
  let callOpenInterestList; //= data?.getOptionsPlotData?.callOpenInterestList;
  let putOpenInterestList; //= data?.getOptionsPlotData?.putOpenInterestList;
  let iv60List;

  let displayTimePeriod = "threeMonths";

  function formatDate(dateStr) {
    // Parse the input date string (YYYY-mm-dd)
    var date = new Date(dateStr);

    // Get month, day, and year
    var month = date.getMonth() + 1; // Month starts from 0
    var day = date.getDate();
    var year = date.getFullYear();

    // Extract the last two digits of the year
    var shortYear = year.toString().slice(-2);

    // Add leading zeros if necessary
    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;

    var formattedDate = month + "/" + day + "/" + year;

    return formattedDate;
  }

  function formatTime(timeString) {
    // Split the time string into components
    const [hours, minutes, seconds] = timeString.split(":").map(Number);

    // Determine AM or PM
    const period = hours >= 12 ? "PM" : "AM";

    // Convert hours from 24-hour to 12-hour format
    const formattedHours = hours % 12 || 12; // Converts 0 to 12 for midnight

    // Format the time string
    const formattedTimeString = `${formattedHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${period}`;

    return formattedTimeString;
  }

  function changeTimePeriod(event) {
    displayTimePeriod = event.target.value;
  }

  function changeVolumeOI(event) {
    displayData = event.target.value;
  }

  function plotData(callData, putData, ivData) {
    const options = {
      animation: false,
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      silent: true,
      grid: {
        left: $screenWidth < 640 ? "5%" : "2%",
        right: $screenWidth < 640 ? "5%" : "2%",
        bottom: "20%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          data: dateList,
          axisLabel: {
            color: "#fff",

            formatter: function (value) {
              // Assuming dates are in the format 'yyyy-mm-dd'
              const dateParts = value.split("-");
              const monthIndex = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript Date objects
              const year = parseInt(dateParts[0]);
              const day = parseInt(dateParts[2]);
              return `${day} ${monthNames[monthIndex]} ${year}`;
            },
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          position: "right",
          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
      ],
      series: [
        {
          name: "Call",
          type: "bar",
          stack: "Put-Call Ratio",
          emphasis: {
            focus: "series",
          },
          data: callData,
          itemStyle: {
            color: "#00FC50",
          },
        },
        {
          name: "Put",
          type: "bar",
          stack: "Put-Call Ratio",
          emphasis: {
            focus: "series",
          },
          data: putData,
          itemStyle: {
            color: "#EE5365", //'#7A1C16'
          },
        },
        {
          name: "IV60", // Name for the line chart
          type: "line", // Type of the chart (line)
          yAxisIndex: 1, // Use the second y-axis on the right
          data: ivData, // iv60Data (assumed to be passed as ivData)
          itemStyle: {
            color: "#fff", // Choose a color for the line (gold in this case)
          },
          lineStyle: {
            width: 2, // Set the width of the line
          },
          smooth: true, // Optional: make the line smooth
          showSymbol: false,
        },
      ],
    };
    return options;
  }

  function getEXPlot(state) {
    let dates = [];
    let valueList = [];
    let priceList = [];

    data?.getOptionsGexData?.forEach((item) => {
      dates?.push(item?.date);
      valueList?.push(item[state]);
      priceList?.push(item?.close);
    });

    const option = {
      silent: true,
      animation: false,
      tooltip: {
        trigger: "axis",
        hideDelay: 100, // Set the delay in milliseconds
      },
      grid: {
        left: "0%",
        right: "0%",
        bottom: "0%",
        top: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
        axisLabel: {
          color: "#fff",
          formatter: function (value) {
            // Assuming dates are in the format 'yyyy-mm-dd'
            // Extract the month and day from the date string and convert the month to its abbreviated name
            const dateParts = value.split("-");
            const day = dateParts[2].substring(0); // Extracting the last two digits of the year
            const monthIndex = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript Date objects
            return `${day} ${monthNames[monthIndex]}`;
          },
        },
      },
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },

          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          position: "right",
          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
      ],
      series: [
        {
          name: "Price",
          data: priceList,
          type: "line",
          yAxisIndex: 0,
          itemStyle: {
            color: "#fff",
          },
          showSymbol: false,
        },
        {
          name: state?.toUpperCase(),
          data: valueList,
          type: "bar",
          yAxisIndex: 1,
          itemStyle: {
            color: "#8e53f4", // Change bar color to white
          },
        },
      ],
    };

    return option;
  }

  function filterDate(filteredList, displayTimePeriod) {
    const now = Date.now();
    let cutoffDate;

    switch (displayTimePeriod) {
      case "oneWeek":
        cutoffDate = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "oneMonth":
        cutoffDate = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case "threeMonths":
        cutoffDate = now - 90 * 24 * 60 * 60 * 1000;
        break;
      case "sixMonths":
        cutoffDate = now - 180 * 24 * 60 * 60 * 1000;
        break;
      case "oneYear":
        cutoffDate = now - 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        throw new Error("Invalid time period");
    }

    return filteredList?.filter((item) => {
      // Convert YYYY-MM-DD to a timestamp
      const [year, month, day] = item?.date?.split("-")?.map(Number);
      const itemTimestamp = new Date(year, month - 1, day)?.getTime();

      return itemTimestamp >= cutoffDate;
    });
  }

  function processPlotData(filteredList: any[]) {
    const totals = filteredList?.reduce(
      (acc, obj) => {
        acc.callVolume += obj?.CALL?.volume;
        acc.putVolume += obj?.PUT?.volume;
        acc.callOpenInterest += obj?.CALL?.open_interest;
        acc.putOpenInterest += obj?.PUT?.open_interest;
        return acc;
      },
      { callVolume: 0, putVolume: 0, callOpenInterest: 0, putOpenInterest: 0 },
    );

    putCallRatio = (totals.putVolume / totals.callVolume)?.toFixed(2);
    totalVolume = totals.callVolume + totals.putVolume;
    totalOpenInterest = totals.callOpenInterest + totals.putOpenInterest;
    putCallOpenInterestRatio = (
      totals.putOpenInterest / totals.callOpenInterest
    )?.toFixed(2);

    dateList = filteredList?.map((item) => item.date);
    callVolumeList = filteredList?.map((item) => item?.CALL?.volume);
    putVolumeList = filteredList?.map((item) => item?.PUT?.volume);
    iv60List = filteredList?.map((item) => item?.iv60);

    callOpenInterestList = filteredList?.map(
      (item) => item?.CALL?.open_interest,
    );
    putOpenInterestList = filteredList?.map((item) => item?.PUT?.open_interest);

    displayTotalVolume = new Intl.NumberFormat("en", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(totalVolume);
    displayTotalPutCall = new Intl.NumberFormat("en", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(putCallRatio);
    displayTotalOpenInterest = new Intl.NumberFormat("en", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(totalOpenInterest);

    // Determine the type of plot data to generate based on displayData
    if (displayData === "volume") {
      options = plotData(callVolumeList, putVolumeList, iv60List);
    } else if (displayData === "openInterest") {
      options = plotData(callOpenInterestList, putOpenInterestList, iv60List);
    }
  }

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && optionList?.length !== rawData?.length) {
      const nextIndex = optionList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 25);
      optionList = [...optionList, ...filteredNewResults];
    }
  }

  onMount(async () => {
    if (data?.getOptionsGexData?.length !== 0) {
      optionsEX = getEXPlot("gex");
    }

    if (data?.user?.tier === "Pro") {
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  });

  function daysLeft(targetDate) {
    const targetTime = new Date(targetDate).getTime();
    const currentTime = new Date().getTime();
    const difference = targetTime - currentTime;

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math?.ceil(difference / millisecondsPerDay);

    return daysLeft;
  }

  let optionHistoryList = [];

  let container;
  let rawDataHistory = [];

  function getScroll() {
    const scrollThreshold = container.scrollHeight * 0.8; // 80% of the container height

    // Check if the user has scrolled to the bottom based on the threshold
    const isBottom =
      container.scrollTop + container.clientHeight >= scrollThreshold;

    // Only load more data if at the bottom and there is still data to load
    if (isBottom && optionHistoryList?.length !== rawDataHistory?.length) {
      const nextIndex = optionHistoryList.length; // Ensure optionHistoryList is defined
      const filteredNewResults = rawDataHistory.slice(
        nextIndex,
        nextIndex + 25,
      ); // Ensure rawData is defined
      optionHistoryList = [...optionHistoryList, ...filteredNewResults];
    }
  }

  async function handleViewData(date: string) {
    isLoaded = false;
    optionDetailsDesktopModal?.showModal();

    rawDataHistory = await getDailyTransactions($stockTicker + "-" + date);

    rawDataHistory?.forEach((item) => {
      item.dte = daysLeft(item?.date_expiration);
    });

    optionHistoryList = rawDataHistory?.slice(0, 20);
    isLoaded = true;
  }

  function handleMode(i) {
    activeIdx = i;
  }

  const tabs = [
    {
      title: "Historical Data",
    },
    {
      title: "Chain Data",
    },
  ];

  function changeStatement(event) {
    optionChainList =
      data?.getOptionsChainData
        ?.filter((item) => item?.date_expiration === event.target.value)
        ?.at(0)?.chain || [];
  }

  const tabEX = [
    {
      title: "GEX",
    },
    {
      title: "DEX",
    },
  ];

  function handleEXMode(i) {
    activeEX = i;
    optionsEX = getEXPlot(activeEX === 0 ? "gex" : "dex");
  }

  $: {
    if (
      (displayTimePeriod || displayData) &&
      rawPlotData?.length !== 0 &&
      typeof window !== "undefined"
    ) {
      // Filter the raw plot data based on the selected time period
      filteredList = filterDate(rawPlotData, displayTimePeriod);

      // Process the filtered list to generate the plot data
      processPlotData(filteredList);
    }
  }
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) Options Activity · Stocknear
  </title>
  <meta
    name="description"
    content={`Detailed informaton of unusual options activity for ${$displayCompanyName} (${$stockTicker}).`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Options Activity · Stocknear`}
  />
  <meta
    property="og:description"
    content={`Detailed informaton of unusual options activity for ${$displayCompanyName} (${$stockTicker}).`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Options Activity · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Detailed informaton of unusual options activity for ${$displayCompanyName} (${$stockTicker}).`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section class="w-full bg-default overflow-hidden text-white min-h-screen">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
        {#if Object?.keys(dailyStats)?.length === 0 && rawPlotData?.length === 0}
          <Infobox text="No Options data available" />
        {/if}

        {#if Object?.keys(dailyStats)?.length > 0}
          <div class="w-full mb-10">
            <DailyStats rawData={dailyStats} />
          </div>
        {/if}

        {#if rawPlotData?.length > 0}
          <div
            class="mb-4 grid grid-cols-2 grid-rows-2 divide-gray-600 rounded-md border border-gray-600 md:grid-cols-4 md:grid-rows-1 md:divide-x"
          >
            <div class="p-4 bp:p-5 sm:p-6">
              <label
                for="totaVolume"
                class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem] w-fit"
              >
                Total Volume
                <InfoModal
                  title={"Total Volume"}
                  content={"The total volume is the combined number of puts and calls traded over the past three months in options trading."}
                  id={"totaVolume"}
                />
              </label>

              <div
                class="mt-1 break-words font-semibold leading-8 text-light text-lg"
              >
                {displayTotalVolume}
              </div>
            </div>
            <div class="p-4 bp:p-5 sm:p-6 border-l border-contrast md:border-0">
              <label
                for="totalOpenInterest"
                class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem] w-fit"
              >
                Total OI
                <InfoModal
                  title={"Total OI"}
                  content={"The total open interest reflects the aggregate number of outstanding options contracts in options trading."}
                  id={"totalOpenInterest"}
                />
              </label>
              <div
                class="mt-1 break-words font-semibold leading-8 text-light text-lg"
              >
                {displayTotalOpenInterest}
              </div>
            </div>
            <div class="p-4 bp:p-5 sm:p-6 border-t border-contrast md:border-0">
              <label
                for="putCallRatio"
                class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem] w-fit"
              >
                P/C Ratio
                <InfoModal
                  title={"P/C Ratio"}
                  content={"The put-call ratio assesses market sentiment and potential movements by comparing traded put options to call options."}
                  id={"putCallRatio"}
                />
              </label>
              <div
                class="mt-1 break-words font-semibold leading-8 text-light text-lg"
              >
                {putCallRatio !== "Infinity" ? putCallRatio : "> 1"}
              </div>
            </div>
            <div
              class="p-4 bp:p-5 sm:p-6 border-t border-contrast md:border-0 border-l border-contrast md:border-0"
            >
              <label
                for="openInteresteRatio"
                class="mr-1 cursor-pointer flex flex-row items-center text-white text-[1rem] w-fit"
              >
                OI P/C Ratio
                <InfoModal
                  title={"OI P/C Ratio"}
                  content={"The open interest put-call ratio measures market sentiment in options trading by comparing the total number of outstanding put options contracts to outstanding call options contracts. A higher ratio suggests bearish sentiment, while a lower ratio indicates bullish sentiment."}
                  id={"openInteresteRatio"}
                />
              </label>

              <div
                class="mt-1 break-words font-semibold leading-8 text-light text-lg"
              >
                {putCallOpenInterestRatio !== "Infinity"
                  ? putCallOpenInterestRatio
                  : "> 1"}
              </div>
            </div>
          </div>

          <div class="flex flex-row items-center w-full mt-10">
            <select
              class="ml-1 w-40 select select-bordered select-sm p-0 pl-5 bg-secondary"
              on:change={changeTimePeriod}
            >
              <option disabled>Choose a time period</option>
              <option value="oneWeek">1 Week</option>
              <option value="oneMonth" selected>1 Month</option>
              <option value="threeMonths" selected>3 Months</option>
              <option value="sixMonths">6 Months</option>
              <option value="oneYear">1 Year</option>
            </select>

            <select
              class="ml-auto sm:ml-3 w-40 select select-bordered select-sm p-0 pl-5 bg-secondary"
              on:change={changeVolumeOI}
            >
              <option disabled>Choose a category</option>
              <option value="volume" selected>Volume</option>
              <option value="openInterest">Open Interest</option>
            </select>
          </div>

          <div class="app w-full bg-default">
            {#if filteredList?.length !== 0}
              <Chart {init} {options} class="chart" />
            {:else}
              <span
                class="text-xl text-white m-auto flex justify-center items-center h-full"
              >
                <div
                  class="text-white text-sm sm:text-[1rem] sm:rounded-md h-auto border border-gray-600 p-4"
                >
                  <svg
                    class="w-5 h-5 inline-block sm:mr-2 flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    ><path
                      fill="#fff"
                      d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
                    /></svg
                  >
                  No Options activity found
                </div>
              </span>
            {/if}
          </div>

          {#if data?.getOptionsGexData?.length !== 0}
            <h3 class="text-2xl text-white font-bold mb-4 text-start">
              {activeEX === 0
                ? "Daily Gamma Exposure (GEX)"
                : "Daily Delta Exposure (DEX)"}
            </h3>

            <div
              class="bg-secondary w-fit relative flex flex-wrap items-center justify-center rounded-md p-1 mt-6 mb-6"
            >
              {#each tabEX as item, i}
                <button
                  on:click={() => handleEXMode(i)}
                  class="group relative z-[1] rounded-full px-6 py-1 {activeEX ===
                  i
                    ? 'z-0'
                    : ''} "
                >
                  {#if activeEX === i}
                    <div class="absolute inset-0 rounded-md bg-[#fff]"></div>
                  {/if}
                  <span
                    class="relative text-sm block font-semibold {activeEX === i
                      ? 'text-black'
                      : 'text-white'}"
                  >
                    {item.title}
                  </span>
                </button>
              {/each}
            </div>

            <div class="app w-full bg-default mb-24">
              <Chart {init} options={optionsEX} class="chart" />
            </div>
          {/if}

          {#if optionList?.length !== 0}
            <h3 class="text-2xl text-white font-bold mb-4 text-start">
              {activeIdx === 0 ? "Historical Option Data" : "Option Chain Data"}
            </h3>

            <div
              class="bg-secondary w-fit relative flex flex-wrap items-center justify-center rounded-md p-1 mt-6 mb-6"
            >
              {#each tabs as item, i}
                <button
                  on:click={() => handleMode(i)}
                  class="group relative z-[1] rounded-full px-6 py-1 {activeIdx ===
                  i
                    ? 'z-0'
                    : ''} "
                >
                  {#if activeIdx === i}
                    <div class="absolute inset-0 rounded-md bg-[#fff]"></div>
                  {/if}
                  <span
                    class="relative text-sm block font-semibold {activeIdx === i
                      ? 'text-black'
                      : 'text-white'}"
                  >
                    {item.title}
                  </span>
                </button>
              {/each}
            </div>

            {#if activeIdx === 1}
              <div class="relative mb-6">
                <select
                  class="w-48 select select-bordered select-sm p-0 pl-5 overflow-y-auto bg-secondary"
                  on:change={changeStatement}
                >
                  <option disabled>Choose an Expiration Date</option>
                  {#each data?.getOptionsChainData as item, index}
                    <option
                      value={item?.date_expiration}
                      selected={index === 0 ? true : false}
                    >
                      {new Date(item?.date_expiration)?.toLocaleString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          daySuffix: "2-digit",
                        },
                      )}
                    </option>
                  {/each}
                </select>
              </div>
            {/if}

            <div class="flex justify-start items-center m-auto overflow-x-auto">
              {#if activeIdx === 0}
                <table
                  class="w-full table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md m-auto mt-4 overflow-x-auto"
                >
                  <thead class="bg-default">
                    <tr class="">
                      <td class="text-white font-semibold text-sm text-start"
                        >Date</td
                      >
                      <td class="text-white font-semibold text-sm text-end"
                        >% Change</td
                      >
                      <td class="text-white font-semibold text-sm text-end"
                        >P/C</td
                      >
                      <td class="text-white font-semibold text-sm text-center"
                        >Bear/Bull</td
                      >
                      <td class="text-white font-semibold text-sm text-center"
                        >Bid/Ask Vol</td
                      >
                      <td class="text-white font-semibold text-sm text-end"
                        >% OTM</td
                      >
                      <td class="text-white font-semibold text-sm text-end"
                        >Total Volume</td
                      >
                      <td class="text-white font-semibold text-sm text-end"
                        >Total OI</td
                      >
                      <td class="text-white font-semibold text-sm text-end"
                        >Total Prem</td
                      >
                    </tr>
                  </thead>
                  <tbody>
                    {#each data?.user?.tier === "Pro" ? optionList : optionList?.slice(0, 3) as item, index}
                      <tr
                        on:click={() => handleViewData(item?.date)}
                        on:mouseover={() =>
                          getDailyTransactions($stockTicker + "+" + item?.date)}
                        class="cursor-pointer sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b border-gray-800 {index +
                          1 ===
                          optionList?.slice(0, 3)?.length &&
                        data?.user?.tier !== 'Pro'
                          ? 'opacity-[0.1]'
                          : ''}"
                      >
                        <td
                          class="text-white text-sm sm:text-[1rem] text-start"
                        >
                          {formatDate(item?.date)}
                        </td>

                        <td class="text-white text-sm sm:text-[1rem] text-end">
                          {#if item?.changesPercentage >= 0}
                            <span class="text-[#00FC50]"
                              >+{item?.changesPercentage >= 1000
                                ? abbreviateNumber(item?.changesPercentage)
                                : item?.changesPercentage?.toFixed(2)}%</span
                            >
                          {:else}
                            <span class="text-[#FF2F1F]"
                              >{item?.changesPercentage <= -1000
                                ? abbreviateNumber(item?.changesPercentage)
                                : item?.changesPercentage?.toFixed(2)}%
                            </span>
                          {/if}
                        </td>

                        <td class="text-sm sm:text-[1rem] text-end text-white">
                          {item?.c_vol !== 0
                            ? (item?.p_vol / item?.c_vol)?.toFixed(1)
                            : "-"}
                        </td>

                        <td
                          class="whitespace-nowrap text-sm sm:text-[1rem] text-center"
                        >
                          {#if item?.bear_ratio > (item?.neutral_ratio ?? 0) && item?.bear_ratio > (item?.bull_ratio ?? 0)}
                            <div
                              class="badge bg-[#FF2F1F] text-white font-semibold gap-2"
                            >
                              {item?.bear_ratio?.toFixed(0)}% Bearish
                            </div>
                          {:else if item?.bull_ratio > (item?.neutral_ratio ?? 0) && item?.bull_ratio > (item?.bear_ratio ?? 0)}
                            <div
                              class="badge bg-[#75D377] text-black font-semibold gap-2"
                            >
                              {item?.bull_ratio?.toFixed(0)}% Bullish
                            </div>
                          {:else if item?.neutral_ratio > (item?.bull_ratio ?? 0) && item?.neutral_ratio > (item?.bear_ratio ?? 0)}
                            <div
                              class="badge bg-[#fff] text-black font-semibold gap-2"
                            >
                              {item?.neutral_ratio?.toFixed(0)}% Neutral
                            </div>
                          {:else if item?.bear_ratio === item?.bull_ratio && item?.bear_ratio > (item?.neutral_ratio ?? 0)}
                            <div
                              class="badge bg-[#B8B8B8] text-black font-semibold gap-2"
                            >
                              {item?.bear_ratio?.toFixed(0)}% Bear/Bull Tie
                            </div>
                          {:else if item?.bear_ratio === item?.neutral_ratio && item?.bear_ratio > (item?.bull_ratio ?? 0)}
                            <div
                              class="badge bg-[#B8B8B8] text-black font-semibold gap-2"
                            >
                              {item?.bear_ratio?.toFixed(0)}% Bear/Neutral Tie
                            </div>
                          {:else if item?.bull_ratio === item?.neutral_ratio && item?.bull_ratio > (item?.bear_ratio ?? 0)}
                            <div
                              class="badge bg-[#B8B8B8] text-black font-semibold gap-2"
                            >
                              {item?.bull_ratio?.toFixed(0)}% Bull/Neutral Tie
                            </div>
                          {:else}
                            <div
                              class="badge bg-[#B8B8B8] text-black font-semibold gap-2"
                            >
                              Equal Distribution
                            </div>
                          {/if}
                        </td>

                        <td
                          class="whitespace-nowrap text-sm sm:text-[1rem] text-center"
                        >
                          {#if item?.bid_ratio > (item?.midpoint_ratio ?? 0) && item?.bid_ratio > (item?.ask_ratio ?? 0)}
                            <div
                              class="badge bg-[#FF2F1F] text-white font-semibold gap-2"
                            >
                              {item?.bid_ratio?.toFixed(0)}% Bid
                            </div>
                          {:else if item?.ask_ratio > (item?.midpoint_ratio ?? 0) && item?.ask_ratio > (item?.bid_ratio ?? 0)}
                            <div
                              class="badge bg-[#75D377] text-black font-semibold gap-2"
                            >
                              {item?.ask_ratio?.toFixed(0)}% Ask
                            </div>
                          {:else if item?.midpoint_ratio > (item?.ask_ratio ?? 0) && item?.midpoint_ratio > (item?.bid_ratio ?? 0)}
                            <div
                              class="badge bg-[#fff] text-black font-semibold gap-2"
                            >
                              {item?.midpoint_ratio?.toFixed(0)}% Midpoint
                            </div>
                          {:else if item?.bid_ratio === item?.ask_ratio && item?.bid_ratio > (item?.midpoint_ratio ?? 0)}
                            <div
                              class="badge bg-[#B8B8B8] text-black font-semibold gap-2"
                            >
                              {item?.bid_ratio?.toFixed(0)}% Bid/Ask Tie
                            </div>
                          {:else if item?.bid_ratio === item?.midpoint_ratio && item?.bid_ratio > (item?.ask_ratio ?? 0)}
                            <div
                              class="badge bg-[#B8B8B8] text-black font-semibold gap-2"
                            >
                              {item?.bid_ratio?.toFixed(0)}% Bid/Neutral Tie
                            </div>
                          {:else if item?.ask_ratio === item?.midpoint_ratio && item?.ask_ratio > (item?.bid_ratio ?? 0)}
                            <div
                              class="badge bg-[#B8B8B8] text-black font-semibold gap-2"
                            >
                              {item?.ask_ratio?.toFixed(0)}% Ask/Neutral Tie
                            </div>
                          {:else}
                            <div
                              class="badge bg-[#B8B8B8] text-black font-semibold gap-2"
                            >
                              Equal Distribution
                            </div>
                          {/if}
                        </td>

                        <td class="text-sm sm:text-[1rem] text-white text-end">
                          {item?.otm_ratio?.toFixed(0)}%
                        </td>

                        <td class="text-sm sm:text-[1rem] text-white text-end">
                          {@html abbreviateNumber(
                            item?.total_volume,
                            false,
                            true,
                          )}
                        </td>

                        <td class="text-sm sm:text-[1rem] text-end text-white">
                          {@html abbreviateNumber(item?.total_oi, false, true)}
                        </td>

                        <td class="text-sm sm:text-[1rem] text-end text-white">
                          {@html abbreviateNumber(
                            item?.total_bull_prem +
                              item?.total_bear_prem +
                              item?.total_neutral_prem,
                            false,
                            true,
                          )}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              {:else}
                <table
                  class="table table-pin-cols table-sm bg-table border border-gray-800 table-compact rounded-none sm:rounded-md w-full m-auto mt-4 overflow-x-auto"
                >
                  <thead class="bg-default">
                    <tr class="">
                      <td class="text-white font-semibold text-sm text-end"
                        >Call Prem</td
                      >
                      <td class="text-white font-semibold text-sm text-end"
                        >Call OI</td
                      >
                      <td class="text-white font-semibold text-sm text-end"
                        >Call Volume</td
                      >
                      <td class="text-white font-semibold text-sm text-center"
                        >Strike Price</td
                      >
                      <td class="text-white font-semibold text-sm text-start"
                        >Put Volume</td
                      >
                      <td class="text-white font-semibold text-sm text-start"
                        >Put OI</td
                      >
                      <td class="text-white font-semibold text-sm text-start"
                        >Put Prem</td
                      >
                    </tr>
                  </thead>
                  <tbody>
                    {#each data?.user?.tier === "Pro" ? optionChainList : optionChainList?.slice(0, 3) as item, index}
                      <tr
                        class="odd:bg-odd border-b border-gray-800 {index +
                          1 ===
                          optionChainList?.slice(0, 3)?.length &&
                        data?.user?.tier !== 'Pro'
                          ? 'opacity-[0.1]'
                          : ''}"
                      >
                        <td class="text-white text-sm sm:text-[1rem] text-end">
                          {@html abbreviateNumber(
                            item?.total_premium_call,
                            false,
                            true,
                          )}
                        </td>

                        <td class="text-sm sm:text-[1rem] text-end text-white">
                          {@html abbreviateNumber(
                            item?.total_open_interest_call,
                            false,
                            true,
                          )}
                        </td>

                        <td class="text-sm sm:text-[1rem] text-end text-white">
                          {@html abbreviateNumber(
                            item?.total_volume_call,
                            false,
                            true,
                          )}
                        </td>

                        <td
                          class="whitespace-nowrap text-sm sm:text-[1rem] {item?.put_call ===
                          'Calls'
                            ? 'text-[#00FC50]'
                            : 'text-[#FF2F1F]'} text-end"
                        >
                          <div
                            class="rounded-md w-fit px-2 text-center font-semibold badge gap-2 bg-[#fff] text-black m-auto flex justify-center items-center"
                          >
                            {item?.strike_price}
                          </div>
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] text-start text-white"
                        >
                          {@html abbreviateNumber(
                            item?.total_volume_put,
                            false,
                            true,
                          )}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] text-start text-white"
                        >
                          {@html abbreviateNumber(
                            item?.total_open_interest_put,
                            false,
                            true,
                          )}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] text-start"
                        >
                          {@html abbreviateNumber(
                            item?.total_premium_put,
                            false,
                            true,
                          )}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              {/if}
            </div>

            <UpgradeToPro {data} />
          {/if}
        {/if}
      </div>
    </div>
  </div>
</section>

<!--Start Options Detail Desktop Modal-->

<!-- Put this part before </body> tag -->

<dialog
  id="optionDetailsDesktopModal"
  class="modal modal-bottom sm:modal-middle cursor-pointer bg-[#fff] bg-opacity-[0.02]"
>
  <div
    class="modal-box w-full max-w-xl lg:max-w-3xl xl:max-w-5xl bg-[#141417] sm:bg-default border-t sm:border border-gray-600 h-auto"
  >
    <form method="dialog" class="modal-backdrop backdrop-blur-[4px]">
      <button
        class="cursor-pointer absolute right-0 top-0 text-[1.8rem] text-white"
      >
        <svg
          class="w-8 h-8"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          ><path
            fill="white"
            d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"
          />
        </svg>
      </button>
    </form>

    <p class="text-white mt-10 cursor-text">
      <span class="text-white text-xl font-semibold mb-4"
        >Option Data Details:</span
      >
      <br class="" />
      {#if optionHistoryList?.length !== 0}
        <div class="mt-3">
          {rawDataHistory?.length} individual contracts for {new Date(
            optionHistoryList?.at(0)?.date,
          )?.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            daySuffix: "2-digit",
          })}
        </div>
      {:else}
        <div class="mt-3">No data available.</div>
      {/if}
    </p>
    <div class="border-gray-600 border-b w-full mb-3 mt-5"></div>
    <div
      bind:this={container}
      on:scroll={getScroll}
      class="h-full max-h-[500px] overflow-y-scroll overflow-x-auto"
    >
      <div class="flex justify-start items-center m-auto">
        {#if isLoaded}
          <table
            class="table table-pin-cols table-sm bg-table border border-gray-800 table-compact rounded-none sm:rounded-md w-full m-auto mt-4 overflow-x-auto"
          >
            <thead class="bg-default">
              <tr class="">
                <td class="text-white font-semibold text-sm text-start">Time</td
                >
                <td class="text-white font-semibold text-sm text-start">Date</td
                >
                <td class="text-white font-semibold text-sm text-end">Expiry</td
                >
                <td class="text-white font-semibold text-sm text-end">Strike</td
                >
                <td class="text-white font-semibold text-sm text-end">C/P</td>
                <td class="text-white font-semibold text-sm text-start"
                  >Sent.</td
                >
                <td class="text-white font-semibold text-sm text-start"
                  >Exec.</td
                >
                <td class="text-white font-semibold text-sm text-end">Spot</td>
                <td class="text-white font-semibold text-sm text-end">Price</td>
                <td class="text-white font-semibold text-sm text-end">Prem.</td>
                <td class="text-white font-semibold text-sm text-start">Type</td
                >
                <td class="text-white font-semibold text-sm text-end">Vol.</td>
                <td class="text-white font-semibold text-sm text-end">OI</td>
              </tr>
            </thead>
            <tbody>
              {#each optionHistoryList as item}
                <!-- row -->
                <tr class="odd:bg-odd border-b border-gray-800">
                  <td class="text-white text-sm text-start whitespace-nowrap">
                    {formatTime(item?.time)}
                  </td>

                  <td class="text-white text-sm sm:text-[1rem] text-start">
                    {formatDate(item?.date)}
                  </td>

                  <td class="text-white text-sm sm:text-[1rem] text-end">
                    {item?.dte < 0 ? "expired" : item?.dte + "d"}
                  </td>

                  <td class="text-sm sm:text-[1rem] text-end text-white">
                    {item?.strike_price}
                  </td>

                  <td
                    class="text-sm sm:text-[1rem] {item?.put_call === 'Calls'
                      ? 'text-[#00FC50]'
                      : 'text-[#FF2F1F]'} text-start"
                  >
                    {item?.put_call}
                  </td>

                  <td
                    class="text-sm sm:text-[1rem] {item?.sentiment === 'Bullish'
                      ? 'text-[#00FC50]'
                      : item?.sentiment === 'Bearish'
                        ? 'text-[#FF2F1F]'
                        : 'text-[#C6A755]'} text-start"
                  >
                    {item?.sentiment}
                  </td>
                  <td
                    class="text-sm sm:text-[1rem] text-white text-start whitespace-nowrap"
                  >
                    {item?.execution_estimate}
                  </td>

                  <td class="text-sm sm:text-[1rem] text-end text-white">
                    {item?.underlying_price}
                  </td>

                  <td class="text-sm sm:text-[1rem] text-end text-white">
                    {item?.price}
                  </td>

                  <td class="text-sm sm:text-[1rem] text-end text-white">
                    {@html abbreviateNumber(item?.cost_basis, false, true)}
                  </td>

                  <td
                    class="text-sm sm:text-[1rem] text-start {item?.type ===
                    'Sweep'
                      ? 'text-[#C6A755]'
                      : 'text-[#976DB7]'}"
                  >
                    {item?.type}
                  </td>

                  <td class="text-white text-end text-sm sm:text-[1rem]">
                    {new Intl.NumberFormat("en", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(item?.volume)}
                  </td>

                  <td class="text-white text-end text-sm sm:text-[1rem]">
                    {new Intl.NumberFormat("en", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(item?.open_interest)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else}
          <div class="m-auto flex justify-center items-center h-80">
            <div class="relative">
              <label
                class="bg-[#272727] rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <span class="loading loading-spinner loading-md text-gray-400"
                ></span>
              </label>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<!--End Options Detial Desktop Modal-->

<style>
  .app {
    height: 400px;
    width: 100%;
  }

  @media (max-width: 560px) {
    .app {
      width: 100%;
      height: 300px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
