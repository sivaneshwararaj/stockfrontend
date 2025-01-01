<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";
  import { page } from "$app/stores";
  import { industryList } from "$lib/utils";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";

  export let data;

  function formatFilename(industryName) {
    let formattedName = industryName
      ?.replace(/ /g, "-")
      .replace(/&/g, "and")
      .replace(/-{2,}/g, "-")
      .toLowerCase();
    return formattedName;
  }

  let navigationIndustry = industryList.map((industry) => ({
    title: industry,
    link: `/list/industry/${formatFilename(industry)}`,
  }));

  let navigation = [
    {
      title: "Stock Lists",
      link: "/list",
    },
    {
      title: "Mega-Cap Stocks",
      link: "/list/market-cap/mega-cap-stocks",
    },
    {
      title: "Large-Cap Stocks",
      link: "/list/market-cap/large-cap-stocks",
    },
    {
      title: "Mid-Cap Stocks",
      link: "/list/market-cap/mid-cap-stocks",
    },
    {
      title: "Small-Cap Stocks",
      link: "/list/market-cap/small-cap-stocks",
    },
    {
      title: "Micro-Cap Stocks",
      link: "/list/market-cap/micro-cap-stocks",
    },
    {
      title: "Nano-Cap Stocks",
      link: "/list/market-cap/nano-cap-stocks",
    },
    {
      title: "All Stocks Listed on the NASDAQ",
      link: "/list/exchange/nasdaq",
    },
    {
      title: "All Stocks Listed on the NYSE",
      link: "/list/exchange/nyse",
    },
    {
      title: "All Stocks Listed on AMEX",
      link: "/list/exchange/amex",
    },
    {
      title: "Dow Jones Industrial Average Stocks List",
      link: "/list/index/dowjones",
    },
    {
      title: "NASDAQ 100 Index Stocks List",
      link: "/list/index/nasdaq100",
    },
    {
      title: "S&P 500 Index Stocks List",
      link: "/list/index/sp500",
    },
    {
      title: "German Companies on the US Stock Market",
      link: "/list/country/de",
    },
    {
      title: "Canadian Companies on the US Stock Market",
      link: "/list/country/ca",
    },
    {
      title: "Chinese Companies on the US Stock Market",
      link: "/list/cn",
    },
    {
      title: "Indian Companies on the US Stock Market",
      link: "/list/country/in",
    },
    {
      title: "Israeli Companies on the US Stock Market",
      link: "/list/country/il",
    },
    {
      title: "UK Companies on the US Stock Market",
      link: "/list/country/gb",
    },
    {
      title: "Japanese Companies on the US Stock Market",
      link: "/list/country/jp",
    },
    {
      title: "Financials Sector Stocks",
      link: "/list/sector/financial",
    },
    {
      title: "Healthcare Sector Stocks",
      link: "/list/sector/healthcare",
    },
    {
      title: "Technology Sector Stocks",
      link: "/list/sector/technology",
    },
    {
      title: "Industrials Sector Stocks",
      link: "/list/sector/industrials",
    },
    {
      title: "Energy Sector Stocks",
      link: "/list/sector/energy",
    },
    {
      title: "Utilities Sector Stocks",
      link: "/list/sector/utilities",
    },
    {
      title: "Consumer Cyclical Sector Stocks",
      link: "/list/sector/consumer-cyclical",
    },
    {
      title: "Real Estate Sector Stocks",
      link: "/list/sector/real-estate",
    },
    {
      title: "Basic Materials Sector Stocks",
      link: "/list/sector/basic-materials",
    },
    {
      title: "Communication Services Sector Stocks",
      link: "/list/sector/communication-services",
    },
    {
      title: "Consumer Defensive Sector Stocks",
      link: "/list/sector/consumer-defensive",
    },

    {
      title: "Bitcoin ETFs",
      link: "/list/bitcoin-etfs",
    },
    {
      title: "Magnificent Seven Stocks",
      link: "/list/magnificent-seven",
    },
    {
      title: "Dividend Kings",
      link: "/list/dividend/dividend-kings",
    },
    {
      title: "Dividend Aristocrats",
      link: "/list/dividend/dividend-aristocrats",
    },
    {
      title: "All Active REITs on the US Stock Market",
      link: "/list/reit-stocks",
    },
    {
      title: "FAANG Companies",
      link: "/list/faang",
    },
    {
      title: "Actively Traded Penny Stocks",
      link: "/list/penny-stocks",
    },
    {
      title: "Oversold Stocks",
      link: "/list/oversold-stocks",
    },
    {
      title: "Overbought Stocks",
      link: "/list/overbought-stocks",
    },
    {
      title: "Top-Rated Dividend Stocks",
      link: "/list/top-rated-dividend-stocks",
    },
    {
      title: "Biggest U.S. Companies by Revenue",
      link: "/list/highest-revenue",
    },
    {
      title: "Biggest U.S. Companies by Income Taxes",
      link: "/list/highest-income-tax",
    },
    {
      title: "Biggest U.S. Employers",
      link: "/list/most-employees",
    },
    {
      title: "Biggest Companies with Failed-to-Deliver Shares",
      link: "/list/most-ftd-shares",
    },
    {
      title: "Most Shorted Stocks",
      link: "/list/most-shorted-stocks",
    },
    {
      title: "Hottest Options Contracts",
      link: "/list/hottest-contracts",
    },
  ];

  navigation = [...navigationIndustry, ...navigation];
  let updatedNavigation = navigation?.map((item) => {
    return {
      ...item,
      link: item.link + "/",
    };
  });

  const combinedNavigation = navigation?.concat(updatedNavigation);
