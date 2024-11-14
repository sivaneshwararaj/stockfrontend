<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";
  import { getLastTradingDay } from "$lib/utils";
  import { page } from "$app/stores";
  import InfoModal from "$lib/components/InfoModal.svelte";

  export let data;
  const lastTradingDay = new Date(getLastTradingDay() ?? null)?.toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  $: categoryType = $page.url.pathname.split("/").pop();
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    Afterhours Top Stocks · stocknear
  </title>
  <meta
    name="description"
    content={`A list of the stocks with the highest percentage gain, highest percentage loss and most active today. See stock price, volume, market cap and more.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`Today's Afterhours Top Stocks · stocknear`}
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
    content={`Today's Afterhours Top Stocks · stocknear`}
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
            <a
              href="/market-mover/afterhours/gainers"
              class="p-2 px-5 cursor-pointer {categoryType === 'gainers'
                ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
            >
              Gainers
            </a>
            <a
              href="/market-mover/afterhours/losers"
              class="p-2 px-5 cursor-pointer {categoryType === 'losers'
                ? 'text-white bg-[#27272A] sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-[#27272A] sm:hover:bg-opacity-[0.95]'}"
            >
              Losers
            </a>
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
                Afterhours {categoryType === "gainers" ? "Gainers" : "Losers"}
              </h1>
              <InfoModal
                title={`${categoryType === "gainers" ? "Afterhours Gainers" : "Afterhours Losers"} Today`}
                content={`The stocks with the highest percentage ${categoryType === "gainers" ? "gains" : "loss"} in the afterhours, updated every two minutes during market closing. Excludes stocks with a market cap under 10M.`}
                id={"aftermarketId"}
              />

              <div
                class="mb-0 ml-5 mt-1 whitespace-nowrap text-sm font-semiboldt text-white"
              >
                <span class="hidden lg:inline">Updated</span>
                {lastTradingDay}
              </div>
              <div
                class="flex flex-row items-center justify-end w-fit sm:w-[50%] md:w-auto ml-auto"
              ></div>
            </div>
          </div>

          <slot />
        </div>
      </main>
    </div>
  </div>
</section>
