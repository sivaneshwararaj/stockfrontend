<script lang="ts">
  import {
    governmentContractComponent,
    displayCompanyName,
    stockTicker,
    screenWidth,
    getCache,
    setCache,
  } from "$lib/store";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { Chart } from "svelte-echarts";
  import { abbreviateNumber } from "$lib/utils";

  import { init, use } from "echarts/core";
  import { BarChart } from "echarts/charts";
  import { GridComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  use([BarChart, GridComponent, CanvasRenderer]);

  let isLoaded = false;
  let rawData = [];
  let optionsData;
  let avgNumberOfContracts = 0;
  let displayMaxContracts = 0;
  let displayYear = "n/a";
  let totalAmount;
  let totalContract;

  function getPlotOptions() {
    let dates = [];
    let amountList = [];
    let numList = [];

    rawData?.forEach((item) => {
      const fiscalYear = "FY" + item?.year?.slice(2);
      dates?.push(fiscalYear);
      amountList?.push(item?.amount);
      numList?.push(item?.numOfContracts);
    });

    totalContract = rawData?.reduce(
      (sum, item) => sum + item?.numOfContracts,
      0,
    );
    totalAmount = rawData?.reduce((sum, item) => sum + item?.amount, 0);

    avgNumberOfContracts = Math.floor(totalContract / rawData?.length);
    const { year: yearWithMaxContracts, numOfContracts: maxContracts } =
      rawData?.reduce(
        (max, contract) =>
          contract?.numOfContracts > max?.numOfContracts ? contract : max,
        rawData?.at(0),
      );
    displayYear = yearWithMaxContracts;
    displayMaxContracts = maxContracts;

    const option = {
      silent: true,
      tooltip: {
        trigger: "axis",
        hideDelay: 100, // Set the delay in milliseconds
      },
      animation: false,
      grid: {
        left: "2%",
        right: $screenWidth < 640 ? "0%" : "2%",
        bottom: "0%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        data: dates,
        type: "category",
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
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false, // Hide y-axis labels
          },
          position: "right",
        },
      ],
      series: [
        {
          name: "# of Contracts",
          data: numList,
          type: "line",
          yAxisIndex: 1,
          itemStyle: {
            color: "#fff", // Change bar color to white
          },
        },
        {
          name: "Amount",
          data: amountList,
          type: "bar",
          itemStyle: {
            color: "#fff", // Change bar color to orange
          },
        },
      ],
    };

    return option;
  }

  const getGovernmentContract = async (ticker) => {
    const cachedData = getCache(ticker, "getGovernmentContract");
    if (cachedData) {
      rawData = cachedData;
    } else {
      const postData = { ticker: ticker, path: "government-contract" };
      const response = await fetch("/api/ticker-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      rawData = await response?.json();
      setCache(ticker, rawData, "getGovernmentContract");
    }

    governmentContractComponent.set(rawData?.length !== 0);
  };

  $: {
    if ($stockTicker && typeof window !== "undefined") {
      isLoaded = false;
      const ticker = $stockTicker;
      const asyncFunctions = [getGovernmentContract(ticker)];

      Promise.all(asyncFunctions)
        .then(() => {
          if (rawData?.length !== 0) {
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

<section class="overflow-hidden text-white h-full pb-8">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center">
      <label
        for="governmentContractInfo"
        class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold"
      >
        US Government Contract
      </label>
      <InfoModal
        title={"Government Contract"}
        content={"Government contracts are agreements between the local government and companies for goods or services. They can be substantial revenue sources for companies, particularly in sectors like defense, technology, and infrastructure. Winning contracts can enhance a company's stability and credibility, but it often involves competitive bidding and compliance with strict regulations."}
        id={"governmentContractInfo"}
      />
    </div>

    {#if isLoaded}
      {#if rawData?.length !== 0}
        <div class="w-full flex flex-col items-start">
          <div class="text-white text-sm sm:text-[1rem] mt-2 mb-2 w-full">
            Since 2015, {$displayCompanyName} has secured a total of {totalContract}
            government contracts, amassing {abbreviateNumber(totalAmount, true)}
            in revenue. The company has averaged {avgNumberOfContracts} contracts
            per year, with a peak of {displayMaxContracts} contracts in {displayYear}.
          </div>
        </div>

        <div class="pb-2 rounded-md bg-[#09090B]">
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
              # of Contracts
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
              class="w-3 h-3 bg-[#FFAD24] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2"
              aria-hidden="true"
            ></div>
            <span
              class="mt-2 sm:mt-0 text-white text-xs sm:text-md sm:font-medium inline-block"
            >
              Amount
            </span>
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
