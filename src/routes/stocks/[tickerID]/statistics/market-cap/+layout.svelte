<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";

  export let data;
  const similarStocks = data?.getSimilarStocks;

  function getMarketCapCategory(marketCap) {
    const BILLION = 1_000_000_000;
    const MILLION = 1_000_000;

    const marketCapNavigation = [
      {
        threshold: 200 * BILLION,
        name: "Mega-Cap",
        link: "/list/market-cap/mega-cap-stocks",
      },
      {
        minThreshold: 10 * BILLION,
        maxThreshold: 200 * BILLION,
        name: "Large-Cap",
        link: "/list/market-cap/large-cap-stocks",
      },
      {
        minThreshold: 2 * BILLION,
        maxThreshold: 10 * BILLION,
        name: "Mid-Cap",
        link: "/list/market-cap/mid-cap-stocks",
      },
      {
        minThreshold: 300 * MILLION,
        maxThreshold: 2 * BILLION,
        name: "Small-Cap",
        link: "/list/market-cap/small-cap-stocks",
      },
      {
        minThreshold: 50 * MILLION,
        maxThreshold: 300 * MILLION,
        name: "Micro-Cap",
        link: "/list/market-cap/micro-cap-stocks",
      },
      {
        maxThreshold: 50 * MILLION,
        name: "Nano-Cap",
        link: "/list/market-cap/nano-cap-stocks",
      },
    ];

    if (!marketCap) return null;

    // Convert string to number if needed
    const capValue =
      typeof marketCap === "string" ? parseFloat(marketCap) : marketCap;

    return marketCapNavigation.find((category) => {
      if (category.threshold) {
        return capValue >= category.threshold;
      }
      if (category.minThreshold && category.maxThreshold) {
        return (
          capValue >= category.minThreshold && capValue < category.maxThreshold
        );
      }
      if (category.maxThreshold) {
        return capValue < category.maxThreshold;
      }
      return false;
    });
  }

  let capCategory = getMarketCapCategory(data?.getStockQuote?.marketCap);
</script>

<section class="w-full overflow-hidden">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex flex-col lg:flex-row justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-10">
          <slot />
        </main>

        <aside class="inline-block relative w-full lg:w-1/4 mt-3">
          {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial}
            <div
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
            >
              <a
                href="/pricing"
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2
                    class="text-start text-xl font-semibold text-white sm:ml-3"
                  >
                    Pro Subscription
                  </h2>
                  <ArrowLogo class="w-6 h-6 sm:w-8 sm:h-8 mr-3 flex-shrink-0" />
                </div>
                <span class="text-white p-3 sm:ml-3 sm:mr-3">
                  Upgrade now for unlimited access to all data and tools.
                </span>
              </a>
            </div>
          {/if}

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 bg-inherit transition ease-out duration-100"
          >
            <div class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0">
              <div class="pl-4 pr-4">
                <div class="w-full flex justify-between items-center mt-3">
                  <h2 class="text-start text-xl font-semibold text-white">
                    Market Capitalization
                  </h2>
                </div>
                <span class="text-white">
                  Market capitalization, also called net worth, is the total
                  value of all of a company's outstanding shares. It is
                  calculated by multiplying the stock price by the number of
                  shares outstanding.
                  <br />
                  <br />
                  Formula: Market Cap = Stock Price * Shares Outstanding
                </span>
              </div>
            </div>
          </div>

          {#if similarStocks?.length > 0}
            <div
              class="w-full p-2 text-white border border-gray-600 bg-inherit rounded-md h-fit pb-4 mt-4"
            >
              <h3 class="p-2 pt-4 text-xl font-semibold">Related Stocks</h3>
              <table class="table table-sm table-compact w-full text-white">
                <thead class="text-white"
                  ><tr
                    ><th
                      class="whitespace-nowrap border-b border-gray-600 font-semibold text-[1rem] text-left"
                      >Company</th
                    >
                    <th
                      class="whitespace-nowrap border-b border-gray-600 font-semibold text-[1rem] text-right"
                      >Market Cap</th
                    ></tr
                  ></thead
                >
                <tbody>
                  {#each similarStocks?.slice(0, 8) as item, index}
                    {#if item?.marketCap > 0}
                      <tr
                        class="border-gray-800 text-[1rem] {index !==
                        similarStocks?.slice(0, 8).length - 1
                          ? 'border-b'
                          : ''}"
                        ><td class="text-left text-[1rem]"
                          ><a
                            href={`/stocks/${item?.symbol}`}
                            class="sm:hover:text-white text-blue-400"
                            >{item?.symbol}</a
                          ></td
                        >
                        <td class="text-right cursor-normal text-[1rem]"
                          >{abbreviateNumber(item?.marketCap)}</td
                        >
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
              {#if capCategory}
                <a
                  href={capCategory?.link}
                  class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-[1rem] text-center font-semibold text-black m-auto sm:hover:bg-gray-300 bg-[#fff] transition duration-100"
                >
                  {capCategory?.name} Rankings
                </a>
              {/if}
            </div>
          {/if}
        </aside>
      </div>
    </div>
  </div>
</section>
