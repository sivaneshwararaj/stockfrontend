<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";

  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import Table from "$lib/components/Table/Table.svelte";

  export let data;

  let rawData = data?.getSentimentTracker ?? [];
  const excludedRules = new Set([
    "volume",
    "price",
    "sentiment",
    "changesPercentage",
    "eps",
    "marketCap",
  ]);

  const defaultList = [
    { name: "Market Cap", rule: "marketCap" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Sentiment", rule: "sentiment" },
  ];

  const specificRows = [
    { name: "Sentiment", rule: "sentiment", type: "sentiment" },
  ];

  const hideLastRow = true;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Sentiment
    Tracker · stocknear
  </title>
  <meta
    name="description"
    content={`Stay ahead of the market with our real-time filtering of the most discussed and bullish stocks on social media. Discover trending stocks and make informed investment decisions today!`}
  />

  <!-- Other meta tags -->
  <meta property="og:title" content={`Sentiment Tracker · stocknear`} />
  <meta
    property="og:description"
    content={`Stay ahead of the market with our real-time filtering of the most discussed and bullish stocks on social media. Discover trending stocks and make informed investment decisions today!`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`Sentiment Tracker · stocknear`} />
  <meta
    name="twitter:description"
    content={`Stay ahead of the market with our real-time filtering of the most discussed and bullish stocks on social media. Discover trending stocks and make informed investment decisions today!`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Sentiment Tracker</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Sentiment Tracker
            </h1>
          </div>

          <div
            class="mb-8 w-full text-start sm:flex sm:flex-row sm:items-center m-auto text-gray-100 border border-gray-800 sm:rounded-md h-auto p-5"
          >
            <svg
              class="w-5 h-5 inline-block sm:mr-2 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              ><path
                fill="#fff"
                d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
              /></svg
            >
            We update our data in realtime to provide you with the latest trends
            and the most bullish stocks being discussed on Twitter and StockTwits
          </div>

          <div class="w-full m-auto mt-20 sm:mt-10">
            <Table
              {data}
              {rawData}
              {excludedRules}
              {defaultList}
              {hideLastRow}
              {specificRows}
            />

            <UpgradeToPro
              {data}
              title="Get the latest stock trends from social media to never miss out the next hype"
            />
          </div>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
            >
              <a
                href="/pricing"
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2 class="text-start text-xl font-semibold text-white ml-3">
                    Pro Subscription
                  </h2>
                  <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
                </div>
                <span class="text-white p-3 ml-3 mr-3">
                  Upgrade now for unlimited access to all data and tools.
                </span>
              </a>
            </div>
          {/if}

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href="cramer-tracker"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Cramer Tracker
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Follow Jim Cramer latest stock picks
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href="/reddit-tracker"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Reddit Tracker
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest trends of r/Wallstreetbets
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
