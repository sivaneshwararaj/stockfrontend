<script lang="ts">
  import { abbreviateNumberWithColor, monthNames } from "$lib/utils";
  import { screenWidth } from "$lib/store";

  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import { onMount } from "svelte";
  import { init, use } from "echarts/core";
  import { BarChart, LineChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import { Chart } from "svelte-echarts";

  use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let data;

  const currentTime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
  )?.getTime();

  let rawData = data?.getData?.map((item) => ({
    ...item,
    dte: daysLeft(item?.expiry),
  }));

  let displayList = rawData?.slice(0, 150) || [];

  let options = plotData();

  function daysLeft(targetDate) {
    const targetTime = new Date(targetDate).getTime();
    const difference = targetTime - currentTime;

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math?.ceil(difference / millisecondsPerDay);

    return daysLeft + "D";
  }

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

  function plotData() {
    let dates = [];
    let callData = [];
    let putData = [];
    let priceList = [];
    let totalPremiums = [];

    // Sort history by date
    const history = rawData?.sort(
      (a, b) => new Date(a?.date) - new Date(b?.date),
    );

    // Map to aggregate call size, put size, and premiums for each date
    const aggregatedData = {};

    history?.forEach((item) => {
      const { date, optionType, size, premium } = item;

      // Initialize the date in aggregatedData if it doesn't exist
      if (!aggregatedData[date]) {
        aggregatedData[date] = { callSize: 0, putSize: 0, totalPremium: 0 };
      }

      // Aggregate call size, put size, and premium
      if (optionType === "Call") {
        aggregatedData[date].callSize += size;
      } else if (optionType === "Put") {
        aggregatedData[date].putSize += size;
      }

      // Add premium
      aggregatedData[date].totalPremium += premium;
    });

    // Extract dates, call data, put data, premiums, and price list
    dates = Object.keys(aggregatedData);
    callData = dates.map((date) => aggregatedData[date].callSize);
    putData = dates.map((date) => aggregatedData[date].putSize);
    totalPremiums = dates.map((date) => aggregatedData[date].totalPremium);

    // Match historical prices for the same dates
    priceList = dates.map((date) => {
      const matchingData = data?.getHistoricalPrice?.find(
        (d) => d?.time === date,
      );
      return matchingData?.close || null; // Use `null` if no match is found
    });

    const options = {
      animation: false,
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
        borderColor: "#969696", // Black border color
        borderWidth: 1, // Border width of 1px
        backgroundColor: "#313131", // Optional: Set background color for contrast
        textStyle: {
          color: "#fff", // Optional: Text color for better visibility
        },
        formatter: function (params) {
          // Get the timestamp from the first parameter
          const timestamp = params[0].axisValue;

          // Initialize result with timestamp
          let result = timestamp + "<br/>";

          // Add each series data
          params?.forEach((param) => {
            const marker =
              '<span style="display:inline-block;margin-right:4px;' +
              "border-radius:10px;width:10px;height:10px;background-color:" +
              param.color +
              '"></span>';
            result +=
              marker +
              param.seriesName +
              ": " +
              abbreviateNumberWithColor(param.value, false, true) +
              "<br/>";
          });

          return result;
        },
        axisPointer: {
          lineStyle: {
            color: "#fff",
          },
        },
      },
      silent: true,
      grid: {
        left: $screenWidth < 640 ? "5%" : "2%",
        right: $screenWidth < 640 ? "5%" : "2%",
        bottom: "10%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          data: dates,
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
          name: "Price", // Name for the line chart
          type: "line", // Type of the chart (line)
          yAxisIndex: 1, // Use the second y-axis on the right
          data: priceList, // iv60Data (assumed to be passed as priceList)
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

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && displayList?.length !== rawData?.length) {
      const nextIndex = displayList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      displayList = [...displayList, ...filteredNewResults];
    }
  }
  onMount(async () => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: columns = [
    { key: "date", label: "Date", align: "left" },
    { key: "dte", label: "DTE", align: "right" },
    { key: "optionType", label: "P/C", align: "right" },
    { key: "unusualType", label: "Type", align: "right" },
    { key: "sentiment", label: "Sent.", align: "right" },
    { key: "size", label: "Size", align: "right" },
    { key: "strike", label: "Strike", align: "right" },
    { key: "avgPrice", label: "Avg Price Paid", align: "right" },
    { key: "price", label: "Spot", align: "right" },
    { key: "premium", label: "Prem", align: "right" },
  ];

  $: sortOrders = {
    date: { order: "none", type: "date" },
    optionType: { order: "none", type: "string" },
    unusualType: { order: "none", type: "string" },
    dte: { order: "none", type: "number" },
    sentiment: { order: "none", type: "string" },
    size: { order: "none", type: "number" },
    strike: { order: "none", type: "number" },
    avgPrice: { order: "none", type: "number" },
    price: { order: "none", type: "number" },
    premium: { order: "none", type: "number" },
  };

  const sortData = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];
    let originalData = rawData;
    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      displayList = [...originalData]?.slice(0, 150); // Reset originalData to rawData
      return;
    }

    // Define a generic comparison function
    const compareValues = (a, b) => {
      const { type } = sortOrders[key];
      let valueA, valueB;

      switch (type) {
        case "date":
          valueA = new Date(a[key]);
          valueB = new Date(b[key]);
          break;
        case "string":
          valueA = a[key].toUpperCase();
          valueB = b[key].toUpperCase();
          return sortOrder === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        case "number":
        default:
          valueA = parseFloat(a[key]);
          valueB = parseFloat(b[key]);
          break;
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    };

    // Sort using the generic comparison function
    displayList = [...originalData].sort(compareValues)?.slice(0, 150);
  };
