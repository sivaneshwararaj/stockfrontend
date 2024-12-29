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

  export let data;
  let historicalDarkPool = data?.getHistoricalDarkPool || [];
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$stockTicker}) Dividend History, Dates & Yield ·
    stocknear
  </title>

  <meta
    name="description"
    content={`Get the latest dividend data for ${$displayCompanyName} (${$stockTicker}) stock price quote with breaking news, financials, statistics, charts and more.`}
  />
  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$stockTicker}) Dividend History, Dates & Yield · Stocknear`}
  />
  <meta
    property="og:description"
    content={`Get the latest dividend data for ${$displayCompanyName} (${$stockTicker}), including dividend history, yield, key dates, growth and other metrics.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$stockTicker}) Dividend History, Dates & Yield · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Get the latest dividend data for ${$displayCompanyName} (${$stockTicker}) stock price quote with breaking news, financials, statistics, charts and more.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section class="w-full bg-default overflow-hidden text-white h-full">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:p-7 w-full m-auto mt-2 sm:mt-0">
        <div class="w-full mb-2">
          <div class="flex flex-row items-center">
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
          <Infobox
            text="Track the Dark Pool Trades of major whales to monitor hidden trading activity and trends."
          />
        </div>

        <PriceLevel
          rawData={data?.getPriceLevel?.priceLevel}
          metrics={data?.getPriceLevel?.metrics}
        />
        <HottestTrades rawData={data?.getPriceLevel?.hottestTrades} />
        <HistoricalVolume rawData={historicalDarkPool} />
      </div>
    </div>
  </div>
</section>

<style>
  .app {
    height: 400px;
    width: 100%;
  }

  @media (max-width: 560px) {
    .app {
      width: 100%;
      height: 300px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
