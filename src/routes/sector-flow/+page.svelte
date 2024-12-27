<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import { abbreviateNumberWithColor, sectorNavigation } from "$lib/utils";
  import * as HoverCard from "$lib/components/shadcn/hover-card/index.js";
  import { Chart } from "svelte-echarts";

  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";

  use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let data;

  let rawData = data?.getData || [];
  let originalData = [...rawData]; // Unaltered copy of raw data

  let stockList = rawData?.slice(0, 50) ?? [];

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

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      originalData = [...rawData]; // Reset originalData to rawData
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

  function getPlotOptions() {
    const historyData = rawData?.at(1)?.premTickHistory;
    console.log(rawData?.at(1));
    const dates = historyData.map((item) => item.tape_time);
    const priceList = historyData.map((item) => item.close);
    const netCallPremList = historyData.map((item) => item.net_call_premium);
    const netPutPremList = historyData.map((item) => item.net_put_premium);
    const volumeList = historyData.map(
      (item) => item.net_call_volume + item.net_put_volume,
    );

    return {
      silent: true,
      animation: false,
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
      },
      axisPointer: {
        link: [{ xAxisIndex: [0, 1] }],
      },
      grid: [
        {
          left: "1%",
          right: "1%",
          top: "5%",
          height: "55%",
          containLabel: true,
        },
        {
          left: "1%",
          right: "1%",
          bottom: "5%",
          height: "28%",
          containLabel: true,
        },
      ],
      xAxis: [
        {
          type: "category",
          gridIndex: 0,
          data: dates,
          axisLabel: {
            color: "#fff",
            formatter: (value) => {
              const timePart = value.split(" ")[1];
              let [hours, minutes] = timePart.split(":").map(Number);
              hours = minutes > 30 ? hours + 1 : hours;
              const amPm = hours >= 12 ? "PM" : "AM";
              hours = hours % 12 || 12;
              return `${hours}:00 ${amPm}`;
            },
          },
        },
        {
          type: "category",
          gridIndex: 1,
          data: dates,
          axisLabel: {
            color: "#fff",
            formatter: (value) => {
              const timePart = value.split(" ")[1];
              let [hours, minutes] = timePart.split(":").map(Number);
              hours = minutes > 30 ? hours + 1 : hours;
              const amPm = hours >= 12 ? "PM" : "AM";
              hours = hours % 12 || 12;
              return `${hours}:00 ${amPm}`;
            },
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          gridIndex: 0,
          splitLine: { show: false },
          axisLabel: { show: true, color: "#fff" },
        },
        {
          type: "value",
          gridIndex: 0,
          position: "right",
          splitLine: { show: false },
          axisLabel: { show: true, color: "#fff" },
        },
        {
          type: "value",
          gridIndex: 1,
          splitLine: { show: false },
          axisLabel: { show: true, color: "#fff" },
        },
      ],
      series: [
        {
          name: "XLV",
          data: priceList,
          type: "line",
          xAxisIndex: 0,
          yAxisIndex: 0,
          itemStyle: { color: "#FFD700" },
          showSymbol: false,
        },
        {
          name: "Daily Put Premium",
          data: netPutPremList,
          type: "line",
          xAxisIndex: 0,
          yAxisIndex: 1,
          itemStyle: { color: "#FF4444" },
          showSymbol: false,
        },
        {
          name: "Daily Call Premium",
          data: netCallPremList,
          type: "line",
          xAxisIndex: 0,
          yAxisIndex: 1,
          itemStyle: { color: "#00FF9D" },
          showSymbol: false,
        },
        {
          name: "Volume",
          data: volumeList,
          type: "bar",
          xAxisIndex: 1,
          yAxisIndex: 2,
          itemStyle: { color: "#00FF9D" },
        },
      ],
    };
  }

  let optionsData = rawData ? getPlotOptions() : null;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Live
    Sector Flow · Stocknear
  </title>
  <meta
    name="description"
    content={`Track and compare historical and current options activity
              performances of sectors`}
  />

  <!-- Other meta tags -->
  <meta property="og:title" content={`Jim Carmer Tracker · Stocknear`} />
  <meta
    property="og:description"
    content={`Track and compare historical and current options activity
              performances of sectors`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`Jim Carmer Tracker · Stocknear`} />
  <meta
    name="twitter:description"
    content={`Track and compare historical and current options activity
              performances of sectors`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Sector Flow</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Sector Flow
            </h1>
            <p class="mb-3 px-1 text-base font-semibold text-muted sm:px-0">
              Track and compare historical and current options activity
              performances of sectors
            </p>
          </div>

          <div class="w-full m-auto mt-10">
            <div
              class="w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-scroll"
            >
              <table
                class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md text-white w-full bg-table border border-gray-800 m-auto"
              >
                <thead>
                  <TableHeader {columns} {sortOrders} {sortData} />
                </thead>
                <tbody>
                  {#each stockList as item, index}
                    <tr
                      class="sm:hover:bg-[#245073] border-b border-gray-800 sm:hover:bg-opacity-[0.2] odd:bg-odd {index +
                        1 ===
                        rawData?.length && data?.user?.tier !== 'Pro'
                        ? 'opacity-[0.1]'
                        : ''}"
                    >
                      <td
                        class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                      >
                        <HoverStockChart
                          symbol={item?.ticker}
                          assetType="etf"
                        />
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
                          item?.call_volume,
                          false,
                          true,
                        )}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        {@html abbreviateNumberWithColor(
                          item?.avg30_call_volume,
                          false,
                          true,
                        )}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        {@html abbreviateNumberWithColor(
                          item?.put_volume,
                          false,
                          true,
                        )}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        {@html abbreviateNumberWithColor(
                          item?.avg30_put_volume,
                          false,
                          true,
                        )}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        <HoverCard.Root>
                          <HoverCard.Trigger
                            class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
                          >
                            <div class="flex items-center justify-end">
                              <!-- Bar Container -->
                              <div
                                class="flex w-full max-w-28 h-5 bg-gray-200 rounded-md overflow-hidden"
                              >
                                <!-- Bearish -->
                                <div
                                  class="bg-red-500 h-full"
                                  style="width: calc(({item
                                    ?.premium_ratio[0]} / ({item
                                    ?.premium_ratio[0]} + {item
                                    ?.premium_ratio[1]} + {item
                                    ?.premium_ratio[2]})) * 100%)"
                                ></div>

                                <!-- Neutral -->
                                <div
                                  class="bg-gray-300 h-full"
                                  style="width: calc(({item
                                    ?.premium_ratio[1]} / ({item
                                    ?.premium_ratio[0]} + {item
                                    ?.premium_ratio[1]} + {item
                                    ?.premium_ratio[2]})) * 100%)"
                                ></div>

                                <!-- Bullish -->
                                <div
                                  class="bg-green-500 h-full"
                                  style="width: calc(({item
                                    ?.premium_ratio[2]} / ({item
                                    ?.premium_ratio[0]} + {item
                                    ?.premium_ratio[1]} + {item
                                    ?.premium_ratio[2]})) * 100%)"
                                ></div>
                              </div>
                            </div>
                          </HoverCard.Trigger>
                          <HoverCard.Content
                            class="w-auto bg-secondary border border-gray-600"
                          >
                            <div class="flex justify-between space-x-4">
                              <div
                                class="space-y-1 flex flex-col items-start text-white"
                              >
                                <div>
                                  Bearish: {@html abbreviateNumberWithColor(
                                    item?.premium_ratio[0],
                                    false,
                                    true,
                                  )}
                                </div>
                                <div>
                                  Neutral: {@html abbreviateNumberWithColor(
                                    item?.premium_ratio[1],
                                    false,
                                    true,
                                  )}
                                </div>
                                <div>
                                  Bullish: {@html abbreviateNumberWithColor(
                                    item?.premium_ratio[2],
                                    false,
                                    true,
                                  )}
                                </div>
                              </div>
                            </div>
                          </HoverCard.Content>
                        </HoverCard.Root>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            <UpgradeToPro {data} />

            {#if data?.user?.tier === "Pro" && optionsData !== null}
              <div class="pb-8 sm:pb-2 rounded-md bg-default">
                <div class="app w-full h-[300px] mt-5">
                  <Chart {init} options={optionsData} class="chart" />
                </div>
              </div>
            {/if}
          </div>
        </main>
      </div>
    </div>
  </div>
</section>

<style>
  .app {
    height: 800px;
    max-width: 100%; /* Ensure chart width doesn't exceed the container */
  }

  @media (max-width: 640px) {
    .app {
      height: 210px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