</script>

<svelte:head>
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Stock
    Lists · Stocknear</title
  >
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />

  <meta
    name="description"
    content="Lists of stocks that share common characteristics. See companies ranked by market cap, employee count, sales or others."
  />
  <!-- Other meta tags -->
  <meta property="og:title" content="Stock Lists · Stocknear" />
  <meta
    property="og:description"
    content="Lists of stocks that share common characteristics. See companies ranked by market cap, employee count, sales or others."
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Stock Lists · Stocknear" />
  <meta
    name="twitter:description"
    content="Lists of stocks that share common characteristics. See companies ranked by market cap, employee count, sales or others."
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section
  class="w-full max-w-3xl sm:max-w-screen-2xl overflow-hidden min-h-screen pt-5 px-4 lg:px-3 mb-20"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      {#if $page.url.pathname.startsWith("/list/industry")}
        <li><a href="/industry" class="text-gray-300">Industry</a></li>
      {:else}
        <li><a href="/list/" class="text-gray-300">Lists</a></li>
      {/if}
      {#if $page.url.pathname.startsWith("/list/")}
        <li>
          <span class="text-gray-300">
            {combinedNavigation?.find(
              (item) => item?.link === $page.url.pathname,
            )?.title}
          </span>
        </li>
      {/if}
    </ul>
  </div>

  <div class="mt-10 sm:mt-5 w-full m-auto mb-10 bg-default overflow-hidden">
    <!--Start Top Winners/Losers-->
    <div class="flex flex-col justify-center items-center">
      <div class="ml-2 text-start w-full text-white mb-2">
        {#each navigation as item}
          {#if item?.link === $page.url.pathname}
            <span class="font-bold text-2xl">
              {item?.title}
            </span>
          {/if}
        {/each}
      </div>

      <div class="border-b-[2px] w-full mb-7" />

      <div class="flex justify-center w-full m-auto overflow-hidden">
        <main class="w-full lg:w-3/4 lg:pr-10">
          <slot />
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 -mt-4">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-primary sm:hover:bg-secondary transition ease-out duration-100"
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
                  Upgrade now for unlimited access to all data and tools.
                </span>
              </a>
            </div>
          {/if}

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-primary sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href={"/watchlist/stocks"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Watchlist
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Build your watchlist to keep track of their performance.
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-primary sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href={"/stock-screener"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Stock Screener
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Build your Stock Screener to find profitable stocks.
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
