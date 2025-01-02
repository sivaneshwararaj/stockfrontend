<script lang="ts">
  import {
    numberOfUnreadNotification,
    displayCompanyName,
    stockTicker,
  } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";

  import { onMount } from "svelte";
  import FailToDeliver from "$lib/components/FailToDeliver.svelte";

  export let data;

  let isLoaded = false;

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

  onMount(async () => {
    changePercentageYearAgo = computeYearOverYearChange(rawData);
    isLoaded = true;
  });
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) Fail-to-Deliver Shares · Stocknear
  </title>
  <meta
    name="description"
    content={`Historical Fail-to-Deliver shares of ${$stockTicker}.`}
  />
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Fail-to-Deliver Shares · Stocknear`}
  />
  <meta
    property="og:description"
    content={`Historical Fail-to-Deliver shares of ${$stockTicker}.`}
  />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Fail-to-Deliver Shares · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Historical Fail-to-Deliver shares of ${$stockTicker}.`}
  />
</svelte:head>

<section
  class="bg-default w-full overflow-hidden min-h-screen text-white h-full"
>
  <div class="w-full flex justify-center w-full sm-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if isLoaded}
        <main class="w-full">
          <div class="sm:p-7 m-auto mt-2 sm:mt-0">
            <div class="mb-3">
              <h1 class="text-xl sm:text-2xl text-white font-bold">
                Fail-to-Deliver (FTD)
              </h1>
            </div>

            {#if rawData?.length !== 0}
              <div class="grid grid-cols-1 gap-2">
                <div
                  class="mb-4 mt-5 bg-primary flex flex-col divide-y divide-gray-600 rounded-md border border-gray-600 sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0"
                >
                  <div class="px-4 py-3 sm:px-2 sm:py-5 md:px-3 lg:p-6">
                    <div class="flex items-center justify-between sm:block">
                      <div class="text-sm font-semibold text-white">
                        FTD Shares
                      </div>
                      <div
                        class="mt-1 break-words font-semibold leading-8 text-white tiny:text-lg xs:text-xl sm:text-2xl"
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
                      <div class="text-sm font-semibold text-white">
                        FTD / Avg Volume
                      </div>
                      <div
                        class="mt-1 break-words font-semibold leading-8 text-white tiny:text-lg xs:text-xl sm:text-2xl"
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
                      <div class="text-sm font-semibold text-white">
                        1-Year Change
                      </div>
                      <div
                        class="mt-1 break-words font-semibold leading-8 tiny:text-lg xs:text-xl sm:text-2xl {changePercentageYearAgo >=
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
              <h2
                class="mt-16 flex justify-center items-center text-2xl font-medium text-white mb-5 m-auto"
              >
                No data available
              </h2>
            {/if}
          </div>
        </main>
      {:else}
        <div class="w-full flex justify-center items-center h-80">
          <div class="relative">
            <label
              class="bg-odd rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <span class="loading loading-spinner loading-md text-gray-400"
              ></span>
            </label>
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
