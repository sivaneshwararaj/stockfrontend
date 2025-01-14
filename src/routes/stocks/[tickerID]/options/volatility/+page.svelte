<script lang="ts">
  import {
    stockTicker,
    numberOfUnreadNotification,
    displayCompanyName,
  } from "$lib/store";

  import Infobox from "$lib/components/Infobox.svelte";

  import Volatility from "$lib/components/Options/Volatility.svelte";

  export let data;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) Volatility · Stocknear
  </title>
  <meta
    name="description"
    content={`Track volatility and implied volatility trends with our interactive chart. Analyze price movements, 30-day implied volatility, and realized volatility to make data-driven trading decisions.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Volatility · Stocknear`}
  />
  <meta
    property="og:description"
    content={`Track volatility and implied volatility trends with our interactive chart. Analyze price movements, 30-day implied volatility, and realized volatility to make data-driven trading decisions.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Volatility · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Track volatility and implied volatility trends with our interactive chart. Analyze price movements, 30-day implied volatility, and realized volatility to make data-driven trading decisions.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full bg-default overflow-hidden text-white min-h-screen pb-40"
>
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if data?.getData?.length > 0}
        <Volatility {data} />
      {:else}
        <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
          <div class="mt-2">
            <Infobox text="No data is available" />
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
