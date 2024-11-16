<script lang="ts">
  import { screenWidth, numberOfUnreadNotification } from "$lib/store";
  import { abbreviateNumber, getLastTradingDay } from "$lib/utils";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import Table from "$lib/components/Table/Table.svelte";

  import { afterUpdate } from "svelte";
  export let data;
  let timePeriod = "1D";
  const lastTradingDay = new Date(getLastTradingDay() ?? null)?.toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
  const displayTitle = {
    "1D": "title Today",
    "1W": "Week title",
    "1M": "Month title",
    "1Y": "1 Year title",
    "3Y": "3 Year title",
    "5Y": "5 Year title",
  };
  let rawData = data?.getMarketMover[data?.getParams];

  const excludedRules = new Set([
    "volume",
    "price",
    "changesPercentage",
    "eps",
    "marketCap",
  ]);

  const defaultList = [
    { name: "Market Cap", rule: "marketCap" },
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Volume", rule: "volume" },
  ];

  function selectTimeInterval(state) {
    timePeriod = state;
  }

  let previousTimePeriod;
  let previousPage = data?.getParams;
  let title;

  afterUpdate(() => {
    if (timePeriod !== previousTimePeriod || previousPage !== data?.getParams) {
      previousTimePeriod = timePeriod;
      previousPage = data?.getParams;
      rawData = data?.getMarketMover[data?.getParams];
      title =
        data?.getParams?.charAt(0)?.toUpperCase() + data?.getParams?.slice(1);
    }
  });

  $: charNumber = $screenWidth < 640 ? 20 : 30;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Today's
    Top Stock {title} · stocknear
  </title>
  <meta
    name="description"
    content={`A list of the stocks with the highest percentage gain, highest percentage loss and most active today. See stock price, volume, market cap and more.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`Today's Top Stock ${title} · stocknear`}
  />
  <meta
    property="og:description"
    content={`A list of the stocks with the highest percentage gain, highest percentage loss and most active today. See stock price, volume, market cap and more.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`Today's Top Stock ${title} · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`A list of the stocks with the highest percentage gain, highest percentage loss and most active today. See stock price, volume, market cap and more.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section class="w-full overflow-hidden m-auto min-h-screen">
  <div class="flex justify-center w-full m-auto overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <main class="w-full">
        <!--Start Top Winners/Losers-->

        <nav class=" pt-1 overflow-x-scroll whitespace-nowrap">
          <ul
            class="flex flex-row items-center w-full text-sm sm:text-[1rem] text-white"
          >
            <li
              on:click={() => selectTimeInterval("1D")}
              class="p-2 px-5 cursor-pointer {timePeriod === '1D'
                ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
            >
              Today
            </li>
            <li
              on:click={() => selectTimeInterval("1W")}
              class="p-2 px-5 cursor-pointer {timePeriod === '1W'
                ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
            >
              Week
            </li>
            <li
              on:click={() => selectTimeInterval("1M")}
              class="p-2 px-5 cursor-pointer {timePeriod === '1M'
                ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
            >
              Month
            </li>
            <li
              on:click={() => selectTimeInterval("1Y")}
              class="p-2 px-5 cursor-pointer {timePeriod === '1Y'
                ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
            >
              Year
            </li>
            <li
              on:click={() => selectTimeInterval("3Y")}
              class="p-2 px-5 cursor-pointer {timePeriod === '3Y'
                ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
            >
              3 Years
            </li>
            <li
              on:click={() => selectTimeInterval("5Y")}
              class="p-2 px-5 cursor-pointer {timePeriod === '5Y'
                ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
            >
              5 Years
            </li>
          </ul>
        </nav>

        <div
          class="flex flex-col justify-center items-center overflow-hidden mt-10"
        >
          <div class="controls groups w-full">
            <div
              class="title-group flex flex-row items-center justify-start mb-3"
            >
              <h1 class="text-white text-xl sm:text-2xl font-semibold">
                {displayTitle[timePeriod]?.replace("title", title)}
              </h1>
              {#if timePeriod === "1D" && ["Gainers", "Losers"]?.includes(title)}
                <InfoModal
                  title={`${title} Today`}
                  content={`The stocks with the highest percentage ${title === "Gainers" ? "gains" : "loss"} today, updated every two minutes during market open. Excludes stocks with a market cap under 10M and volume under 50K.`}
                  id={"marketmoverId"}
                />
              {/if}

              <div
                class="mb-0 ml-5 mt-1 whitespace-nowrap text-sm font-semiboldt text-white"
              >
                <span class="hidden lg:inline">Updated</span>
                {lastTradingDay}
              </div>
            </div>
          </div>
          <Table
            {data}
            rawData={rawData[timePeriod]}
            {excludedRules}
            {defaultList}
          />
        </div>
      </main>
    </div>
  </div>
</section>
