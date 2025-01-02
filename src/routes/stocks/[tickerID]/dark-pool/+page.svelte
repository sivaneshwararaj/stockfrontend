<script lang="ts">
  import {
    numberOfUnreadNotification,
    displayCompanyName,
    stockTicker,
  } from "$lib/store";
  import HistoricalVolume from "$lib/components/DarkPool/HistoricalVolume.svelte";
  import PriceLevel from "$lib/components/DarkPool/PriceLevel.svelte";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import HottestTrades from "$lib/components/DarkPool/HottestTrades.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import { onMount } from "svelte";

  export let data;
  let historicalDarkPool = data?.getHistoricalDarkPool || [];
  let priceLevel = data?.getPriceLevel?.priceLevel || [];
  let hottestTrades = data?.getPriceLevel?.hottestTrades || [];
  let isLoaded = false;
  onMount(() => {
    isLoaded = true;
  });
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) Dark Pool Trades · Stocknear
  </title>

  <meta
    name="description"
    content={`Get the latest dark pool trade insights for ${$displayCompanyName} (${$stockTicker}), including stock price quote, financials, news, statistics, and charts.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Dark Pool Trades · Stocknear`}
  />
  <meta
    property="og:description"
    content={`Get the latest dark pool trade information for ${$displayCompanyName} (${$stockTicker})`}
  />
  <meta property="og:type" content="website" />

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Dark Pool Trades · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Get the latest dark pool trade insights for ${$displayCompanyName} (${$stockTicker}), including stock price quote, financials, statistics, and more.`}
  />
</svelte:head>

<section class="w-full bg-default overflow-hidden text-white h-full">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
        <div class="w-full mb-2">
          <div class="flex flex-row items-center mb-4 sm:mb-0">
            <label
              for="darkPoolInfo"
              class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-2xl font-bold"
            >
              Dark Pool Data
            </label>
            <InfoModal
              title={"Dark Pool Data"}
              content={"Dark pool data refers to information on trading activities that occur in private, non-public financial exchanges known as dark pools. These venues are used by hedge funds and major institutional traders to buy and sell large blocks of securities without exposing their orders to the public, minimizing market impact and price fluctuations. Currently, nearly 50% of all trades are executed in these dark pools, highlighting their significant role in the trading landscape."}
              id={"darkPoolInfo"}
            />
          </div>
          {#if priceLevel?.length === 0 && hottestTrades?.length === 0 && historicalDarkPool?.length === 0}
            <Infobox
              text={`No Dark Pool activity are detected for ${$displayCompanyName}`}
            />
          {:else}
            <Infobox
              text="Track the Dark Pool Trades of major whales to monitor hidden trading activity and trends."
            />
          {/if}
        </div>
        {#if isLoaded}
          {#if priceLevel?.length > 0}
            <PriceLevel
              rawData={priceLevel}
              metrics={data?.getPriceLevel?.metrics}
            />
          {/if}
          {#if data?.user?.tier === "Pro"}
            {#if hottestTrades?.length > 0}
              <HottestTrades rawData={hottestTrades} />
            {/if}
            {#if historicalDarkPool?.length > 10}
              <HistoricalVolume rawData={historicalDarkPool} />
            {/if}
          {:else}
            <UpgradeToPro {data} />
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
      </div>
    </div>
  </div>
</section>
