<script lang="ts">
  import { onMount } from "svelte";

  import InfoModal from "$lib/components/InfoModal.svelte";
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import { monthNames } from "$lib/utils";

  export let rawData: Array<{
    date: string;
    price: number;
    netCall: number;
    netPut: number;
  }>;

  use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  let isLoaded = false;
  let optionsData;
  let sentiment;

  function getPlotOptions() {
    const dates = [];
    const priceList = [];
    const netCallList = [];
    const netPutList = [];

    if (rawData && rawData.length) {
      // Populate arrays with data
      rawData.forEach((item) => {
        dates.push(item.date);
        priceList.push(item.price);
        netCallList.push(item.netCall);
        netPutList.push(item.netPut);
      });

      // Determine sentiment
      sentiment =
        netCallList.at(-1) > netPutList.at(-1) ? "bullish" : "bearish";

      return {
        silent: true,
        tooltip: {
          trigger: "axis",
          hideDelay: 100, // Tooltip delay in milliseconds
        },
        animation: false,
        grid: {
          left: "3%",
          right: "3%",
          bottom: "0%",
          top: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: dates,
          axisLabel: {
            color: "#fff",
            formatter: (value, index) => {
              if (index % 2 === 0) {
                const [year, month, day] = value.split("-");
                return `${day} ${monthNames[parseInt(month, 10) - 1]}`;
              }
              return "";
            },
          },
        },
        yAxis: [
          {
            type: "value",
            splitLine: { show: false },
            axisLabel: { show: false },
          },
        ],
        series: [
          {
            name: "Net Call",
            data: netCallList,
            type: "bar",
            stack: "NetFlow",
            itemStyle: { color: "#2256FF" },
            showSymbol: false,
          },
          {
            name: "Net Put",
            data: netPutList,
            type: "bar",
            stack: "NetFlow",
            itemStyle: { color: "#FF2256" },
            showSymbol: false,
          },
        ],
      };
    } else {
      console.warn("No raw data available to populate chart options");
      return {};
    }
  }

  onMount(() => {
    optionsData = getPlotOptions();
    isLoaded = true;
  });
</script>

<section class="overflow-hidden text-white h-full pb-8">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center">
      <label
        for="optionsNetFlowInfo"
        class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold"
      >
        Options Net Flow
      </label>
      <InfoModal
        title={"Options Net Flow"}
        content={"An Options Net Flow of XY% means the market expects significant price fluctuations for the stock, with an annualized potential range of ±XY% from its current price. This indicates high uncertainty and risk, leading to more expensive options but doesn't predict price direction."}
        id={"optionsNetFlowInfo"}
      />
    </div>

    {#if isLoaded}
      {#if rawData?.length !== 0}
        <div class="w-full flex flex-col items-start">
          <div class="text-white text-[1rem] mt-2 mb-2 w-full">
            The options net flow demonstrates a {sentiment} trend in the last 2 trading
            hours, characterized by the {sentiment === "bullish"
              ? "Net Call Flow exceeding the Net Put Flow"
              : "Net Put Flow exceeding the Net Call Flow"}.
          </div>
        </div>

        <div class="pb-2 rounded-lg bg-[#09090B]">
          <div class="app w-full h-[300px] mt-5">
            <Chart {init} options={optionsData} class="chart" />
          </div>
        </div>

        <div
          class="flex flex-row items-center justify-between mx-auto mt-5 w-full sm:w-11/12"
        >
          <div
            class="flex flex-col sm:flex-row items-center ml-3 sm:ml-0 w-1/2 justify-center"
          >
            <div
              class="h-full transform -translate-x-1/2"
              aria-hidden="true"
            ></div>
            <div
              class="w-3 h-3 bg-[#2256FF] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2"
              aria-hidden="true"
            ></div>
            <span
              class="mt-2 sm:mt-0 text-white text-xs sm:text-md sm:font-medium inline-block"
            >
              Net Call
            </span>
          </div>

          <div
            class="flex flex-col sm:flex-row items-center ml-3 sm:ml-0 w-1/2 justify-center"
          >
            <div
              class="h-full transform -translate-x-1/2"
              aria-hidden="true"
            ></div>
            <div
              class="w-3 h-3 bg-[#FF2F1F] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2"
              aria-hidden="true"
            ></div>
            <span
              class="mt-2 sm:mt-0 text-white text-xs sm:text-md sm:font-medium inline-block"
            >
              Net Put
            </span>
          </div>
        </div>
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
