<script lang="ts">
  import {
    displayCompanyName,
    numberOfUnreadNotification,
    stockTicker,
  } from "$lib/store";

  import ShareHolders from "$lib/components/ShareHolders.svelte";

  export let data;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) US Congress & Senate Trading ·
    stocknear
  </title>
  <meta
    name="description"
    content={`Get the latest US congress & senate trading of ${$displayCompanyName} (${$stockTicker}) from democrates and republicans.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) US Congress & Senate Trading · stocknear`}
  />
  <meta
    property="og:description"
    content={`Get the latest US congress & senate trading of ${$displayCompanyName} (${$stockTicker}) from democrates and republicans.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) US Congress & Senate Trading · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Get the latest US congress & senate trading of ${$displayCompanyName} (${$stockTicker}) from democrates and republicans.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section class="w-full bg-[#09090B] overflow-hidden text-white h-full">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
        <div class="w-full mb-6">
          <h1 class="text-xl sm:text-2xl text-white font-bold mb-4">
            13F Institute Ownership
          </h1>
        </div>

        <ShareHolders {data} />
      </div>
    </div>
  </div>
</section>
