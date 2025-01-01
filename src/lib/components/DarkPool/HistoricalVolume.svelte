<script lang="ts">
  import { displayCompanyName, stockTicker, etfTicker } from "$lib/store";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { Chart } from "svelte-echarts";
  import { abbreviateNumber, formatDateRange } from "$lib/utils";
  import { init, use } from "echarts/core";
  import { LineChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";

  use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let rawData = [];

  let isLoaded = false;
  let optionsData;
  let avgVolume = 0;
  let avgShortVolume = 0;
  let monthlyVolume = "";
  let avgMonthlyShort = "";

  function findMonthlyValue(data, lastDateStr) {
    const lastDate = new Date(lastDateStr);
    const firstDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);

    const filteredData = data.filter((item) => {
      const currentDate = new Date(item?.date);
      return currentDate >= firstDate && currentDate <= lastDate;
    });

    monthlyVolume = abbreviateNumber(
      filteredData.reduce((acc, item) => acc + (item?.totalVolume || 0), 0),
    );

    const totalShortPercent = filteredData.reduce(
      (acc, item) => acc + (item?.shortPercent || 0),
      0,
    );
    avgMonthlyShort =
      (totalShortPercent / filteredData.length)?.toFixed(2) || "0.00";
  }

  function getPlotOptions() {
    const dates = rawData.map((item) => item?.date);
    const totalVolumeList = rawData.map((item) => item?.totalVolume || 0);
    const shortVolumeList = rawData.map((item) => item?.shortVolume || 0);

    findMonthlyValue(rawData, rawData.at(-1)?.date);

    avgVolume =
      totalVolumeList.reduce((acc, val) => acc + val, 0) /
        totalVolumeList.length || 0;
    avgShortVolume =
      shortVolumeList.reduce((acc, val) => acc + val, 0) /
        shortVolumeList.length || 0;

    return {
      silent: true,
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

          // Sort params to ensure Vol appears last
          params.sort((a, b) => {
            if (a.seriesName === "Vol") return 1;
            if (b.seriesName === "Vol") return -1;
            return 0;
          });

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
              abbreviateNumber(param.value) +
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
      animation: false,
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
        data: dates,
        axisLabel: { color: "#fff" },
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
          name: "Total Volume",
          data: totalVolumeList,
          type: "line",
          itemStyle: { color: "#fff" },
          showSymbol: false,
        },
        {
          name: "Short Volume",
          data: shortVolumeList,
          type: "line",
          areaStyle: { opacity: 1 },
          itemStyle: { color: "#E11D48" },
          showSymbol: false,
        },
      ],
    };
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
        for="historicalDataInfo"
        class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-2xl font-bold"
      >
        Historical Activity
      </label>
      <InfoModal
        title={"Historical Data"}
        content={"By analyzing historical dark pool activity, retail investors can gauge market sentiment through total and short volumes. High short volume may indicate bearish sentiment."}
        id={"historicalDataInfo"}
      />
    </div>

    {#if isLoaded}
      {#if rawData?.length !== 0}
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

        <div class="pb-2 rounded-md bg-default">
          <div class="app w-full h-[300px] mt-5">
            <Chart {init} options={optionsData} class="chart" />
          </div>
        </div>

        <div
          class="flex flex-row items-center justify-between mx-auto mt-5 w-full sm:w-11/12"
        >
          <div
            class="mt-3.5 sm:mt-0 flex flex-col sm:flex-row items-center ml-3 sm:ml-0 w-1/2 justify-center"
          >
            <div
              class="h-full transform -translate-x-1/2"
              aria-hidden="true"
            ></div>
            <div
              class="w-3 h-3 bg-[#fff] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2"
              aria-hidden="true"
            ></div>
            <span
              class="mt-2 sm:mt-0 text-white text-center sm:text-start text-xs sm:text-md inline-block"
            >
              Total Volume
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
              class="w-3 h-3 bg-[#E11D48] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2"
              aria-hidden="true"
            ></div>
            <span
              class="mt-2 sm:mt-0 text-white text-xs sm:text-md sm:font-medium inline-block"
            >
              Short Volume
            </span>
          </div>
        </div>

        <h2
          class="mt-10 mr-1 flex flex-row items-center text-white text-xl sm:text-2xl font-bold mb-3"
        >
          Latest Information
        </h2>

        <div
          class="flex justify-start items-center w-full m-auto overflow-x-auto"
        >
          <table
            class="w-full bg-table table table-sm table-compact border border-gray-800"
          >
            <tbody>
              <tr class="border-y border-gray-800 odd:bg-odd">
                <td
                  class="px-[5px] py-1.5 xs:px-2.5 xs:py-2 text-sm sm:text-[1rem]"
                >
                  <span>Date</span>
                </td>
                <td
                  class="text-sm sm:text-[1rem] px-[5px] py-1.5 whitespace-nowrap text-right font-medium xs:px-2.5 xs:py-2"
                >
                  {formatDateRange(rawData?.slice(-1)?.at(0)?.date)}
                </td>
              </tr>
              <tr class="border-y border-gray-800 whitespace-nowrap odd:bg-odd">
                <td
                  class="px-[5px] py-1.5 xs:px-2.5 xs:py-2 text-sm sm:text-[1rem]"
                >
                  <span>Total Volume</span>
                </td>
                <td
                  class="px-[5px] py-1.5 text-right font-medium xs:px-2.5 xs:py-2"
                >
                  {monthlyVolume}
                </td>
              </tr>
              <tr class="border-y border-gray-800 whitespace-nowrap odd:bg-odd">
                <td
                  class="px-[5px] py-1.5 xs:px-2.5 xs:py-2 text-sm sm:text-[1rem]"
                >
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
