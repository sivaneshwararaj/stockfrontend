<script lang="ts">
  import {
    numberOfUnreadNotification,
    displayCompanyName,
    stockTicker,
  } from "$lib/store";
  import { abbreviateNumber, monthNames } from "$lib/utils";

  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let data;

  const names =
    data?.getBusinessMetrics?.revenue?.names?.map((name) =>
      name
        ?.toLowerCase()
        ?.replace(/&/g, "") // Remove & symbol
        ?.replace(/\s+/g, "-") // Replace spaces with dash
        ?.replace(/-{2,}/g, "-") // Replace multiple dashes with single dash
        ?.replace(/^-|-$/g, "") // Remove leading/trailing dashes
        ?.trim(),
    ) || [];

  let isLoaded = false;
  let optionsData;

  let rawData = data?.getBusinessMetrics?.revenue?.history;

  let dataset = [];
  let tableList = [];

  function convertToTitleCase(str) {
    return str
      ?.split("-") // Split the string by hyphen
      ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      ?.join(" ")
      ?.replace("Oem", "OEM");
  }

  function plotData() {
    const plotDataset = [...dataset]?.sort(
      (a, b) => new Date(a?.date) - new Date(b?.date),
    );
    const xData = plotDataset
      ?.filter((item) => item?.value !== null) // Filter out items where value is null
      .map((item) => item?.date); // Map to the date property

    let valueList = [];
    for (let i = 0; i < plotDataset?.length; i++) {
      if (plotDataset[i]?.value !== null) {
        valueList.push(plotDataset[i]?.value);
      }
    }

    const options = {
      animation: false,
      grid: {
        left: "0%",
        right: "2%",
        bottom: "2%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        axisLabel: {
          color: "#fff",
        },
        data: xData,
        type: "category",
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
          name: "Revenue",
          data: valueList,
          type: "line",
          areaStyle: { opacity: 0.2 },
          smooth: true,
          symbol: "none",
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
          return `${formattedDate}<br/> Revenue: ${abbreviateNumber(params[0].value)}`;
        },
      },
    };

    return options;
  }

  $: {
    if ($stockTicker && data?.getParams && typeof window !== "undefined") {
      isLoaded = false;
      dataset = [];
      tableList = [];
      // Find the index of the current getParams value in the names array
      const index = names?.indexOf(data.getParams);
      dataset = rawData?.map((entry) => ({
        date: entry.date,
        value: index !== -1 ? entry.value[index] : null,
        valueGrowth: index !== -1 ? entry.valueGrowth[index] : null,
      }));

      tableList = [...dataset];

      tableList = tableList?.sort(
        (a, b) => new Date(b?.date) - new Date(a?.date),
      );

      optionsData = plotData();
      isLoaded = true;
    }
  }
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) Revenue Breakdown · Stocknear
  </title>
  <meta name="description" content={`Revenue & Geographic Breakdown`} />
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Revenue Breakdown · Stocknear`}
  />
  <meta property="og:description" content={`Revenue & Geographic Breakdown`} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Revenue Breakdown · Stocknear`}
  />
  <meta name="twitter:description" content={`Revenue & Geographic Breakdown`} />
</svelte:head>

<section class="bg-[#09090B] w-full overflow-hidden text-white h-full">
  <div class="w-full flex justify-center w-full sm-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if isLoaded}
        <main class="w-full">
          <div class="sm:p-7 m-auto mt-2 sm:mt-0 w-full">
            <div class="mb-3">
              <h1 class="text-2xl text-gray-200 font-bold">
                {convertToTitleCase(data?.getParams)} Revenue
              </h1>
            </div>

            {#if rawData?.length !== 0}
              <div class="app w-full">
                <Chart {init} options={optionsData} class="chart" />
              </div>

              <h2 class="mt-10 text-xl text-gray-200 font-bold">History</h2>

              <div class="w-full overflow-x-scroll">
                <table
                  class="table table-sm table-compact rounded-none sm:rounded-md w-full border-bg-[#09090B] m-auto mt-4"
                >
                  <thead>
                    <tr class="border border-gray-600">
                      <th
                        class="text-white font-semibold text-start text-sm sm:text-[1rem]"
                        >Quarter</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >Value</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                      >
                        Change
                      </th>
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >Growth</th
                      >
                    </tr>
                  </thead>
                  <tbody>
                    {#each tableList as item, index}
                      <!-- row -->
                      <tr
                        class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-secondary border-b-[#09090B] cursor-pointer"
                      >
                        <td
                          class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B]"
                        >
                          {new Date(item?.date ?? null)?.toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] text-right whitespace-nowrap border-b-[#09090B]"
                        >
                          {item?.value !== null
                            ? abbreviateNumber(item?.value)
                            : "-"}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] text-right whitespace-nowrap border-b-[#09090B]"
                        >
                          {#if Number(item?.value - tableList[index + 1]?.value)}
                            {abbreviateNumber(
                              item?.value - tableList[index + 1]?.value,
                            )}
                          {:else}
                            -
                          {/if}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end border-b-[#09090B]"
                        >
                          {#if item?.valueGrowth > 0}
                            <span class="text-[#00FC50]">
                              +{item?.valueGrowth?.toFixed(2)}%
                            </span>
                          {:else if item?.valueGrowth < 0}
                            <span class="text-[#FF2F1F]">
                              {item?.valueGrowth?.toFixed(2)}%
                            </span>
                          {:else}
                            -
                          {/if}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else}
              <h2
                class="mt-16 flex justify-center items-center text-2xl font-medium text-white mb-5 m-auto"
              >
                No data available
              </h2>
            {/if}
          </div>
        </main>
      {:else}
        <div class="w-full flex justify-center items-center h-80">
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
