<script lang="ts">
  import { analystEstimateComponent, stockTicker } from "$lib/store";

  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { LineChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import { abbreviateNumber } from "$lib/utils";

  export let data;
  use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

  let analystEstimateList = [];
  let isLoaded = false;

  let xData = [];
  let optionsRevenue = null;
  let optionsEPS = null;
  let revenueDateList = [];
  let avgRevenueList = [];
  let lowRevenueList = [];
  let highRevenueList = [];
  let epsDateList = [];
  let avgEPSList = [];
  let lowEPSList = [];
  let highEPSList = [];

  let displayData = "Revenue";

  function findIndex(data) {
    const currentYear = new Date().getFullYear();

    // Find the index where the item's date is greater than or equal to the current year and revenue is null
    const index = data.findIndex(
      (item) => item.date > currentYear && item.revenue === null,
    );

    // Check if there is any item for the current year with non-null revenue
    const hasNonNullRevenue = data.some(
      (item) => item.date === currentYear && item.revenue !== null,
    );

    // Add +1 to the index if the condition is met
    return index !== -1 && hasNonNullRevenue ? index + 1 : index;
  }

  let tableActualRevenue = [];
  let tableActualEPS = [];

  let tableForecastRevenue = [];
  let tableForecastEPS = [];

  function getPlotOptions(dataType: string) {
    let dates = [];
    let valueList = [];
    let avgList = [];
    let lowList = [];
    let highList = [];

    let filteredData =
      analystEstimateList?.filter((item) => item.date >= 2019) ?? [];
    const stopIndex = findIndex(filteredData);

    if (filteredData) {
      filteredData.forEach((item, index) => {
        const date = item.date?.toString().slice(-2);
        const isAfterStartIndex = stopIndex <= index + 1;
        dates.push(`FY${date}`);
        switch (dataType) {
          case "Revenue":
            valueList.push(item.revenue);
            avgList.push(isAfterStartIndex ? item.estimatedRevenueAvg : null);
            lowList.push(isAfterStartIndex ? item.estimatedRevenueLow : null);
            highList.push(isAfterStartIndex ? item.estimatedRevenueHigh : null);
            break;
          case "EPS":
            valueList.push(item.eps);
            avgList.push(isAfterStartIndex ? item.estimatedEpsAvg : null);
            lowList.push(isAfterStartIndex ? item.estimatedEpsLow : null);
            highList.push(isAfterStartIndex ? item.estimatedEpsHigh : null);
            break;
          default:
            break;
        }
      });
    }

    try {
      const lastValue = valueList[stopIndex - 2];
      avgList[stopIndex - 2] = lastValue;
      lowList[stopIndex - 2] = lastValue;
      highList[stopIndex - 2] = lastValue;
    } catch (e) {
      console.log(e);
    }

    // Normalize the data if needed (not required in this case, but leaving it here for reference)

    const option = {
      silent: true,
      tooltip: {
        trigger: "axis",
        hideDelay: 100, // Set the delay in milliseconds
      },
      animation: false,
      grid: {
        left: "2%",
        right: "2%",
        bottom: "2%",
        top: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
        axisLabel: {
          color: "#fff",
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
          name: "Actual",
          data: valueList,
          type: "line",
          itemStyle: {
            color: "#fff", // Change line plot color to white
          },
          showSymbol: false, // Show symbols for line plot points
        },
        {
          name: "Avg",
          data: avgList,
          type: "line",
          itemStyle: {
            color: "#fff", // Change line plot color to green
          },
          lineStyle: {
            type: "dashed", // Set the line type to dashed
          },
          showSymbol: false, // Show symbols for line plot points
        },
        {
          name: "Low",
          data: lowList,
          type: "line",
          itemStyle: {
            color: "#3CB2EF", // Change line plot color to green
          },
          lineStyle: {
            type: "dashed", // Set the line type to dashed
            color: "#c2c7cf",
          },

          showSymbol: false, // Show symbols for line plot points
        },
        {
          name: "High",
          data: highList,
          type: "line",
          itemStyle: {
            color: "#3CB2EF", // Change line plot color to green
          },
          lineStyle: {
            type: "dashed", // Set the line type to dashed
            color: "#c2c7cf",
          },
          showSymbol: false, // Show symbols for line plot points
        },
      ],
    };

    let currentYearSuffix = new Date().getFullYear().toString().slice(-2);
    let searchString = `FY${currentYearSuffix}`;

    // Assign to global variables based on dataType
    if (dataType === "Revenue") {
      let currentYearIndex = dates?.findIndex((date) => date === searchString);
      optionsRevenue = option;
      revenueDateList = dates?.slice(currentYearIndex) || [];
      avgRevenueList = avgList?.slice(currentYearIndex) || [];
      lowRevenueList = lowList?.slice(currentYearIndex) || [];
      highRevenueList = highList?.slice(currentYearIndex) || [];
    } else if (dataType === "EPS") {
      let currentYearIndex = dates?.findIndex((date) => date === searchString);

      optionsEPS = option;
      epsDateList = dates?.slice(currentYearIndex) || [];
      avgEPSList = avgList?.slice(currentYearIndex) || [];
      lowEPSList = lowList?.slice(currentYearIndex) || [];
      highEPSList = highList?.slice(currentYearIndex) || [];
    }
  }

  //To-do: Optimize this piece of shit
  function prepareData() {
    tableActualRevenue = [];
    tableForecastRevenue = [];

    tableActualEPS = [];
    tableForecastEPS = [];

    let filteredData =
      analystEstimateList?.filter((item) => item.date >= 2015) ?? [];

    xData = filteredData?.map(({ date }) => Number(String(date)?.slice(-2)));
    //Revenue Data
    filteredData?.forEach((item) => {
      tableActualRevenue?.push({
        FY: Number(String(item?.date)?.slice(-2)),
        val: item?.revenue,
      });
      tableForecastRevenue?.push({
        FY: Number(String(item?.date)?.slice(-2)),
        val: item?.estimatedRevenueAvg,
        numOfAnalysts: item?.numOfAnalysts,
      });
    });
    //EPS Data
    let forwardPeStart = false;
    filteredData?.forEach((item) => {
      const fy = Number(String(item?.date)?.slice(-2));
      const actualVal = item?.eps ?? null;
      const forecastVal = item?.estimatedEpsAvg;

      tableActualEPS?.push({
        FY: fy,
        val: actualVal,
      });

      if (actualVal === null) {
        forwardPeStart = true;
      }

      const forecastEntry: any = {
        FY: fy,
        val: forecastVal,
        numOfAnalysts: item?.numOfAnalysts,
      };

      // Add forwardPe if the condition is met
      if (forwardPeStart && forecastVal !== null) {
        forecastEntry.forwardPe =
          Math.round((data.getStockQuote.price / forecastVal) * 100) / 100;
      } else {
        forecastEntry.forwardPe = null;
      }

      tableForecastEPS?.push(forecastEntry);
    });
  }

  $: {
    if ($stockTicker && displayData && typeof window !== "undefined") {
      isLoaded = false;
      analystEstimateList = [];
      analystEstimateList = data?.getAnalystEstimate || [];
      if (analystEstimateList?.length !== 0) {
        $analystEstimateComponent = true;
        getPlotOptions("Revenue");
        getPlotOptions("EPS");

        prepareData();
      } else {
        $analystEstimateComponent = false;
      }
      isLoaded = true;
    }
  }
</script>

<section class="overflow-hidden text-white h-full pb-8 sm:pb-2">
  <main class="overflow-hidden">
    <div class="w-full m-auto">
      <div class="flex flex-row items-center"></div>

      {#if isLoaded}
        {#if analystEstimateList?.length !== 0}
          <div
            class="no-scrollbar flex justify-start items-center w-screen sm:w-full mt-6 m-auto overflow-x-scroll pr-5 sm:pr-0"
          >
            <table
              class="table table-sm shaodow table-pin-cols table-compact rounded-none sm:rounded-md w-full bg-[#09090B] border-bg-[#09090B]"
            >
              <thead class="">
                <tr class="">
                  <th
                    class="bg-[#27272A] border-b border-[#000] text-white font-semibold text-sm text-start"
                    >Fiscal Year</th
                  >
                  {#each xData as item}
                    <td
                      class="z-20 bg-[#27272A] border-b border-[#000] text-white font-semibold text-sm text-end bg-[#09090B]"
                      >{"FY" + item}</td
                    >
                  {/each}
                </tr>
              </thead>
              <tbody class="shadow-md">
                <tr class="bg-[#27272A] border-b-[#27272A]">
                  <th
                    class="text-white whitespace-nowrap text-sm sm:text-[1rem] text-start font-medium bg-[#27272A] border-b border-[#27272A]"
                  >
                    Revenue
                  </th>
                  {#each tableForecastRevenue as item}
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end font-medium border-b border-[#27272A] bg-[#09090B]"
                    >
                      {item?.val === "0.00" ||
                      item?.val === null ||
                      item?.val === 0
                        ? "-"
                        : abbreviateNumber(item?.val.toFixed(2))}
                    </td>
                  {/each}
                </tr>

                <tr class="bg-[#27272A] border-b-[#27272A]">
                  <th
                    class="bg-[#27272A] whitespace-nowrap text-sm sm:text-[1rem] text-white text-start font-medium border-b border-[#27272A]"
                  >
                    Revenue Growth
                  </th>
                  {#each tableActualRevenue as item, index}
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end font-medium bg-[#09090B]"
                    >
                      {#if index === 0 || tableActualRevenue?.length === 0}
                        -
                      {:else if item?.val === null}
                        {#if tableForecastRevenue[index]?.val - tableForecastRevenue[index - 1]?.val > 0}
                          <span class="text-orange-400">
                            {(
                              ((tableForecastRevenue[index]?.val -
                                tableForecastRevenue[index - 1]?.val) /
                                Math.abs(
                                  tableForecastRevenue[index - 1]?.val,
                                )) *
                              100
                            )?.toFixed(2)}%&#42;
                          </span>
                        {:else if tableForecastRevenue[index]?.val - tableForecastRevenue[index - 1]?.val < 0}
                          <span class="text-orange-400">
                            {(
                              ((tableForecastRevenue[index]?.val -
                                tableForecastRevenue[index - 1]?.val) /
                                Math.abs(
                                  tableForecastRevenue[index - 1]?.val,
                                )) *
                              100
                            )?.toFixed(2)}%&#42;
                          </span>
                        {/if}
                      {:else if item?.val - tableActualRevenue[index - 1]?.val > 0}
                        <span class="text-[#00FC50]">
                          {(
                            ((item?.val - tableActualRevenue[index - 1]?.val) /
                              Math.abs(tableActualRevenue[index - 1]?.val)) *
                            100
                          )?.toFixed(2)}%
                        </span>
                      {:else if item?.val - tableActualRevenue[index - 1]?.val < 0}
                        <span class="text-[#FF2F1F]">
                          {(
                            ((item?.val - tableActualRevenue[index - 1]?.val) /
                              Math.abs(tableActualRevenue[index - 1]?.val)) *
                            100
                          )?.toFixed(2)}%
                        </span>
                      {:else}
                        0.00%
                      {/if}
                    </td>
                  {/each}
                </tr>

                <tr class="bg-[#27272A] border-b-[#09090B]">
                  <th
                    class="text-white whitespace-nowrap text-sm sm:text-[1rem] text-start font-medium bg-[#27272A] border-b border-[#27272A]"
                  >
                    EPS
                  </th>
                  {#each tableForecastEPS as item}
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end font-medium border-b border-[#27272A] bg-[#09090B]"
                    >
                      {item?.val === "0.00" ||
                      item?.val === null ||
                      item?.val === 0
                        ? "-"
                        : abbreviateNumber(item?.val.toFixed(2))}
                    </td>
                  {/each}
                </tr>

                <tr class="bg-[#27272A] border-b-[#27272A]">
                  <th
                    class="bg-[#27272A] whitespace-nowrap text-sm sm:text-[1rem] text-white text-start font-medium border-b border-[#27272A]"
                  >
                    EPS Growth
                  </th>
                  {#each tableActualEPS as item, index}
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end font-medium bg-[#09090B]"
                    >
                      {#if index === 0 || tableActualEPS?.length === 0}
                        -
                      {:else if item?.val === null}
                        {#if tableForecastEPS[index]?.val - tableForecastEPS[index - 1]?.val > 0}
                          <span class="text-orange-400">
                            {(
                              ((tableForecastEPS[index]?.val -
                                tableForecastEPS[index - 1]?.val) /
                                Math.abs(tableForecastEPS[index - 1]?.val)) *
                              100
                            )?.toFixed(2)}%&#42;
                          </span>
                        {:else if tableForecastEPS[index]?.val - tableForecastEPS[index - 1]?.val < 0}
                          <span class="text-orange-400">
                            {(
                              ((tableForecastEPS[index]?.val -
                                tableForecastEPS[index - 1]?.val) /
                                Math.abs(tableForecastEPS[index - 1]?.val)) *
                              100
                            )?.toFixed(2)}%&#42;
                          </span>
                        {/if}
                      {:else if item?.val - tableActualEPS[index - 1]?.val > 0}
                        <span class="text-[#00FC50]">
                          {(
                            ((item?.val - tableActualEPS[index - 1]?.val) /
                              Math.abs(tableActualEPS[index - 1]?.val)) *
                            100
                          )?.toFixed(2)}%
                        </span>
                      {:else if item?.val - tableActualEPS[index - 1]?.val < 0}
                        <span class="text-[#FF2F1F]">
                          {(
                            ((item?.val - tableActualEPS[index - 1]?.val) /
                              Math.abs(tableActualEPS[index - 1]?.val)) *
                            100
                          )?.toFixed(2)}%
                        </span>
                      {:else}
                        0.00%
                      {/if}
                    </td>
                  {/each}
                </tr>
                <!--
                <tr class="bg-[#09090B] border-b-[#09090B]">
                  <th
                    class="bg-[#09090B] text-sm sm:text-[1rem] whitespace-nowrap text-white text-start font-medium border-b border-[#09090B]"
                    >Forward PE</th
                  >
                  {#each tableForecastEPS as item}
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end font-medium bg-[#09090B]"
                    >
                      {item?.forwardPe === "0.00" ||
                      item?.forwardPe === null ||
                      item?.forwardPe === 0
                        ? "-"
                        : abbreviateNumber(item.forwardPe)}
                    </td>
                  {/each}
                </tr>
                -->

                <tr class="bg-[#27272A] border-b-[#27272A]">
                  <th
                    class="text-white whitespace-nowrap text-sm sm:text-[1rem] text-start font-medium bg-[#27272A] border-b border-[#27272A]"
                    >No. Analysts</th
                  >
                  {#each tableForecastRevenue as item}
                    <td
                      class="text-white text-sm sm:text-[1rem] text-end font-medium border-b border-[#27272A] bg-[#09090B]"
                    >
                      {item?.numOfAnalysts === (null || 0)
                        ? "-"
                        : item?.numOfAnalysts}
                    </td>
                  {/each}
                </tr>
              </tbody>
            </table>
          </div>

          <div class="text-orange-400 text-xs sm:text-sm mt-2">
            &#42; This value depends on the forecast
          </div>
          <!--
            <div class="mt-5 text-gray-100 text-sm sm:text-[1rem] sm:rounded-md h-auto border border-slate-800 p-4">
              <svg class="w-5 h-5 inline-block mr-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
                ><path fill="#fff" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16" /></svg
              >
              For the current Fiscal Year we use available quarterly data. Complete annual data, used to compare against analyst estimates, is only finalized after the year ends.
            </div>
            -->
        {/if}
      {:else}
        <div class="flex justify-center items-center h-80">
          <div class="relative">
            <label
              class="bg-[#09090B] rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <span class="loading loading-spinner loading-md text-gray-400"
              ></span>
            </label>
          </div>
        </div>
      {/if}

      <div class="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 mt-10">
        <div>
          <h2 class="mb-2 text-xl font-bold">Revenue Forecast</h2>
          <div class="rounded-sm border p-2 border-gray-600">
            <div class="app h-[275px] w-full">
              {#if optionsRevenue !== null}
                <Chart {init} options={optionsRevenue} class="chart" />
              {/if}
            </div>
            <div
              class="mt-3 overflow-x-auto p-0 text-center sm:p-0.5 lg:mt-3.5"
            >
              <table class="w-full text-right">
                <thead
                  ><tr
                    class="border-b border-gray-600 align-bottom text-white font-normal"
                    ><th
                      class="p-1 text-left font-semibold text-sm sm:text-[1rem]"
                      >Revenue</th
                    >
                    {#each revenueDateList as date}
                      <th class="p-1 font-semibold text-sm sm:text-[1rem]"
                        >{date}</th
                      >
                    {/each}
                  </tr></thead
                >
                <tbody
                  ><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >High</td
                    >
                    {#each highRevenueList as val}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]"
                        >{abbreviateNumber(val)}</td
                      >
                    {/each}
                  </tr><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >Avg</td
                    >
                    {#each avgRevenueList as val}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]"
                        >{abbreviateNumber(val)}</td
                      >
                    {/each}
                  </tr><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >Low</td
                    >
                    {#each lowRevenueList as val}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]"
                        >{abbreviateNumber(val)}</td
                      >
                    {/each}
                  </tr></tbody
                >
              </table>
            </div>
          </div>
        </div>

        <div>
          <h2 class="mb-2 text-xl font-bold">EPS Forecast</h2>
          <div class="rounded-sm border p-2 border-gray-600">
            <div class="app h-[275px] w-full">
              {#if optionsEPS !== null}
                <Chart {init} options={optionsEPS} class="chart" />
              {/if}
            </div>
            <div
              class="mt-3 overflow-x-auto p-0 text-center sm:p-0.5 lg:mt-3.5"
              data-test="forecast-estimate-table"
            >
              <table class="w-full text-right">
                <thead
                  ><tr class="border-b border-gray-600 align-bottom font-normal"
                    ><th
                      class="p-1 text-left font-semibold text-sm sm:text-[1rem]"
                      >EPS</th
                    >
                    {#each epsDateList as date}
                      <th class="p-1 font-semibold text-sm sm:text-[1rem]"
                        >{date}</th
                      >
                    {/each}
                  </tr></thead
                >
                <tbody
                  ><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >High</td
                    >
                    {#each highEPSList as val}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]"
                        >{abbreviateNumber(val)}</td
                      >
                    {/each}
                  </tr><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >Avg</td
                    >
                    {#each avgEPSList as val}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]"
                        >{abbreviateNumber(val)}</td
                      >
                    {/each}
                  </tr><tr class="border-b border-gray-600 last:border-0"
                    ><td class="whitespace-nowrap px-1 py-[3px] text-left"
                      >Low</td
                    >
                    {#each lowEPSList as val}
                      <td class="px-1 py-[3px] text-sm sm:text-[1rem]"
                        >{abbreviateNumber(val)}</td
                      >
                    {/each}
                  </tr></tbody
                >
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</section>

<style>
  .app {
    height: 300px;
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
