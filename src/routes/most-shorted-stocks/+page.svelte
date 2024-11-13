<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";
  import Table from "$lib/components/Table/Table.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  export let data;

  const excludedRules = new Set([
    "volume",
    "price",
    "shortRatio",
    "sharesShort",
    "shortOutStandingPercent",
    "shortFloatPercent",
    "changesPercentage",
  ]);

  const defaultList = [
    { name: "Short Ratio", rule: "shortRatio" },
    { name: "Short Interest", rule: "sharesShort" },
    { name: "Short % Shares", rule: "shortOutStandingPercent" },
    { name: "Short % Float", rule: "shortFloatPercent" },
  ];
  const hideLastRow = true;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} High
    Short Interest Stocks · stocknear
  </title>
  <meta
    name="description"
    content={`Short interest, stock short squeeze, short interest ratio & short selling data positions for NASDAQ, NYSE & AMEX stocks to find shorts in the stock market.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`High Short Interest Stocks · stocknear`}
  />
  <meta
    property="og:description"
    content={`Short interest, stock short squeeze, short interest ratio & short selling data positions for NASDAQ, NYSE & AMEX stocks to find shorts in the stock market.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`High Short Interest Stocks · stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Short interest, stock short squeeze, short interest ratio & short selling data positions for NASDAQ, NYSE & AMEX stocks to find shorts in the stock market.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-screen-2xl overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Top Shorted Stocks</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="mb-6 border-b-[3px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Top Shorted Stocks
            </h1>
            <p class="mb-3 px-1 text-base font-semibold text-muted sm:px-0">
              High short-interest stocks are volatile and prone to short
              squeezes.
            </p>
          </div>

          <div class="w-full m-auto mt-20 sm:mt-10">
            <Table
              {data}
              rawData={data?.getMostShortedStocks}
              {excludedRules}
              {defaultList}
              {hideLastRow}
            />
          </div>

          <UpgradeToPro
            {data}
            title="Get stock forecasts from Wall Street's highest rated professionals"
          />
        </main>
        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
            >
              <a
                href={"/pricing"}
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2 class="text-start text-xl font-semibold text-white ml-3">
                    Pro Subscription
                  </h2>
                  <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
                </div>
                <span class="text-white p-3 ml-3 mr-3">
                  Upgrade now for unlimited access to all data and tools
                </span>
              </a>
            </div>
          {/if}

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href={"/analysts"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Top Analyst
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Wall Street analyst ratings
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer"
          >
            <a
              href={"/analysts/top-stocks"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Top Stocks Picks
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Wall Street analyst ratings.
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
