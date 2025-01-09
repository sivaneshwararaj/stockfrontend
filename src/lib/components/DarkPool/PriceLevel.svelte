<script lang="ts">
  import { displayCompanyName, stockTicker, etfTicker } from "$lib/store";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { Chart } from "svelte-echarts";
  import { abbreviateNumber, abbreviateNumberWithColor } from "$lib/utils";
  import { init, use } from "echarts/core";
  import { BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";

  let category = "Size";

  use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let rawData = [];
  export let metrics = {};

  let isLoaded = false;
  let optionsData;

  function getPlotOptions(category) {
    const xAxis = rawData.map((item) => item[category?.toLowerCase()]); // Convert volume to millions for clarity
    const yAxis = rawData.map((item) => item?.price_level || 0);

    const options = {
      silent: true,
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
          const priceLevel = params[0].axisValue;

          let result = `Price Level: ${priceLevel}<br/>`;

          params?.forEach((param) => {
            const marker =
              '<span style="display:inline-block;margin-right:4px;' +
              "border-radius:10px;width:10px;height:10px;background-color:" +
              param.color +
              '"></span>';
            result += `${param.seriesName}: ${abbreviateNumber(param.value)}<br/>`;
          });

          return result;
        },
        axisPointer: {
          lineStyle: {
            color: "#fff",
          },
        },
      },
      animation: false,
      grid: {
        left: "0%", // Adjust to create space for y-axis labels
        right: "10%",
        bottom: "5%",
        top: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        name: "",
        splitLine: { show: false },
        axisLabel: {
          color: "#fff",
          interval: 0, // Show all labels
          rotate: 45, // Rotate labels for better readability
          fontSize: 12, // Adjust font size if needed
          margin: 10,
          formatter: function (value) {
            return abbreviateNumber(value); // Call your abbreviateNumber function
          },
        },
      },
      yAxis: {
        type: "category",
        name: "",
        data: yAxis,
        axisLabel: { color: "#fff" },
      },
      series: [
        {
          name: `Total ${category}`,
          data: xAxis,
          type: "bar",
          itemStyle: {
            color: (params) => {
              // Highlight a specific bar (e.g., the maximum volume)
              const maxVolumeIndex = xAxis.indexOf(Math.max(...xAxis));
              return params.dataIndex === maxVolumeIndex
                ? "#3BA272"
                : "#e2e8f0"; // Green for highlight, blue for others
            },
          },
          showSymbol: false,
        },
      ],
    };
    return options;
  }

  $: if (
    typeof window !== "undefined" &&
    ($stockTicker || $etfTicker) &&
    category
  ) {
    isLoaded = false;
    optionsData = getPlotOptions(category);
    isLoaded = true;
  }
</script>

<section class="overflow-hidden text-white h-full pb-8 pt-6">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center">
      <label
        for="priceLevelInfo"
        class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-2xl font-bold"
      >
        Price Level
      </label>
      <InfoModal
        title={"Price Level"}
        content={"Price levels reveal where significant trading activity occurs, aiding investors in identifying key support and resistance zones."}
        id={"priceLevelInfo"}
      />
    </div>

    {#if isLoaded}
      {#if rawData?.length !== 0 && Object?.keys(metrics)?.length > 0}
        <div class="w-full flex flex-col items-start">
          <div class="text-white text-[1rem] mt-2 mb-2 w-full">
            {$displayCompanyName} has seen an average dark pool trade size of {@html abbreviateNumberWithColor(
              metrics?.avgTradeSize,
              false,
              true,
            )} and an average premium per trade of {@html abbreviateNumberWithColor(
              metrics?.avgPremTrade,
              false,
              true,
            )}, with a total premium of {@html abbreviateNumberWithColor(
              metrics?.totalPrem,
              false,
              true,
            )}.
          </div>
        </div>

        <div class="pb-2 rounded-md bg-default mt-14 sm:mt-0">
          <div class="app w-full h-[300px] mt-5 relative">
            <div
              class="flex justify-start space-x-2 absolute right-0 -top-10 sm:-top-8 z-10 text-sm"
            >
              {#each ["Size", "Premium"] as item}
                <label
                  on:click={() => (category = item)}
                  class="px-4 py-2 {category === item
                    ? 'bg-white text-black shadow-xl'
                    : 'text-white bg-table text-opacity-[0.6]'} transition ease-out duration-100 sm:hover:bg-white sm:hover:text-black rounded-md cursor-pointer"
                >
                  {item}
                </label>
              {/each}
            </div>

            <Chart {init} options={optionsData} class="chart " />
          </div>
        </div>
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
