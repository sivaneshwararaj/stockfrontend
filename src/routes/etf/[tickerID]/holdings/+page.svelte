<script lang="ts">
  import {
    etfTicker,
    numberOfUnreadNotification,
    displayCompanyName,
  } from "$lib/store";
  import { formatString } from "$lib/utils";
  import Table from "$lib/components/Table/Table.svelte";

  export let data;
  let rawData = data?.getETFHoldings;
  const excludedRules = new Set([
    "price",
    "changesPercentage",
    "sharesNumber",
    "weightPercentage",
  ]);

  const defaultList = [
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Shares", rule: "sharesNumber" },
    { name: "% Weight", rule: "weightPercentage" },
  ];

  const specificRows = [
    { name: "% Weight", rule: "weightPercentage", type: "float" },
    { name: "Shares", rule: "sharesNumber", type: "int" },
  ];
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$etfTicker}) Holdings List · stocknear
  </title>
  <meta
    name="description"
    content={`Get the Holdings List of ${$displayCompanyName} (${$etfTicker}).`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$etfTicker}) Holdings List · stocknear`}
  />
  <meta
    property="og:description"
    content={`Get the Holdings List of ${$displayCompanyName} (${$etfTicker}).`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$etfTicker}) Holdings List · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Get the Holdings List of ${$displayCompanyName} (${$etfTicker}).`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="bg-[#09090B] overflow-hidden text-white h-full mb-40 sm:mb-0 w-full"
>
  <div class="flex justify-center m-auto h-full overflow-hidden w-full">
    <div
      class="relative flex justify-center items-center overflow-hidden w-full"
    >
      <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
        <div class="mb-6">
          <h2 class="text-2xl sm:text-3xl text-gray-200 font-bold mb-4">
            ETF Holdings
          </h2>

          <div
            class="text-white p-3 sm:p-5 mb-10 rounded-lg sm:flex sm:flex-row sm:items-center border border-slate-800 text-sm sm:text-[1rem]"
          >
            <svg
              class="w-6 h-6 flex-shrink-0 inline-block sm:mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              ><path
                fill="#fff"
                d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
              /></svg
            >

            {#if rawData?.length !== 0}
              The {$displayCompanyName} holds {rawData?.length} different assets
              and the largest one in the portfolio is {formatString(
                rawData?.at(0)?.name,
              )}, making up {rawData?.at(0)?.weightPercentage?.toFixed(2)}% of
              the total.
            {:else}
              No information available for {$displayCompanyName}.
            {/if}
          </div>
        </div>

        {#if rawData?.length !== 0}
          <Table
            {data}
            {rawData}
            {excludedRules}
            {defaultList}
            {specificRows}
          />
        {:else}
          <h2
            class="pl-4 pr-4 flex justify-center items-center text-md sm:text-lg text-center text-slate-200"
          >
            No holdings are available for {$displayCompanyName}.
          </h2>
        {/if}
      </div>
    </div>
  </div>
</section>
