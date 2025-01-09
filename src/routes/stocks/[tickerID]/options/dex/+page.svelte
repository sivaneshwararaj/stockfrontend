<script lang="ts">
  import {
    stockTicker,
    numberOfUnreadNotification,
    displayCompanyName,
  } from "$lib/store";
  import Infobox from "$lib/components/Infobox.svelte";
  import GreekExposure from "$lib/components/Options/GreekExposure.svelte";

  export let data;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) Delta Exposure · Stocknear
  </title>
  <meta
    name="description"
    content={`Explore historic volume & open interest of option chains & save individual contracts for later`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Delta Exposure · Stocknear`}
  />
  <meta
    property="og:description"
    content={`Explore historic volume & open interest of option chains & save individual contracts for later`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Delta Exposure · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Explore historic volume & open interest of option chains & save individual contracts for later`}
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
        <GreekExposure {data} title="Delta" params="" />
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
