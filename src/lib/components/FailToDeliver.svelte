<script lang="ts">
  import {
    displayCompanyName,
    stockTicker,
    assetType,
    etfTicker,
  } from "$lib/store";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { Chart } from "svelte-echarts";
  import { abbreviateNumber, formatDateRange, monthNames } from "$lib/utils";

  import { init, use } from "echarts/core";
  import { LineChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";

  export let data;
  export let rawData = [];

  use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

  let isLoaded = false;
  let optionsData;
  let avgFailToDeliver;
  let lowestPrice;
  let highestPrice;
  let weightedFTD;

  function findLowestAndHighestPrice(data, lastDateStr) {
    const lastDate = new Date(lastDateStr);
    const firstDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);

    const filteredData = data?.filter((item) => {
      const currentDate = new Date(item?.date);
      return currentDate >= firstDate && currentDate <= lastDate;
    });

    let prices = filteredData?.map((item) => parseFloat(item.price));

    lowestPrice = Math.min(...prices);
    highestPrice = Math.max(...prices);
  }

  function getPlotOptions() {
    let dates = [];
    let priceList = [];
    let failToDeliverList = [];

    rawData?.forEach((item) => {
      dates?.push(item?.date);
      priceList?.push(item?.price);
      failToDeliverList?.push(item?.failToDeliver);
    });

    findLowestAndHighestPrice(rawData, rawData?.slice(-1)?.at(0)?.date);

    const totalNumber = failToDeliverList?.reduce((acc, item) => acc + item, 0);
    avgFailToDeliver = (totalNumber / failToDeliverList?.length)?.toFixed(0);

    const option = {
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

          // Add each series data
          params.forEach((param) => {
            const marker =
              '<span style="display:inline-block;margin-right:4px;' +
              "border-radius:10px;width:10px;height:10px;background-color:" +
              param.color +
              '"></span>';
            result +=
              marker +
              param.seriesName +
              ": " +
              abbreviateNumber(param.value, false, true) +
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
        axisLabel: {
          color: "#fff",
          formatter: function (value) {
            const dateParts = value.split("-");
            const day = dateParts[2].substring(0);
            const monthIndex = parseInt(dateParts[1]) - 1;
            return `${day} ${monthNames[monthIndex]}`;
          },
        },
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
        {
          type: "value",
          splitLine: {
            show: false,
          },
          position: "right",
          axisLabel: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: "Price",
          data: priceList,
          type: "line",
          itemStyle: {
            color: "#fff",
          },
          showSymbol: false,
        },
        {
          name: "FTD Shares",
          data: failToDeliverList,
          type: "line",
          areaStyle: { opacity: 1 },
          yAxisIndex: 1,
          itemStyle: {
            color: "#E11D48",
          },
          showSymbol: false,
        },
      ],
    };

    return option;
  }

  $: {
    const ticker = $assetType === "stock" ? $stockTicker : $etfTicker;
    if (ticker) {
      isLoaded = false;
      if (rawData?.length > 0) {
        weightedFTD = (
          (rawData?.slice(-1)?.at(0)?.failToDeliver /
            data?.getStockQuote?.avgVolume) *
          100
        )?.toFixed(2);
        optionsData = getPlotOptions();
      }
      isLoaded = true;
    }
  }
</script>

<section class="overflow-hidden text-white h-full pb-8">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center w-full mt-5">
      <h1 class="text-2xl text-white font-bold">
        Historical {$stockTicker} Chart
      </h1>
    </div>

    {#if isLoaded}
      {#if rawData?.length !== 0}
        <div class="w-full flex flex-col items-start">
          <div class="text-white text-[1rem] mt-2 mb-2 w-full">
            Over the past year, {$displayCompanyName} has seen a monthly average
            of
            <span class="font-semibold"
              >{abbreviateNumber(avgFailToDeliver)}</span
            > fail to deliver shares.
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
              Price
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
              Share Quantity
            </span>
          </div>
        </div>

        <h2
          class="mt-10 mr-1 flex flex-row items-center text-white text-xl sm:text-2xl font-bold mb-3"
        >
          Latest Information
        </h2>

        <div class="flex justify-start items-center w-full m-auto">
          <table class="w-full bg-table border border-gray-800">
            <tbody>
              <tr class="border-y border-gray-800 odd:bg-odd">
                <td
                  class="px-[5px] py-1.5 xs:px-2.5 xs:py-2 text-sm sm:text-[1rem]"
                >
                  <span>Date</span>
                </td>
                <td
                  class="px-[5px] py-1.5 text-right whitespace-nowrap font-medium xs:px-2.5 xs:py-2 text-sm sm:text-[1rem]"
                >
                  {formatDateRange(rawData?.slice(-1)?.at(0)?.date)}
                </td>
              </tr>
              <tr class="border-y border-gray-800 odd:bg-odd">
                <td
                  class="px-[5px] py-1.5 xs:px-2.5 xs:py-2 text-sm sm:text-[1rem]"
                >
                  <span>Price Range</span>
                </td>
                <td
                  class="px-[5px] py-1.5 text-right font-medium xs:px-2.5 xs:py-2 text-sm sm:text-[1rem]"
                >
                  {lowestPrice + "-" + highestPrice}
                </td>
              </tr>
              <tr class="border-y border-gray-800 odd:bg-odd">
                <td
                  class="px-[5px] py-1.5 xs:px-2.5 xs:py-2 text-sm sm:text-[1rem]"
                >
                  <span>Latest FTD</span>
                </td>
                <td
                  class="px-[5px] py-1.5 text-right font-medium xs:px-2.5 xs:py-2 text-sm sm:text-[1rem]"
                >
                  {abbreviateNumber(rawData?.slice(-1)?.at(0)?.failToDeliver)}
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
