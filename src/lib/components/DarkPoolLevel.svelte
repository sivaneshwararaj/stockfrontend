<script lang="ts">
  import { stockTicker, etfTicker } from "$lib/store";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { Chart } from "svelte-echarts";
  import { abbreviateNumber } from "$lib/utils";
  import { init, use } from "echarts/core";
  import { BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";

  let category = "Volume";

  use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let rawData = [
    { price_level: 31.78, volume: 48562602.0, size: 31490, premium: 1000746.8 },
    {
      price_level: 31.67,
      volume: 46661214.0,
      size: 28400,
      premium: 899429.8400000001,
    },
    {
      price_level: 31.7,
      volume: 29795872.0,
      size: 22798,
      premium: 722699.5586,
    },
    { price_level: 31.65, volume: 28530280.0, size: 22000, premium: 696289.0 },
    { price_level: 31.2, volume: 26279878.0, size: 30516, premium: 952028.3 },
    { price_level: 31.24, volume: 19203098.0, size: 27600, premium: 862246.1 },
  ];

  let isLoaded = false;
  let optionsData;

  function getPlotOptions() {
    const xAxis = rawData.map((item) => item?.volume); // Convert volume to millions for clarity
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
            result += `${marker}${param.seriesName}: ${param.value} M<br/>`;
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
        nameTextStyle: { color: "#fff" },
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
        name: "Price Level",
        nameTextStyle: { color: "#fff" },
        data: yAxis,
        axisLabel: { color: "#fff" },
      },
      series: [
        {
          name: "Total Volume",
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

  $: if (typeof window !== "undefined" && ($stockTicker || $etfTicker)) {
    isLoaded = false;
    optionsData = getPlotOptions();
    isLoaded = true;
  }
</script>

<section class="overflow-hidden text-white h-full pb-8">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center">
      <label
        for="darkPoolLevel"
        class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-2xl font-bold"
      >
        Price Level
      </label>
      <InfoModal
        title={"Dark Pool Price Level"}
        content={"Dark pool data refers to information on trading activities that occur in private, non-public financial exchanges known as dark pools. These venues are used by hedge funds and major institutional traders to buy and sell large blocks of securities without exposing their orders to the public, minimizing market impact and price fluctuations. Currently, nearly 50% of all trades are executed in these dark pools, highlighting their significant role in the trading landscape."}
        id={"darkPoolLevel"}
      />
    </div>

    {#if isLoaded}
      {#if rawData?.length !== 0}
        <!-- 
      <div class="w-full flex flex-col items-start">
          <div class="text-white text-[1rem] mt-2 mb-2 w-full">
            Over the past 12 months, {$displayCompanyName} has experienced an average
            dark pool trading volume of
            <span class="font-semibold">{abbreviateNumber(avgVolume)}</span>
            shares. Out of this total, an average of
            <span class="font-semibold">{abbreviateNumber(avgShortVolume)}</span
            >
            shares, constituting approximately
            <span class="font-semibold"
              >{((avgShortVolume / avgVolume) * 100)?.toFixed(2)}%</span
            >, were short volume.
          </div>
        </div>
    -->
        <div class="w-full flex flex-col items-start">
          Over the past 12 months, GameStop Corp. has experienced an average
          dark pool trading volume of 8.55M shares. Out of this total, an
          average of 3.81M shares, constituting approximately 44.52%, were short
          volume.
        </div>

        <div class="pb-2 rounded-md bg-default">
          <div class="app w-full h-[300px] mt-5 relative">
            <div
              class="flex justify-start space-x-2 absolute right-0 top-0 z-10 text-sm"
            >
              {#each ["Volume", "Size", "Premium"] as item}
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

            <Chart {init} options={optionsData} class="chart" />
          </div>
        </div>

        <!--
        <h2
          class="mt-10 mr-1 flex flex-row items-center text-white text-xl sm:text-2xl font-bold mb-3"
        >
          Latest Information
        </h2>

        <div class="flex justify-start items-center w-full m-auto">
          <table class="w-full bg-table border border-gray-800">
            <tbody>
              <tr class="border-y border-gray-800 odd:bg-odd">
                <td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2">
                  <span>Date</span>
                </td>
                <td
                  class="text-sm sm:text-[1rem] px-[5px] py-1.5 whitespace-nowrap text-right font-medium xs:px-2.5 xs:py-2"
                >
                  {formatDateRange(rawData?.slice(-1)?.at(0)?.date)}
                </td>
              </tr>
              <tr class="border-y border-gray-800 whitespace-nowrap odd:bg-odd">
                <td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2">
                  <span>Total Volume</span>
                </td>
                <td
                  class="px-[5px] py-1.5 text-right font-medium xs:px-2.5 xs:py-2"
                >
                  {monthlyVolume}
                </td>
              </tr>
              <tr class="border-y border-gray-800 whitespace-nowrap odd:bg-odd">
                <td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2">
                  <span>Avg. Short % of Volume</span>
                </td>
                <td
                  class="px-[5px] py-1.5 text-right font-medium xs:px-2.5 xs:py-2"
                >
                  {avgMonthlyShort}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
    -->
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
