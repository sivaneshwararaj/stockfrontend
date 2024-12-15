<script lang 'ts'></script>

<section class="overflow-hidden text-white h-full pb-8 sm:pb-2">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center">
      <label
        for="enterpriseValueInfo"
        class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold"
      >
        Enterprise Value
      </label>
      <InfoModal
        title={"Enterprise Value"}
        content={"Enterprise value (EV) is a comprehensive measure of a company's total value in the stock market, considering market capitalization, debt, cash, and minority interests. It helps in M&A analysis, comparative analysis, valuation metrics, and capital structure assessment, aiding investors, analysts, and companies in financial decision-making."}
        id={"enterpriseValueInfo"}
      />
    </div>

    {#if isLoaded}
      {#if rawData?.length !== 0}
        <div class="mt-2 pb-4">
          <div class="w-full flex flex-col items-start">
            <div class="text-white text-[1rem] mt-1 sm:mt-3 mb-1 w-full">
              {$displayCompanyName}'s' enterprise value provides a comprehensive
              snapshot of its total worth, crucial for assessing its financial
              health and making informed investment decisions.
            </div>
          </div>

          <a
            href={"/stocks/" + $stockTicker + "/stats/income"}
            class="text-blue-400 hover:text-white flex justify-end mt-3 text-sm sm:text-[1rem]"
          >
            Full report
          </a>

          <div class="app w-full h-[300px] mt-5">
            <Chart {init} options={optionsData} class="chart" />
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
                class="w-3 h-3 bg-[#22C55E] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2"
                aria-hidden="true"
              ></div>
              <span
                class="mt-2 sm:mt-0 text-white text-center sm:text-start text-xs sm:text-md inline-block"
              >
                Enterprise Value
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
                Mkt Cap
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
                class="w-3 h-3 bg-[#3B82F6] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2"
                aria-hidden="true"
              ></div>
              <span
                class="mt-2 sm:mt-0 text-white text-xs sm:text-md inline-block"
              >
                Debt
              </span>
            </div>
            <div
              class="mt-3.5 sm:mt-0 flex flex-col sm:flex-row items-center sm:items-center ml-3 sm:ml-0 w-1/2 justify-center"
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
                Cash Equivalents
              </span>
            </div>
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
      height: 230px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
