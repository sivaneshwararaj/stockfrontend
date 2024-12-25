<script lang="ts">
  import {
    fomcImpactComponent,
    displayCompanyName,
    stockTicker,
    assetType,
    etfTicker,
    getCache,
    setCache,
  } from "$lib/store";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { LineChart } from "echarts/charts";
  import {
    GridComponent,
    MarkLineComponent,
    TooltipComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";

  use([
    LineChart,
    GridComponent,
    MarkLineComponent,
    TooltipComponent,
    CanvasRenderer,
  ]);

  let isLoaded = false;
  let rawData = [];
  let tableList = [];
  let optionsData;
  let showFullStats = false;

  function getPlotOptions() {
    const xAxisData = rawData?.history.map((item) => item.date);

    // Extract yAxis data from history (close prices)
    const seriesData = rawData?.history?.map((item) => [item.date, item.close]);

    // Create markLine data for FOMC dates based on xAxis index

    const markLineData = rawData.fomcData
      ?.map((item) => {
        const index = xAxisData?.indexOf(item?.date);
        if (index !== -1) {
          return { xAxis: index }; // Mark the index in xAxis where FOMC date exists
        }
        return null;
      })
      ?.filter((item) => item !== null); // Filter out null values in case FOMC date is not in history

    tableList = rawData.fomcData?.sort(
      (a, b) => new Date(b?.date) - new Date(a?.date),
    );

    const option = {
      silent: true,
      animation: false,
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
      },
      grid: {
        left: "3%",
        right: "3%",
        bottom: "2%",
        top: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        axisLabel: {
          color: "#fff",
        },
        data: xAxisData,
      },
      yAxis: [
        {
          type: "value",
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
          name: "Stock Price",
          type: "line",
          symbol: "none",
          lineStyle: {
            color: "#fff",
          },
          markLine: {
            symbol: ["none", "none"],
            label: { show: false },
            lineStyle: {
              color: "orange", // Set the color to orange
            },
            data: markLineData, // Use dynamically created markLine data for FOMC dates
          },
          data: seriesData, // Populate series with [date, close] data
        },
      ],
    };
    return option;
  }

  const getFOMCImpact = async (ticker: string) => {
    // Get cached data for the specific tickerID
    const cachedData = getCache(ticker, "getFOMCImpact");
    if (cachedData) {
      rawData = cachedData;
    } else {
      const postData = { ticker: ticker, path: "fomc-impact" };
      const response = await fetch("/api/ticker-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      rawData = await response?.json();
      // Cache the data for this specific tickerID with a specific name 'getFOMCImpact'
      setCache(ticker, rawData, "getFOMCImpact");
    }

    if (Object?.keys(rawData)?.length !== 0) {
      $fomcImpactComponent = true;
    } else {
      $fomcImpactComponent = false;
    }
  };

  $: {
    if (
      $assetType === "stock"
        ? $stockTicker
        : $etfTicker && typeof window !== "undefined"
    ) {
      isLoaded = false;
      showFullStats = false;
      tableList = [];
      const asyncFunctions = [
        getFOMCImpact($assetType === "stock" ? $stockTicker : $etfTicker),
      ];
      Promise.all(asyncFunctions)
        .then(() => {
          if (Object?.keys(rawData)?.length !== 0) {
            optionsData = getPlotOptions();
          }
        })
        .catch((error) => {
          console.error("An error occurred:", error);
        });
      isLoaded = true;
    }
  }
</script>

<section class="overflow-hidden text-white h-full">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center">
      <label
        for="fomcInfo"
        class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold"
      >
        FOMC Impact
      </label>
      <InfoModal
        title={"Federal Open Market Committee Meeting"}
        content={"FOMC meetings influence stock prices by setting interest rates and signaling monetary policy, affecting investor sentiment and market liquidity."}
        id={"fomcInfo"}
      />
    </div>

    {#if isLoaded}
      {#if Object?.keys(rawData)?.length !== 0}
        <div class="mt-2 pb-8 sm:pb-2 rounded-md bg-[#09090B] sm:bg-[#09090B]">
          <div class="w-full flex flex-col items-start">
            <div class="text-white text-[1rem] mt-1 sm:mt-3 mb-1 w-full">
              Examine how sensitive {$displayCompanyName}'s stock price is to
              the decisions made during FOMC meetings. The vertical line marks
              the interest rate decision.
            </div>
          </div>

          <div class="app w-full h-[300px]">
            <Chart {init} options={optionsData} class="chart" />
          </div>

          <h2
            class="mt-10 mr-1 flex flex-row items-center text-white text-2xl font-bold mb-3"
          >
            Latest FED Interest Rate
          </h2>

          <div class="w-full text-white text-[1rem] mt-6">
            The latest list of previous, forecasted, and actual interest rate
            decisions made by the FED.
            <br />
            The "% Price Change" column reflects the performance for each interval
            leading up to the next FOMC meeting.
          </div>

          <div
            class="flex justify-start items-center w-full m-auto mt-6 overflow-x-scroll"
          >
            <table class="table table-sm table-compact w-full">
              <thead>
                <tr class="border-b border-[#27272A]">
                  <th
                    class="text-white font-semibold text-sm sm:text-[1rem] text-start bg-[#09090B]"
                    >Date</th
                  >
                  <th
                    class="text-white font-semibold text-sm sm:text-[1rem] text-end bg-[#09090B]"
                    >Previous</th
                  >
                  <th
                    class="text-white font-semibold text-sm sm:text-[1rem] text-end bg-[#09090B]"
                    >Forecast</th
                  >
                  <th
                    class="text-white font-semibold text-sm sm:text-[1rem] text-end bg-[#09090B]"
                    >Actual</th
                  >
                  <th
                    class="text-white font-semibold text-sm sm:text-[1rem] text-end bg-[#09090B]"
                    >% Price Change</th
                  >
                </tr>
              </thead>
              <tbody>
                {#each showFullStats ? tableList?.slice(0, 10) : tableList?.slice(0, 3) as item, index}
                  <tr
                    class="border-y border-gray-800 odd:bg-odd {index === 2 &&
                    !showFullStats &&
                    tableList?.length > 3
                      ? 'opacity-[0.5]'
                      : ''} sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] bg-[#09090B] border-b-[#09090B]"
                  >
                    <td
                      class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                    >
                      {new Date(item?.date ?? null)?.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td
                      class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                    >
                      {item?.previous}%
                    </td>

                    <td
                      class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                    >
                      {item?.estimate}%
                    </td>

                    <td
                      class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                    >
                      {item?.actual}%
                    </td>

                    <td
                      class="text-white font-normal text-end text-sm sm:text-[1rem] whitespace-nowrap"
                    >
                      {#if item?.changePercentage >= 0}
                        <span class="text-[#00FC50]"
                          >+{item?.changePercentage?.toFixed(2)}%</span
                        >
                      {:else}
                        <span class="text-[#FF2F1F]"
                          >{item?.changePercentage?.toFixed(2)}%
                        </span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <label
            on:click={() => (showFullStats = !showFullStats)}
            class="cursor-pointer flex justify-center items-center mt-5"
          >
            <svg
              class="w-10 h-10 transform {showFullStats ? 'rotate-180' : ''} "
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              ><path
                fill="#2A323C"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 13.5L7.5 11l1.42-1.41L12 12.67l3.08-3.08L16.5 11L12 15.5z"
              /></svg
            >
          </label>
        </div>
      {:else}
        <h2
          class="mt-10 mb-5 flex justify-center items-center text-3xl font-bold text-slate-700 m-auto"
        >
          No data available
          <svg
            class="w-10 sm:w-12 inline-block"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            ><path
              fill="#334155"
              d="M18.68 12.32a4.49 4.49 0 0 0-6.36.01a4.49 4.49 0 0 0 0 6.36a4.508 4.508 0 0 0 5.57.63L21 22.39L22.39 21l-3.09-3.11c1.13-1.77.87-4.09-.62-5.57m-1.41 4.95c-.98.98-2.56.97-3.54 0c-.97-.98-.97-2.56.01-3.54c.97-.97 2.55-.97 3.53 0c.97.98.97 2.56 0 3.54M10.9 20.1a6.527 6.527 0 0 1-1.48-2.32C6.27 17.25 4 15.76 4 14v3c0 2.21 3.58 4 8 4c-.4-.26-.77-.56-1.1-.9M4 9v3c0 1.68 2.07 3.12 5 3.7v-.2c0-.93.2-1.85.58-2.69C6.34 12.3 4 10.79 4 9m8-6C7.58 3 4 4.79 4 7c0 2 3 3.68 6.85 4h.05c1.2-1.26 2.86-2 4.6-2c.91 0 1.81.19 2.64.56A3.215 3.215 0 0 0 20 7c0-2.21-3.58-4-8-4Z"
            /></svg
          >
        </h2>
      {/if}
    {:else}
      <div class="flex justify-center items-center h-80">
        <div class="relative">
          <label
            class="bg-secondary rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <span class="loading loading-spinner loading-md"></span>
          </label>
        </div>
      </div>
    {/if}
  </main>
</section>

<style>
  .app {
    height: 300px;
    max-width: 100%; /* Ensure chart width doesn't exceed the container */
  }

  @media (max-width: 640px) {
    .app {
      height: 230px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
