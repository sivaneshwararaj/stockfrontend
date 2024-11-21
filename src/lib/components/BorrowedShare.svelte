<script lang 'ts'></script>

<section class="overflow-hidden text-white h-full pb-8">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center">
      <label
        for="borrowedShareInfo"
        class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold"
      >
        Borrowed Share
      </label>
      <InfoModal
        title={"Borrowed Share Statistics"}
        content={"At Interactive Brokers, borrowed shares refer to shares lent by other investors for short selling. Borrowers pay a fee to lenders, aiming to profit from declining stock prices. Lenders earn interest on their lent shares, enhancing returns while still owning the stock."}
        id={"borrowedShareInfo"}
      />
    </div>

    {#if isLoaded}
      {#if rawData?.length !== 0}
        <div class="w-full flex flex-col items-start">
          <div class="text-white text-[1rem] mt-2 mb-2 w-full">
            Over the past six months, Interactive Brokers had {abbreviateNumber(
              totalAvailableShares,
            )} shares available for borrowing, with an average fee of {avgFee}%.
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
              Available Shares
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
              class="w-3 h-3 bg-[#22C55E] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2"
              aria-hidden="true"
            ></div>
            <span
              class="mt-2 sm:mt-0 text-white text-xs sm:text-md sm:font-medium inline-block"
            >
              Fee
            </span>
          </div>
        </div>

        <h2
          class="mt-10 mr-1 flex flex-row items-center text-white text-xl sm:text-2xl font-bold mb-3"
        >
          Latest Information
        </h2>

        <div class="flex justify-start items-center w-full m-auto">
          <table class="w-full" data-test="statistics-table">
            <tbody>
              <tr class="border-y border-gray-800 odd:bg-[#27272A]">
                <td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2">
                  <span>Date</span>
                </td>
                <td
                  class="px-[5px] py-1.5 text-right whitespace-nowrap font-medium xs:px-2.5 xs:py-2"
                >
                  {formatDateRange(rawData?.slice(-1)?.at(0)?.date)}
                </td>
              </tr>
              <tr class="border-y border-gray-800 odd:bg-[#27272A]">
                <td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2">
                  <span>Fee Range</span>
                </td>
                <td
                  class="px-[5px] py-1.5 text-right font-medium xs:px-2.5 xs:py-2"
                >
                  {lowestFee + "%" + "-" + highestFee + "%"}
                </td>
              </tr>
              <tr class="border-y border-gray-800 odd:bg-[#27272A]">
                <td class="px-[5px] py-1.5 xs:px-2.5 xs:py-2">
                  <span>Total Available Shares</span>
                </td>
                <td
                  class="px-[5px] py-1.5 text-right font-medium xs:px-2.5 xs:py-2"
                >
                  {abbreviateNumber(monthlyAvailableShares)}
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
