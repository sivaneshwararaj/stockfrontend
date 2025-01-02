<script lang="ts">
  import { numberOfUnreadNotification, screenWidth } from "$lib/store";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";

  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import {
    abbreviateNumberWithColor,
    sectorList,
    sectorNavigation,
  } from "$lib/utils";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";

  import * as HoverCard from "$lib/components/shadcn/hover-card/index.js";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";

  import { Chart } from "svelte-echarts";

  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";

  use([
    LineChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer,
  ]);

  export let data;
  let isLoading = false;
  let optionsData = null;
  let sectorData = data?.getData?.sectorData || [];
  let topSectorTickers = data?.getData?.topSectorTickers || {};
  let marketTideData = data?.getData?.marketTide || [];
  let selectedSector = "SPY";
  let originalData = [...sectorData]; // Unaltered copy of raw data

  let stockList = sectorData ?? [];

  let originalTopTickers = [...topSectorTickers[selectedSector]];
  let displayTopTickers = topSectorTickers[selectedSector];

  $: columns = [
    { key: "ticker", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "price", label: "Price", align: "right" },
    { key: "changesPercentage", label: "% Change", align: "right" },
    { key: "call_volume", label: "Call Vol", align: "right" },
    { key: "avg30_call_volume", label: "Avg Call Vol", align: "right" },
    { key: "put_volume", label: "Put Vol", align: "right" },
    { key: "avg30_put_volume", label: "Avg Put Vol", align: "right" },
    { key: "premium_ratio", label: "🐻/🐂 Prem", align: "right" },
  ];

  $: sortOrders = {
    rank: { order: "none", type: "number" },
    date: { order: "none", type: "date" },
    ticker: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    price: { order: "none", type: "number" },
    changesPercentage: { order: "none", type: "number" },
    call_volume: { order: "none", type: "number" },
    put_volume: { order: "none", type: "number" },
    premium_ratio: { order: "none", type: "number" },
    avg30_call_volume: { order: "none", type: "string" },
    avg30_put_volume: { order: "none", type: "number" },
    netPremium: { order: "none", type: "number" },
    netCallPremium: { order: "none", type: "number" },
    netPutPremium: { order: "none", type: "number" },
    gexRatio: { order: "none", type: "number" },
    gexNetChange: { order: "none", type: "number" },
    ivRank: { order: "none", type: "number" },
  };

  $: topColumns = [
    { key: "rank", label: "Rank", align: "left" },
    { key: "ticker", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "price", label: "Price", align: "right" },
    { key: "changesPercentage", label: "% Change", align: "right" },
    { key: "netPremium", label: "Net Prem", align: "right" },
    { key: "netCallPremium", label: "Net Call Prem", align: "right" },
    { key: "netPutPremium", label: "Net Put Prem", align: "right" },
    { key: "gexRatio", label: "Gex Ratio", align: "right" },
    { key: "gexNetChange", label: "Gex Change", align: "right" },
    { key: "ivRank", label: "IV Rank", align: "right" },
  ];

  const sortData = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      originalData = [...sectorData]; // Reset originalData to sectorData
      stockList = originalData?.slice(0, 50); // Reset displayed data
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
    stockList = [...originalData].sort(compareValues)?.slice(0, 50);
  };

  const sortTopTickers = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      originalTopTickers = [...topSectorTickers[selectedSector]]; // Reset originalTopTickers to sectorData
      displayTopTickers = originalTopTickers;
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
    displayTopTickers = [...originalTopTickers]
      .sort(compareValues)
      ?.slice(0, 50);
  };

  function getPlotOptions() {
    isLoading = true;
    let dates = marketTideData?.map((item) => item?.timestamp);
    const priceList = marketTideData?.map((item) => item?.close);
    const netCallPremList = marketTideData?.map(
      (item) => item?.net_call_premium,
    );
    const netPutPremList = marketTideData?.map((item) => item?.net_put_premium);
    const volumeList = marketTideData?.map((item) => item?.net_volume);

    const positiveVolume = volumeList.map((v) => (v >= 0 ? v : "-"));
    const negativeVolume = volumeList.map((v) => (v < 0 ? v : "-"));

    const options = {
      silent: true,
      animation: false,
      backgroundColor: "#18181D",
      legend: {
        data: ["Price", "Vol", "Net Call Premium", "Net Put Premium"],
        textStyle: {
          color: "#fff",
        },
        axisPointer: {
          lineStyle: {
            color: "#fff",
          },
        },
      },

      tooltip: {
        trigger: "axis",
        hideDelay: 100,
        borderColor: "#969696",
        borderWidth: 1,
        backgroundColor: "#313131",
        textStyle: {
          color: "#fff",
        },
        formatter: function (params) {
          const timestamp = params[0].axisValue;
          let result = timestamp + "<br/>";

          // Find volume value and determine color
          const volParams = params.find((p) => p.seriesName.includes("Vol"));
          const volIndex = volParams?.dataIndex ?? 0;
          const volValue = volumeList[volIndex];
          const volColor = volValue >= 0 ? "#90EE90" : "#FF6B6B";

          // Sort and filter params
          const filteredParams = params
            .filter(
              (p) =>
                !p.seriesName.includes("Vol") ||
                p.seriesName === "Positive Vol",
            )
            .map((p) => {
              if (p.seriesName.includes("Vol")) {
                return {
                  ...p,
                  seriesName: "Vol",
                  value: volValue,
                  color: volColor,
                };
              }
              return p;
            })
            .sort((a, b) => {
              if (a.seriesName === "Vol") return 1;
              if (b.seriesName === "Vol") return -1;
              return 0;
            });

          filteredParams.forEach((param) => {
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
      axisPointer: {
        link: [{ xAxisIndex: [0, 1] }],
      },
      grid: [
        {
          left: "3%",
          right: "3%",
          top: $screenWidth < 640 ? "15%" : "5%",
          height: "60%",
          containLabel: true,
        },
        {
          left: "3%",
          right: "3%",
          bottom: "5%",
          height: "20%",
          containLabel: true,
        },
      ],

      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: dates,
          axisLabel: {
            color: "#fff",
            formatter: (value, index) => {
              const [datePart, timePart] = value.split(" ");
              let [hours, minutes] = timePart.split(":").map(Number);

              // Only show labels at 30-minute intervals (XX:00 and XX:30)
              if (minutes % 30 === 0) {
                const amPm = hours >= 12 ? "PM" : "AM";
                hours = hours % 12 || 12;
                return minutes === 0
                  ? `${hours} ${amPm}`
                  : `${hours}:30 ${amPm}`;
              }
              return "";
            },
            interval: 29, // Show label every 30 minutes (29 intervals between)
          },
        },

        {
          type: "category",
          gridIndex: 1,
          data: dates,
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          gridIndex: 0,
          position: "left",
          splitLine: {
            show: false,
          },
          axisLabel: {
            color: "#fff",
            show: true,
          },
          scale: true,
          min: (value) => Math.floor(value.min * 0.999),
          max: (value) => Math.ceil(value.max * 1.001),
        },
        {
          type: "value",
          gridIndex: 0,
          position: "right",
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
        {
          type: "value",
          gridIndex: 1,
          position: "right",
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: "Price",
          type: "line",
          data: priceList,
          yAxisIndex: 0,
          xAxisIndex: 0,
          showSymbol: false,
          lineStyle: { color: "#fff" },
          itemStyle: { color: "#fff" },
          smooth: true,
        },
        {
          name: "Net Call Premium",
          type: "line",
          data: netCallPremList,
          yAxisIndex: 1,
          xAxisIndex: 0,
          showSymbol: false,
          lineStyle: { color: "#90EE90" },
          itemStyle: { color: "#90EE90" },
          smooth: true,
        },
        {
          name: "Net Put Premium",
          type: "line",
          data: netPutPremList,
          yAxisIndex: 1,
          xAxisIndex: 0,
          showSymbol: false,
          lineStyle: { color: "#FF6B6B" },
          itemStyle: { color: "#FF6B6B" },
          smooth: true,
        },
        {
          name: "Positive Vol",
          type: "line",
          data: positiveVolume,
          xAxisIndex: 1,
          yAxisIndex: 2,
          showSymbol: false,
          areaStyle: {
            opacity: 1,
            color: "#19AA75",
          },
          itemStyle: { color: "#19AA75" },
        },
        {
          name: "Negative Vol",
          type: "line",
          data: negativeVolume,
          xAxisIndex: 1,
          yAxisIndex: 2,
          showSymbol: false,
          areaStyle: {
            opacity: 1,
            color: "#F71F4F",
          },
          itemStyle: { color: "#F71F4F" },
        },
      ],
    };
    isLoading = false;
    return options;
  }
  optionsData = marketTideData ? getPlotOptions() : null;

  $: {
    if (selectedSector) {
      originalTopTickers = [...topSectorTickers[selectedSector]];
      displayTopTickers = topSectorTickers[selectedSector];
    }
  }
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Live
    Market Flow · Stocknear
  </title>
  <meta
    name="description"
    content={`Track and compare historical and current options activity
              performances of the market & sectors`}
  />

  <!-- Other meta tags -->
  <meta property="og:title" content={`Live Market Flow · Stocknear`} />
  <meta
    property="og:description"
    content={`Track and compare historical and current options activity`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`Live Market Flow · Stocknear`} />
  <meta
    name="twitter:description"
    content={`              performances of the market & sectors`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden">
  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="w-full m-auto">
            {#if optionsData !== null && data?.user?.tier === "Pro"}
              <div class="flex flex-row items-center mb-3">
                <label
                  for="marketTideInfo"
                  class="mr-1 cursor-pointer flex flex-row items-center text-white text-2xl font-bold"
                >
                  Market Tide
                </label>
                <InfoModal
                  title={"Market Tide"}
                  content={"Market Tide evaluates the balance between advancing and declining stocks by analyzing SPY price movements, net call premiums, and net put premiums, providing a real-time snapshot of market sentiment and momentum. <a href='/learning-center/market-tide' class='text-blue-400 sm:hover:text-white sm:hover:underline sm:hover:underline-offset-4'>Learn more</a>"}
                  id={"marketTideInfo"}
                />
              </div>
              <div
                class="pb-8 sm:pb-2 rounded-md bg-table border border-gray-800"
              >
                <div class="app w-full h-[300px] mt-5">
                  {#if isLoading}
                    <div class="flex justify-center items-center h-80">
                      <div class="relative">
                        <label
                          class="bg-secondary rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        >
                          <span
                            class="loading loading-spinner loading-md text-white"
                          ></span>
                        </label>
                      </div>
                    </div>
                  {:else}
                    <Chart {init} options={optionsData} class="chart" />
                  {/if}
                </div>
              </div>
            {/if}
            {#if data?.user?.tier === "Pro"}
              <div class="w-full m-auto mt-10">
                <div
                  class="flex flex-wrap sm:flex-row items-center sm:justify-between mb-4"
                >
                  <div class="flex flex-row items-center">
                    <label
                      for="topSectorTickers"
                      class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-2xl font-bold"
                    >
                      Top SPY Stocks by Net Premium
                    </label>
                    <InfoModal
                      title={"Top Sector Stocks by Net Premium"}
                      content={"This list highlights top stocks in each sector based on net premium, displaying price changes and options activity. Discover which stocks are driving the sector and explore detailed options data."}
                      id={"topSectorTickers"}
                    />
                  </div>
                </div>

                <div
                  class="w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-scroll"
                >
                  <table
                    class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md text-white w-full bg-table border border-gray-800 m-auto"
                  >
                    <thead>
                      <TableHeader
                        columns={topColumns}
                        {sortOrders}
                        sortData={sortTopTickers}
                      />
                    </thead>
                    <tbody>
                      {#each displayTopTickers as item, index}
                        <tr
                          class="sm:hover:bg-[#245073] border-b border-gray-800 sm:hover:bg-opacity-[0.2] odd:bg-odd {index +
                            1 ===
                            sectorData?.length && data?.user?.tier !== 'Pro'
                            ? 'opacity-[0.1]'
                            : ''}"
                        >
                          <td
                            class="text-start text-sm sm:text-[1rem] whitespace-nowrap text-white"
                          >
                            {item?.rank}
                          </td>

                          <td
                            class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                          >
                            <HoverStockChart symbol={item?.ticker} />
                          </td>

                          <td
                            class="text-start text-sm sm:text-[1rem] whitespace-nowrap text-white"
                          >
                            <a
                              href={sectorNavigation?.find(
                                (listItem) => listItem?.title === item?.name,
                              )?.link}
                              class="sm:hover:underline sm:hover:underline-offset-4 text-white"
                            >
                              {item?.name}
                            </a>
                          </td>

                          <td
                            class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                          >
                            {item?.price}
                          </td>

                          <td
                            class="text-sm sm:text-[1rem] {item?.changesPercentage >=
                            0
                              ? "text-[#00FC50] before:content-['+'] "
                              : 'text-[#FF2F1F]'} text-end"
                          >
                            {item?.changesPercentage}%
                          </td>

                          <td class="text-sm sm:text-[1rem] text-end">
                            {@html abbreviateNumberWithColor(
                              item?.netPremium,
                              false,
                              true,
                            )}
                          </td>
                          <td class="text-sm sm:text-[1rem] text-end">
                            {@html abbreviateNumberWithColor(
                              item?.netCallPremium,
                              false,
                              true,
                            )}
                          </td>
                          <td class="text-sm sm:text-[1rem] text-end">
                            {@html abbreviateNumberWithColor(
                              item?.netPutPremium,
                              false,
                              true,
                            )}
                          </td>

                          <td class="text-sm sm:text-[1rem] text-end">
                            {item?.gexRatio}
                          </td>
                          <td class="text-sm sm:text-[1rem] text-end">
                            {@html abbreviateNumberWithColor(
                              item?.gexNetChange,
                              false,
                              true,
                            )}
                          </td>
                          <td class="text-sm sm:text-[1rem] text-end">
                            {item?.ivRank}
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              </div>
            {/if}

            <UpgradeToPro {data} />
          </div>
        </main>
      </div>
    </div>
  </div>
</section>

<style>
  .app {
    height: 600px;
    max-width: 100%; /* Ensure chart width doesn't exceed the container */
  }

  @media (max-width: 640px) {
    .app {
      height: 510px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