</script>

<section
  class="w-full bg-default overflow-hidden text-white min-h-screen pb-40"
>
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
        <h2
          class=" flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit mb-2 sm:mb-0"
        >
          Unusual Activity
        </h2>
        <Infobox
          text="Options trades with a premium of at least $1 million that are still active and unexpired."
        />

        <div class="app w-full">
          <Chart {init} {options} class="chart" />
        </div>
        <div class="w-full overflow-x-scroll text-white">
          <table
            class="w-full table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md m-auto mt-4 overflow-x-auto"
          >
            <thead>
              <TableHeader {columns} {sortOrders} {sortData} />
            </thead>
            <tbody>
              {#each data?.user?.tier !== "Pro" ? displayList?.slice(0, 3) : displayList as item, index}
                <tr
                  class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b border-gray-800 {index +
                    1 ===
                    rawData?.slice(0, 3)?.length && data?.user?.tier !== 'Pro'
                    ? 'opacity-[0.1]'
                    : ''}"
                >
                  <td
                    class="text-white text-sm sm:text-[1rem] text-start whitespace-nowrap"
                  >
                    {formatDate(item?.date)}
                  </td>

                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.dte}
                  </td>
                  <td
                    class=" text-sm sm:text-[1rem] text-end whitespace-nowrap {item?.optionType ===
                    'Call'
                      ? 'text-[#00FC50]'
                      : item?.optionType === 'Put'
                        ? 'text-[#FF2F1F]'
                        : 'text-white'} "
                  >
                    {item?.optionType}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.unusualType}
                  </td>
                  <td
                    class="text-sm sm:text-[1rem] text-end whitespace-nowrap {item?.sentiment ===
                    'Bullish'
                      ? 'text-[#00FC50]'
                      : item?.sentiment === 'Bearish'
                        ? 'text-[#FF2F1F]'
                        : 'text-[#C8A32D]'} "
                  >
                    {item?.sentiment}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.size?.toLocaleString("en-US")}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.strike}
                  </td>

                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.avgPrice}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.price}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {@html abbreviateNumberWithColor(
                      item?.premium,
                      false,
                      true,
                    )}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <UpgradeToPro {data} />
      </div>
    </div>
  </div>
</section>

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
