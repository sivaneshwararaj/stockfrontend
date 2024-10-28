<script lang 'ts'></script>

<section class="overflow-hidden text-white h-full pb-10 sm:pb-0">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center">
      <label
        for="varInfo"
        class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold"
      >
        Value at Risk
      </label>
      <InfoModal
        title={"Value at Risk"}
        content={`Value at Risk (VaR) quantifies the potential loss of investment or capital within a specified time frame (N days) under typical market conditions, providing an estimate of potential losses with a given probability for ${$displayCompanyName}.`}
        id={"varInfo"}
      />
    </div>

    {#if Object?.keys(varDict)?.length !== 0}
      <div class="pb-4 w-full mt-5">
        <div
          class="w-auto p-4 sm:p-6 bg-[#09090B] sm:bg-[#09090B] rounded-lg relative"
        >
          <div class="flex flex-row items-center justify-between">
            <div class="relative size-[60px] sm:size-[90px] ml-auto">
              <svg
                class="size-full w-[60px] h-[60px] sm:w-[90px] sm:h-[90px]"
                viewBox="0 0 36 36"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- Background Circle -->
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  class="stroke-current text-[#303030]"
                  stroke-width="4"
                ></circle>
                <!-- Progress Circle inside a group with rotation -->
                <g class="origin-center -rotate-90 transform">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    class="stroke-current {rating > 5
                      ? 'text-[#00FC50]'
                      : rating < 5
                        ? 'text-[#FF2F1F]'
                        : 'text-white'} "
                    stroke-width="4"
                    stroke-dasharray="100"
                    stroke-dashoffset={100 - rating * 10}
                  ></circle>
                </g>
              </svg>
              <!-- Percentage Text -->
              <div
                class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2"
              >
                <span
                  class="text-center text-white text-xl sm:text-2xl font-semibold"
                >
                  {rating}
                </span>
              </div>
            </div>

            <div
              class="flex flex-col items-start ml-4 sm:ml-10 mr-auto sm:-top-3 sm:relative"
            >
              <h3
                class="hidden sm:block text-gray-300 text-[1rem] sm:text-lg font-semibold"
              >
                <span
                  class={outlook === "Minimum Risk"
                    ? "text-[#10BC09]"
                    : outlook === "Risky"
                      ? "text-red-500"
                      : "text-white"}>{outlook}</span
                > outlook:
              </h3>
              <span class="text-gray-200 text-sm sm:text-lg mt-1">
                Under typical market conditions, there is a <span
                  class="font-semibold">95%</span
                >
                probability that
                <span class="text-blue-400"
                  >${$assetType === "stock"
                    ? $stockTicker
                    : $assetType === "etf"
                      ? $etfTicker
                      : $cryptoTicker}</span
                >
                will incur a maximum loss of
                <span class="text-[#FF2F1F] font-semibold">{valueAtRisk}%</span>
                in the upcoming week.
              </span>
            </div>
          </div>
        </div>
      </div>

      <h2 class="text-white text-xl sm:text-2xl font-semibold mt-5">
        Historical VaR
      </h2>
      <div class="text-white text-[1rem] mt-3">
        Based on historical price data, the company experienced an average
        monthly Value at Risk (VaR) of {monthlyVarAvg}%.
      </div>

      <div class="app w-full h-[300px] mt-5">
        <Chart {init} options={optionsData} class="chart" />
      </div>
    {:else}
      <h2
        class="mt-10 mb-5 flex justify-center items-center text-2xl font-bold text-slate-700 m-auto"
      >
        No data available
      </h2>
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
