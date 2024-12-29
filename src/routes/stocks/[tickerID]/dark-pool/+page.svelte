<script lang="ts">
  import {
    numberOfUnreadNotification,
    displayCompanyName,
    stockTicker,
  } from "$lib/store";
  import { onMount } from "svelte";
  import { monthNames } from "$lib/utils";
  import DarkPool from "$lib/components/DarkPool.svelte";
  import DarkPoolLevel from "$lib/components/DarkPoolLevel.svelte";

  import InfoModal from "$lib/components/InfoModal.svelte";
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import Infobox from "$lib/components/Infobox.svelte";
  use([LineChart, BarChart, TooltipComponent, GridComponent, CanvasRenderer]);

  export let data;
  let isLoaded = false;
  let dateDistance;
  let rawData = data?.getStockDividend;
  let historicalDarkPool = data?.getHistoricalDarkPool || [];

  let optionsDividend;

  async function plotDividend() {
    // Combine the data into an array of objects to keep them linked
    const combinedData = rawData?.history?.map((item) => ({
      date: item?.paymentDate,
      dividend: item?.adjDividend?.toFixed(3),
    }));

    // Sort the combined data array based on the date
    combinedData.sort((a, b) => new Date(a?.date) - new Date(b?.date));

    // Separate the sorted data back into individual arrays
    const dates = combinedData.map((item) => item.date);
    const dividendList = combinedData?.map((item) => item.dividend);

    const options = {
      animation: false,
      grid: {
        left: "3%",
        right: "3%",
        bottom: "10%",
        top: "10%",
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
            const year = dateParts[0].substring(2); // Extracting the last two digits of the year
            const monthIndex = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript Date objects
            return `${monthNames[monthIndex]} '${year} `;
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
      ],
      series: [
        {
          name: "Dividend per Share",
          data: dividendList,
          type: "bar",
          smooth: true,
          itemStyle: {
            color: "#fff",
          },
        },
      ],
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
          const date = params[0].name; // Get the date from the x-axis value
          const dateParts = date.split("-");
          const year = dateParts[0];
          const monthIndex = parseInt(dateParts[1]) - 1;
          const day = dateParts[2];
          const formattedDate = `${monthNames[monthIndex]} ${day}, ${year}`;

          // Return the tooltip content
          return `${formattedDate}<br/> Dividend Per Share: ${params[0].value}`;
        },
      },
    };

    return options;
  }

  onMount(async () => {
    optionsDividend = await plotDividend();
    isLoaded = true;
  });
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) Dividend History, Dates & Yield ·
    stocknear
  </title>

  <meta
    name="description"
    content={`Get the latest dividend data for ${$displayCompanyName} (${$stockTicker}) stock price quote with breaking news, financials, statistics, charts and more.`}
  />
  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Dividend History, Dates & Yield · Stocknear`}
  />
  <meta
    property="og:description"
    content={`Get the latest dividend data for ${$displayCompanyName} (${$stockTicker}), including dividend history, yield, key dates, growth and other metrics.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Dividend History, Dates & Yield · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Get the latest dividend data for ${$displayCompanyName} (${$stockTicker}) stock price quote with breaking news, financials, statistics, charts and more.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section class="w-full bg-default overflow-hidden text-white h-full">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
        <div class="w-full mb-6">
          <h1 class="text-xl sm:text-2xl text-white font-bold mb-4 w-full">
            Dark Pool
          </h1>
        </div>

        <DarkPoolLevel />
        <DarkPool rawData={historicalDarkPool} />
        {#if rawData?.history?.length !== 0}
          <div
            class="flex flex-col sm:flex-row items-start sm:items-center w-full mt-14 mb-8"
          >
            <h3 class="text-xl text-white font-semibold">Dividends History</h3>
          </div>

          {#if isLoaded}
            {#if rawData?.history?.length !== 0 && optionsDividend}
              <div class="app w-full">
                <Chart {init} options={optionsDividend} class="chart" />
              </div>

              <div
                class="overflow-x-scroll no-scrollbar flex justify-start items-center w-full m-auto rounded-none sm:rounded-md mb-4"
              >
                <table
                  class="table table-sm table-compact flex justify-start items-center w-full m-auto"
                >
                  <thead>
                    <tr class="bg-default border-b border-gray-800">
                      <th
                        class="text-start bg-default text-white text-sm font-semibold"
                      >
                        Ex-Divid. Date
                      </th>
                      <th
                        class="text-end bg-default text-white text-sm font-semibold"
                      >
                        Cash Amount
                      </th>
                      <th
                        class="text-end bg-default text-white text-sm font-semibold"
                      >
                        Record Date
                      </th>
                      <th
                        class="text-end bg-default text-white text-sm font-semibold"
                      >
                        Pay Date
                      </th>
                    </tr>
                  </thead>
                  <tbody class="">
                    {#each rawData?.history as item}
                      <tr
                        class="text-white odd:bg-odd border-b border-gray-800"
                      >
                        <td
                          class="text-start text-sm sm:text-[1rem] whitespace-nowrap text-white font-medium"
                        >
                          {new Date(item?.date)?.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            daySuffix: "2-digit",
                          })}
                        </td>
                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {item?.adjDividend?.toFixed(3)}
                        </td>
                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {item?.recordDate?.length !== 0
                            ? new Date(item?.recordDate)?.toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  daySuffix: "2-digit",
                                },
                              )
                            : "n/a"}
                        </td>
                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {item?.paymentDate?.length !== 0
                            ? new Date(item?.paymentDate)?.toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  daySuffix: "2-digit",
                                },
                              )
                            : "n/a"}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
              <span class="text-white text-sm italic">
                * Dividend amounts are adjusted for stock splits when
                applicable.
              </span>
            {:else}
              <h1
                class="text-xl m-auto flex justify-center text-white mb-4 mt-10"
              >
                No history found
              </h1>
            {/if}
          {:else}
            <div class="flex justify-center items-center h-80">
              <div class="relative">
                <label
                  class="bg-secondary rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <span class="loading loading-spinner loading-md text-gray-400"
                  ></span>
                </label>
              </div>
            </div>
          {/if}
        {/if}
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
