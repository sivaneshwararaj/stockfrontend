<script lang="ts">
  import {
    numberOfUnreadNotification,
    displayCompanyName,
    stockTicker,
  } from "$lib/store";
  import Infobox from "$lib/components/Infobox.svelte";
  import VaR from "$lib/components/VaR.svelte";

  export let data;

  let rawData = data?.getVaR || {};
  if (!rawData?.history || !data?.getHistoricalPrice) {
    console.error(
      "Missing required data: rawData.history or data.getHistoricalPrice is undefined.",
    );
  } else {
    for (let i = 0; i < rawData.history.length; i++) {
      const entry = rawData.history[i];
      const entryMonth = entry?.date; // "YYYY-MM" format

      let matchingData = null;

      // Find the first price at the beginning of the month
      for (let j = 0; j < data.getHistoricalPrice.length; j++) {
        const priceData = data.getHistoricalPrice[j];

        // Extract year and month from the `time` field
        const priceDate = priceData?.time?.slice(0, 7); // "YYYY-MM" format
        if (priceDate === entryMonth) {
          matchingData = priceData;
          break; // Use the first matching entry
        }
      }

      // Add the 'close' price to the entry if matching data is found
      if (matchingData) {
        entry.price = matchingData.close;
      } else {
        console.warn(`No matching data found for month: ${entry?.date}`);
      }
    }
  }
  console.log(rawData);
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) Value-at-Risk Stocknear
  </title>
  <meta
    name="description"
    content={`Historical Value-at-Risk of ${$stockTicker}.`}
  />
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Value-at-Risk · Stocknear`}
  />
  <meta
    property="og:description"
    content={`Historical Value-at-Risk of ${$stockTicker}.`}
  />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Value-at-Risk · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Historical Value-at-Risk of ${$stockTicker}.`}
  />
</svelte:head>

<section
  class="bg-default w-full overflow-hidden min-h-screen text-white h-full"
>
  <div class="w-full flex justify-center w-full sm-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <main class="w-full">
        <div class="sm:p-7 m-auto mt-2 sm:mt-0">
          {#if rawData?.length !== 0}
            <div class="grid grid-cols-1 gap-2">
              <VaR {data} {rawData} />
            </div>
          {:else}
            <Infobox text="No data available" />
          {/if}
        </div>
      </main>
    </div>
  </div>
</section>
