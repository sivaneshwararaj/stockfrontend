<script lang="ts">
  import {
    numberOfUnreadNotification,
    displayCompanyName,
    stockTicker,
  } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import Infobox from "$lib/components/Infobox.svelte";
  import FailToDeliver from "$lib/components/FailToDeliver.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let rawData = data?.getData || [];
  let changePercentageYearAgo = 0;
  let relativeFTD =
    data?.getStockQuote?.avgVolume > 0
      ? (
          (rawData?.slice(-1)?.at(0)?.failToDeliver /
            data?.getStockQuote?.avgVolume) *
          100
        )?.toFixed(2)
      : "n/a";

  function computeYearOverYearChange(rawData) {
    if (rawData.length < 2) {
      return null; // Not enough rawData to compute change
    }

    // Step 1: Get the last entry in the list
    const lastEntry = rawData[rawData.length - 1];
    const lastDate = new Date(lastEntry.date);
    const lastValue = rawData?.slice(-1)?.at(0).failToDeliver;

    // Step 2: Find the entry closest to one year before the last date
    let closestEntry = null;
    for (let i = rawData.length - 2; i >= 0; i--) {
      const entryDate = new Date(rawData[i].date);
      const oneYearAgo = new Date(lastDate);
      oneYearAgo.setFullYear(lastDate.getFullYear() - 1);

      // Check if the entry is close to one year ago
      if (entryDate <= oneYearAgo) {
        closestEntry = rawData[i];
        break;
      }
    }

    if (!closestEntry) {
      return null; // No suitable entry found for comparison
    }

    const prevValue = closestEntry?.failToDeliver;

    // Step 3: Calculate the percentage change
    const change = ((lastValue - prevValue) / prevValue) * 100;

    return change;
  }

  changePercentageYearAgo = computeYearOverYearChange(rawData);
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Fail-to-Deliver Shares`}
  description={`Historical Fail-to-Deliver shares of ${$displayCompanyName}.`}
/>

<section
  class="bg-default w-full overflow-hidden min-h-screen text-white h-full"
>
  <div class="w-full flex justify-center w-full sm-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <main class="w-full">
        <div class="sm:pl-7 sm:pb-7 sm:pt-7 m-auto mt-2 sm:mt-0">
          <div class="mb-3">
            <h1 class="text-xl sm:text-2xl text-white font-bold">
              Fail-to-Deliver (FTD)
            </h1>
          </div>

          {#if rawData?.length !== 0}
            <div class="grid grid-cols-1 gap-2">
              <div
                class="mb-4 bg-inherit flex flex-col divide-y divide-gray-600 rounded-md border border-gray-600 sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0"
              >
                <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
                  <div class="flex items-center justify-between sm:block">
                    <div class="text-[1rem] font-semibold text-white">
                      FTD Shares
                    </div>
                    <div
                      class="mt-1 break-words font-semibold leading-8 text-white text-xl sm:text-2xl"
                    >
                      {abbreviateNumber(
                        rawData?.slice(-1)?.at(0)?.failToDeliver,
                        false,
                      )}
                    </div>
                  </div>
                </div>
                <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
                  <div class="flex items-center justify-between sm:block">
                    <div class="text-[1rem] font-semibold text-white">
                      FTD / Avg Volume
                    </div>
                    <div
                      class="mt-1 break-words font-semibold leading-8 text-white text-xl sm:text-2xl"
                    >
                      {relativeFTD > 0.01
                        ? relativeFTD + "%"
                        : relativeFTD !== "n/a"
                          ? "< 0.01%"
                          : "n/a"}
                    </div>
                  </div>
                </div>
                <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
                  <div class="flex items-center justify-between sm:block">
                    <div class="text-[1rem] font-semibold text-white">
                      1-Year Change
                    </div>
                    <div
                      class="mt-1 break-words font-semibold leading-8 text-[1rem] sm:text-lg {changePercentageYearAgo >=
                        0 && changePercentageYearAgo !== null
                        ? "before:content-['+'] text-[#00FC50]"
                        : changePercentageYearAgo < 0 &&
                            changePercentageYearAgo !== null
                          ? 'text-[#FF2F1F]'
                          : 'text-white'}"
                    >
                      {changePercentageYearAgo !== null
                        ? abbreviateNumber(
                            changePercentageYearAgo?.toFixed(2),
                          ) + "%"
                        : "n/a"}
                    </div>
                  </div>
                </div>
              </div>

              <FailToDeliver {data} {rawData} />
            </div>
          {:else}
            <Infobox text="No data available" />
          {/if}
        </div>
      </main>
    </div>
  </div>
</section>
