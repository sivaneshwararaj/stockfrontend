<script lang="ts">
  import {
    retailVolumeComponent,
    displayCompanyName,
    stockTicker,
    assetType,
    etfTicker,
    screenWidth,
    getCache,
    setCache,
  } from "$lib/store";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { Chart } from "svelte-echarts";
  import { abbreviateNumber, formatDateRange, monthNames } from "$lib/utils";
  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";

  use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let data: any;

  let isLoaded = false;
  let historyData: Array<{ date: string; traded: number; sentiment: number }> =
    [];
  let rawData: { history: typeof historyData; lastDate?: string } | null = null;
  let optionsData: any;
  let avgVolume: number | string = 0;
  let avgSentiment: string = "";
  let monthlyVolume: string | number = 0;
  let lowestSentiment: string | number = 0;
  let highestSentiment: string | number = 0;

  function findMonthlyValue(data: any[], lastDateStr: string) {
    if (!data || !data[0]?.sentiment) {
      console.error("Sentiment is undefined or missing in the data:", data);
      $retailVolumeComponent = false;
      return;
    }
    const lastDate = new Date(lastDateStr);
    const firstDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
    const filteredData = data.filter((item) => {
      const currentDate = new Date(item.date);
      return currentDate >= firstDate && currentDate <= lastDate;
    });

    monthlyVolume = filteredData.reduce(
      (acc, item) => acc + (item.traded || 0),
      0,
    );
    monthlyVolume =
      monthlyVolume > 100e3 ? abbreviateNumber(monthlyVolume, true) : "< $100K";

    const sentiments = filteredData.map((item) => parseFloat(item.sentiment));
    lowestSentiment = Math.min(...sentiments).toFixed(0);
    highestSentiment = Math.max(...sentiments).toFixed(0);
  }

  function getPlotOptions() {
    const dates = historyData.map((item) => item.date);
    const tradingList = historyData.map((item) => item.traded);
    const sentimentList = historyData.map((item) => item.sentiment);

    findMonthlyValue(historyData, rawData?.lastDate || "");

    const totalTraded = tradingList.reduce((acc, traded) => acc + traded, 0);
    avgVolume = totalTraded / tradingList.length;
    avgSentiment =
      sentimentList.reduce((acc, sentiment) => acc + sentiment, 0) /
        tradingList.length >
      1
        ? "Bullish"
        : "Bearish";

    return {
      silent: true,
      animation: false,
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
      },
      grid: {
        left: "3%",
        right: "3%",
        bottom: "0%",
        top: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
        axisLabel: {
          color: "#fff",
          formatter: (value: string) => {
            const [year, month, day] = value.split("-");
            return `${day} ${monthNames[parseInt(month) - 1]}`;
          },
        },
      },
      yAxis: [
        {
          type: "value",
          splitLine: { show: false },
          axisLabel: { show: false },
        },
        {
          type: "value",
          splitLine: { show: false },
          position: "right",
          axisLabel: { show: false },
        },
      ],
      series: [
        {
          name: "Volume [$]",
          data: tradingList,
          type: "line",
          itemStyle: { color: "#fff" },
          showSymbol: false,
        },
        {
          name: "Retail Sentiment",
          data: sentimentList,
          type: "bar",
          yAxisIndex: 1,
          itemStyle: {
            color: (params: any) => (params.data >= 0 ? "#22C55E" : "#F71F4F"),
          },
        },
      ],
    };
  }

  const getRetailVolume = async (ticker: string) => {
    const cachedData = getCache(ticker, "getRetailVolume");
    if (cachedData) {
      rawData = cachedData;
      historyData = rawData.history;
    } else {
      const response = await fetch("/api/ticker-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, path: "retail-volume" }),
      });
      rawData = await response.json();
      historyData = rawData.history;
      setCache(ticker, rawData, "getRetailVolume");
    }
    $retailVolumeComponent = !!rawData;
  };

  $: {
    if (
      ($assetType === "stock" ? $stockTicker : $etfTicker) &&
      typeof window !== "undefined"
    ) {
      isLoaded = false;
      const ticker = $assetType === "stock" ? $stockTicker : $etfTicker;
      Promise.all([getRetailVolume(ticker)])
        .then(() => {
          optionsData = rawData ? getPlotOptions() : null;
          isLoaded = true;
        })
        .catch((error) => console.error("An error occurred:", error));
    }
  }
</script>

