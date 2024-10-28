<script lang="ts">
  import { stockTicker, screenWidth, coolMode } from "$lib/store";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";

  import { page } from "$app/stores";
  export let data;
  let displaySubSection = "income";

  function changeSubSection(state) {
    const subSectionMap = {
      income: "/financials/income",
      "balance-sheet": "/financials/balance-sheet",
      "cash-flow": "/financials/cash-flow",
      ratios: "/financials/ratios",
    };

    if (state !== "income" && subSectionMap[state]) {
      displaySubSection = state;
      //goto(`/stocks/${$stockTicker}${subSectionMap[state]}`);
    } else {
      displaySubSection = state;
      //goto(`/stocks/${$stockTicker}/financials`);
    }
  }

  $: {
    if ($page?.url?.pathname) {
      const parts = $page?.url?.pathname.split("/");
      const sectionMap = {
        income: "income",
        "balance-sheet": "balance-sheet",
        "cash-flow": "cash-flow",
        ratios: "ratios",
      };

      const foundSection = parts?.find((part) =>
        Object?.values(sectionMap)?.includes(part),
      );

      displaySubSection =
        Object?.keys(sectionMap)?.find(
          (key) => sectionMap[key] === foundSection,
        ) || "income";
    }
  }
</script>

<section class="w-full overflow-hidden min-h-screen">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full {$coolMode ? 'lg:w-3/4' : 'w-full'}  ">
          <div class="m-auto">
            <div
              class="-ml-2 sm:ml-8 w-screen sm:w-full {$screenWidth < 640
                ? 'overflow-auto scrollbar'
                : 'no-scrollbar'} mb-2"
            >
              <ul
                class="pr-4 sm:pr-0 w-screen flex flex-row items-center bg-[#09090B] overflow-x-scroll sm:overflow-hidden space-x-4 rtl:space-x-reverse py-2"
              >
                <li class="cursor-pointer flex flex-col items-center">
                  <a
                    href={`/stocks/${$stockTicker}/financials`}
                    on:click={() => changeSubSection("income")}
                    class="px-2 text-sm sm:text-[1rem] font-medium text-gray-400 sm:hover:text-white {displaySubSection ===
                    'income'
                      ? 'text-white '
                      : 'bg-[#09090B]'}"
                  >
                    Income
                  </a>
                  <div
                    class="{displaySubSection === 'income'
                      ? 'bg-[#75D377]'
                      : 'bg-[#09090B]'} mt-1 h-[3px] rounded-full w-[4rem]"
                  />
                </li>
                <li class="cursor-pointer flex flex-col items-center">
                  <a
                    href={`/stocks/${$stockTicker}/financials/balance-sheet`}
                    on:click={() => changeSubSection("balance-sheet")}
                    class="px-2 text-sm sm:text-[1rem] font-medium text-gray-400 sm:hover:text-white {displaySubSection ===
                    'balance-sheet'
                      ? 'text-white '
                      : 'bg-[#09090B]'}"
                  >
                    Balance Sheet
                  </a>
                  <div
                    class="{displaySubSection === 'balance-sheet'
                      ? 'bg-[#75D377]'
                      : 'bg-[#09090B]'} mt-1 h-[3px] rounded-full w-[2.5rem]"
                  />
                </li>
                <li class="cursor-pointer flex flex-col items-center">
                  <a
                    href={`/stocks/${$stockTicker}/financials/cash-flow`}
                    on:click={() => changeSubSection("cash-flow")}
                    class="px-2 text-sm sm:text-[1rem] font-medium text-gray-400 sm:hover:text-white {displaySubSection ===
                    'cash-flow'
                      ? 'text-white '
                      : 'bg-[#09090B]'}"
                  >
                    Cashflow
                  </a>
                  <div
                    class="{displaySubSection === 'cash-flow'
                      ? 'bg-[#75D377]'
                      : 'bg-[#09090B]'} mt-1 h-[3px] rounded-full w-[2.5rem]"
                  />
                </li>

                <li class="cursor-pointer flex flex-col items-center">
                  <a
                    href={`/stocks/${$stockTicker}/financials/ratios`}
                    on:click={() => changeSubSection("ratios")}
                    class="px-2 text-sm sm:text-[1rem] font-medium text-gray-400 sm:hover:text-white {displaySubSection ===
                    'ratios'
                      ? 'text-white '
                      : 'bg-[#09090B]'}"
                  >
                    Ratios
                  </a>
                  <div
                    class="{displaySubSection === 'ratios'
                      ? 'bg-[#75D377]'
                      : 'bg-[#09090B]'} mt-1 h-[3px] rounded-full w-[2rem]"
                  />
                </li>
              </ul>
            </div>
          </div>
          <slot />
        </main>

        {#if $coolMode}
          <aside class="hidden lg:block relative fixed w-1/4 ml-4">
            {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
              <div
                class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer"
              >
                <a
                  href="/pricing"
                  class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
                >
                  <div
                    class="w-full flex justify-between items-center p-3 mt-3"
                  >
                    <h2
                      class="text-start text-xl font-semibold text-white ml-3"
                    >
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
              class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer"
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
                  Build your watchlist to keep track of your favorite stocks.
                </span>
              </a>
            </div>

            <div
              class="w-full bg-[#141417] duration-100 ease-out sm:hover:text-white text-gray-400 sm:hover:border-gray-700 border border-gray-800 rounded-lg h-fit pb-4 mt-4 cursor-pointer"
            >
              <a
                href={"/analysts/top-stocks"}
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2 class="text-start text-xl font-semibold text-white ml-3">
                    Top Stocks
                  </h2>
                  <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
                </div>
                <span class="text-white p-3 ml-3 mr-3">
                  Get the latest top Wall Street Analyst Ratings
                </span>
              </a>
            </div>
          </aside>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .scrollbar {
    display: grid;
    grid-gap: 18px;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    grid-auto-flow: column;
    overflow-x: auto;
    scrollbar-width: thin; /* Hide the default scrollbar in Firefox */
    scrollbar-color: transparent transparent; /* Hide the default scrollbar in Firefox */
  }

  /* Custom scrollbar for Webkit (Chrome, Safari) */
  .scrollbar::-webkit-scrollbar {
    width: 0; /* Hide the width of the scrollbar */
    height: 0; /* Hide the height of the scrollbar */
  }

  .scrollbar::-webkit-scrollbar-thumb {
    background: transparent; /* Make the thumb transparent */
  }
</style>