<section class="overflow-hidden text-white h-full pb-8">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center">
      <label
        for="retailTraderTrackerInfo"
        class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold"
      >
        Retail Trader Activity
      </label>
      <InfoModal
        title={"Retail Trader Activity"}
        content={"Gain insights into Retail Trader activity with the following visualization: The green bar illustrates the daily volume trend, signifying a bullish sentiment if it ranges from 0 to 100, or bearish if it spans from -100 to just below 0. The white line depicts the daily trading volume of retail investors."}
        id={"retailTraderTrackerInfo"}
      />
    </div>

    {#if isLoaded}
      {#if Object?.keys(rawData)?.length !== 0}
        <div class="w-full flex flex-col items-start">
          <div class="text-white text-[1rem] mt-2 mb-2 w-full">
            In the past six months, the {$displayCompanyName} had an average retail
            investor volume of
            <span class="font-semibold"
              >{avgVolume > 100e3
                ? abbreviateNumber(avgVolume, true)
                : "< $100K"}</span
            >, with a prevailing
            {#if avgSentiment === "Bullish"}
              <span class="text-[#00FC50]">
                <svg
                  class="w-6 h-6 sm:w-7 sm:h-7 inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  ><g
                    fill="none"
                    stroke="#00FC50"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    ><path d="m3 17l6-6l4 4l8-8" /><path d="M17 7h4v4" /></g
                  ></svg
                >
                {avgSentiment}
              </span>
            {:else if avgSentiment === "Bearish"}
              <span class="text-[#E57C34]">
                <svg
                  class="w-6 h-6 sm:w-7 sm:h-7 inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  ><path
                    fill="#ff2f1f"
                    d="M244 136v64a12 12 0 0 1-12 12h-64a12 12 0 0 1 0-24h35l-67-67l-31.51 31.52a12 12 0 0 1-17 0l-72-72a12 12 0 0 1 17-17L96 127l31.51-31.52a12 12 0 0 1 17 0L220 171v-35a12 12 0 0 1 24 0Z"
                  /></svg
                >
                {avgSentiment}
              </span>
            {:else}
              <span class="text-[#FF2F1F]">
                <svg
                  class="w-6 h-6 sm:w-7 sm:h-7 inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  ><path fill="#e57c34" d="m22 12l-4-4v3H3v2h15v3l4-4Z" /></svg
                >
                Neutral
              </span>
            {/if} trend.
          </div>
        </div>

        <div class="pb-8 sm:pb-2 rounded-md bg-default">
          <div class="app w-full h-[300px] mt-5">
            <Chart {init} options={optionsData} class="chart" />
          </div>
        </div>

        <div class="text-white mt-6">
          The line chart shows dollar volume, while the bar chart indicates
          sentiment from -100 to 100, with negative values for more selling and
          positive values for more buying.
        </div>

        <h2
          class="mt-10 mr-1 flex flex-row items-center text-white text-xl sm:text-2xl font-bold mb-3"
        >
          Latest Information
        </h2>
        <span class="text-white">
          On {new Date(rawData?.lastDate)?.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            daySuffix: "2-digit",
          })}, retail traders accounted for
          <span class="font-semibold"
            >{rawData?.retailStrength > 0.01
              ? rawData?.retailStrength
              : "< 0.01"}%</span
          > of the trading volume.
        </span>
        <div class="flex justify-start items-center w-full m-auto mt-6">
          <table class="w-full" data-test="statistics-table">
            <tbody>
              <tr class="border-y border-gray-800 odd:bg-odd">
                <td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2">
                  <span>Date</span>
                </td>
                <td
                  class="px-[5px] whitespace-nowrap py-1.5 text-right font-medium xs:px-2.5 xs:py-2"
                >
                  {formatDateRange(rawData?.lastDate)}
                </td>
              </tr>
              <tr class="border-y border-gray-800 odd:bg-odd">
                <td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2">
                  <span>Volume in $</span>
                </td>
                <td
                  class="px-[5px] py-1.5 text-right font-medium xs:px-2.5 xs:py-2"
                >
                  {monthlyVolume}
                </td>
              </tr>
              <tr class="border-y border-gray-800 odd:bg-odd">
                <td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2">
                  <span>Retail Sentiment Range</span>
                </td>
                <td
                  class="px-[5px] py-1.5 text-right font-medium xs:px-2.5 xs:py-2"
                >
                  Between {lowestSentiment} to {highestSentiment}
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
